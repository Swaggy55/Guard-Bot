import { AuditLogEvent } from "discord.js";
import { getGuildConfig } from "../storage.js";
import { applyAction } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";
import { logger } from "../utils/logger.js";

const buckets = new Map();

function pushAction(guildId, userId, windowMs) {
  const key = `${guildId}:${userId}`;
  const now = Date.now();
  const arr = buckets.get(key) || [];
  arr.push(now);
  while (arr.length && now - arr[0] > windowMs) arr.shift();
  buckets.set(key, arr);
  return arr.length;
}

export async function handleWebhooksUpdate(channel) {
  const guild = channel.guild;
  const cfg = getGuildConfig(guild.id);
  if (!cfg.antiWebhook.enabled) return;

  let executor = null;
  let action = null;
  try {
    const audit = await guild.fetchAuditLogs({ limit: 5 });
    const entry = audit.entries.find((e) =>
      [
        AuditLogEvent.WebhookCreate,
        AuditLogEvent.WebhookUpdate,
        AuditLogEvent.WebhookDelete,
      ].includes(e.action),
    );
    if (entry) {
      executor = entry.executor;
      action = entry.action;
    }
  } catch {}

  if (!executor || executor.id === channel.client.user.id) return;
  if (executor.id === guild.ownerId) return;

  const count = pushAction(guild.id, executor.id, cfg.antiWebhook.windowMs);

  if (action === AuditLogEvent.WebhookCreate) {
    try {
      const hooks = await channel.fetchWebhooks();
      const created = hooks.find((h) => h.owner?.id === executor.id);
      if (created) await created.delete("Anti-webhook: auto-removed").catch(() => {});
    } catch (err) {
      logger.warn(`Webhook delete failed: ${err.message}`);
    }
  }

  if (count >= cfg.antiWebhook.threshold) {
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      const ok = await applyAction(member, cfg.antiWebhook.action, {
        reason: "Anti-webhook: spam",
      });
      await sendLog(guild, {
        type: "webhook",
        title: "Webhook Spam Blocked",
        description: `${executor} performed **${count}** webhook actions → \`${cfg.antiWebhook.action}\` ${ok ? "✓" : "✗"}`,
        user: executor,
      });
    }
  }

  await sendLog(guild, {
    type: "webhook",
    title: "Webhook Activity",
    description: `${executor ?? "unknown"} modified webhooks in ${channel}`,
  });
}

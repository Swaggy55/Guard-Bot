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

export async function handleRoleDelete(role) {
  const cfg = getGuildConfig(role.guild.id);
  if (!cfg.antiRoleDelete.enabled) return;

  let executor = null;
  try {
    const audit = await role.guild.fetchAuditLogs({
      type: AuditLogEvent.RoleDelete,
      limit: 3,
    });
    const entry = audit.entries.find((e) => e.target?.id === role.id);
    executor = entry?.executor;
  } catch {}

  if (!executor || executor.id === role.client.user.id) return;
  if (executor.id === role.guild.ownerId) return;

  const count = pushAction(role.guild.id, executor.id, cfg.antiRoleDelete.windowMs);

  if (count >= cfg.antiRoleDelete.threshold) {
    const member = await role.guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      const ok = await applyAction(member, cfg.antiRoleDelete.action, {
        reason: "Anti-nuke: rapid role deletion",
      });
      await sendLog(role.guild, {
        type: "role",
        title: "Role Nuke Attempt Blocked",
        description: `${executor} deleted **${count}** roles in \`${cfg.antiRoleDelete.windowMs / 1000}s\` → \`${cfg.antiRoleDelete.action}\` ${ok ? "✓" : "✗"}`,
        user: executor,
      });
    }
  }

  if (cfg.antiRoleDelete.restore) {
    try {
      await role.guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        mentionable: role.mentionable,
        permissions: role.permissions,
        reason: "Anti-nuke: restoring deleted role",
      });
    } catch (err) {
      logger.warn(`Failed to restore role: ${err.message}`);
    }
  }

  await sendLog(role.guild, {
    type: "role",
    title: "Role Deleted",
    description: `\`@${role.name}\` was deleted by ${executor ?? "unknown"}`,
    fields: [{ name: "Restored", value: cfg.antiRoleDelete.restore ? "Yes" : "No", inline: true }],
  });
}

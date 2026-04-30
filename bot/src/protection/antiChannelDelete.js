import { AuditLogEvent, ChannelType, OverwriteType } from "discord.js";
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

export async function handleChannelDelete(channel) {
  if (!channel.guild) return;
  const cfg = getGuildConfig(channel.guild.id);
  if (!cfg.antiChannelDelete.enabled) return;

  let executor = null;
  try {
    const audit = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelDelete,
      limit: 3,
    });
    const entry = audit.entries.find((e) => e.target?.id === channel.id);
    executor = entry?.executor;
  } catch {}

  if (!executor || executor.id === channel.client.user.id) return;
  if (executor.id === channel.guild.ownerId) return;

  const count = pushAction(channel.guild.id, executor.id, cfg.antiChannelDelete.windowMs);

  if (count >= cfg.antiChannelDelete.threshold) {
    const member = await channel.guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      const ok = await applyAction(member, cfg.antiChannelDelete.action, {
        reason: "Anti-nuke: rapid channel deletion",
      });
      await sendLog(channel.guild, {
        type: "channel",
        title: "Channel Nuke Attempt Blocked",
        description: `${executor} deleted **${count}** channels in \`${cfg.antiChannelDelete.windowMs / 1000}s\` → \`${cfg.antiChannelDelete.action}\` ${ok ? "✓" : "✗"}`,
        user: executor,
      });
    }
  }

  if (cfg.antiChannelDelete.restore) {
    await restoreChannel(channel).catch((err) =>
      logger.warn(`Failed to restore channel: ${err.message}`),
    );
  }

  await sendLog(channel.guild, {
    type: "channel",
    title: "Channel Deleted",
    description: `\`#${channel.name}\` was deleted by ${executor ?? "unknown"}`,
    fields: [
      { name: "Type", value: `${ChannelType[channel.type] ?? channel.type}`, inline: true },
      { name: "Restored", value: cfg.antiChannelDelete.restore ? "Yes" : "No", inline: true },
    ],
  });
}

async function restoreChannel(channel) {
  const overwrites = channel.permissionOverwrites?.cache?.map((o) => ({
    id: o.id,
    type: o.type === OverwriteType.Role ? OverwriteType.Role : OverwriteType.Member,
    allow: o.allow.bitfield,
    deny: o.deny.bitfield,
  })) ?? [];

  const recreated = await channel.guild.channels.create({
    name: channel.name,
    type: channel.type,
    parent: channel.parentId ?? undefined,
    topic: channel.topic ?? undefined,
    nsfw: channel.nsfw ?? undefined,
    bitrate: channel.bitrate ?? undefined,
    userLimit: channel.userLimit ?? undefined,
    rateLimitPerUser: channel.rateLimitPerUser ?? undefined,
    position: channel.position ?? undefined,
    permissionOverwrites: overwrites,
    reason: "Anti-nuke: restoring deleted channel",
  });

  if (recreated.isTextBased()) {
    await recreated
      .send({
        content: `🛡️ This channel was restored by **Aegis Protection** after being deleted.`,
      })
      .catch(() => {});
  }
}

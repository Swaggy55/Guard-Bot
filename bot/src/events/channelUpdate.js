import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

function diff(oldCh, newCh) {
  const changes = [];
  if (oldCh.name !== newCh.name) changes.push(`**Name:** \`${oldCh.name}\` → \`${newCh.name}\``);
  if (oldCh.topic !== newCh.topic)
    changes.push(`**Topic:** \`${oldCh.topic ?? "—"}\` → \`${newCh.topic ?? "—"}\``);
  if (oldCh.nsfw !== newCh.nsfw) changes.push(`**NSFW:** \`${oldCh.nsfw}\` → \`${newCh.nsfw}\``);
  if (oldCh.parentId !== newCh.parentId) changes.push(`**Category:** changed`);
  if (oldCh.rateLimitPerUser !== newCh.rateLimitPerUser)
    changes.push(`**Slowmode:** \`${oldCh.rateLimitPerUser ?? 0}s\` → \`${newCh.rateLimitPerUser ?? 0}s\``);
  return changes;
}

export default {
  name: Events.ChannelUpdate,
  async execute(oldCh, newCh) {
    if (!newCh.guild) return;
    const changes = diff(oldCh, newCh);
    if (!changes.length) return;
    const { executor } = await findExecutor(
      newCh.guild,
      AuditLogEvent.ChannelUpdate,
      (e) => e.target?.id === newCh.id,
    );
    await sendLog(newCh.guild, {
      type: "channel_update",
      title: "Channel Updated",
      description: `${newCh} edited by ${fmtUser(executor)}\n\n${changes.join("\n")}`,
    });
  },
};

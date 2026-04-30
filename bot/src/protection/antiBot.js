import { AuditLogEvent } from "discord.js";
import { getGuildConfig } from "../storage.js";
import { applyAction } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";

export async function handleBotJoin(member) {
  if (!member.user.bot) return false;
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.antiBot.enabled) return false;

  let inviter = null;
  try {
    const audit = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.BotAdd,
      limit: 5,
    });
    inviter = audit.entries.find((e) => e.target?.id === member.id)?.executor;
  } catch {}

  if (inviter && inviter.id === member.guild.ownerId) return false;

  const ok = await applyAction(member, cfg.antiBot.action, {
    reason: "Anti-bot: unauthorized bot add",
  });

  await sendLog(member.guild, {
    type: "bot",
    title: "Unauthorized Bot Blocked",
    description: `${member} added by ${inviter ? `${inviter}` : "unknown"} → \`${cfg.antiBot.action}\` ${ok ? "✓" : "✗"}`,
    target: member.user,
  });

  return true;
}

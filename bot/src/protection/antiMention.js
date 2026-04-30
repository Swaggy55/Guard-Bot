import { getGuildConfig } from "../storage.js";
import { isImmune } from "../utils/permissions.js";
import { applyAction, issueWarning } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";

export async function handleMassMention(message) {
  if (!message.guild || !message.member) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.antiMention.enabled) return false;
  if (isImmune(message.member)) return false;

  const userMentions = message.mentions.users.size;
  const roleMentions = message.mentions.roles.size;
  const everyone = message.mentions.everyone ? 1 : 0;
  const total = userMentions + roleMentions + everyone;

  if (total < cfg.antiMention.maxMentions) return false;

  await message.delete().catch(() => {});
  await applyAction(message.member, cfg.antiMention.action, {
    reason: "Anti-mention: mass mention",
    durationMs: cfg.antiMention.timeoutMs,
  });
  await issueWarning(message.guild, message.author, message.client.user, "Mass mention spam");

  await sendLog(message.guild, {
    type: "mention",
    title: "Mass Mention Blocked",
    description: `${message.author} mentioned **${total}** entities`,
    fields: [
      { name: "Action", value: cfg.antiMention.action, inline: true },
      { name: "Channel", value: `${message.channel}`, inline: true },
    ],
    target: message.author,
  });

  return true;
}

import { getGuildConfig } from "../storage.js";
import { isImmune } from "../utils/permissions.js";
import { applyAction, issueWarning } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";

const userBuckets = new Map();

function bucketKey(g, u) {
  return `${g}:${u}`;
}

export async function handleMessageSpam(message) {
  if (!message.guild || !message.member) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.antiSpam.enabled) return false;
  if (isImmune(message.member)) return false;

  const key = bucketKey(message.guild.id, message.author.id);
  const now = Date.now();
  const list = userBuckets.get(key) || [];
  list.push({ t: now, content: message.content });
  while (list.length && now - list[0].t > cfg.antiSpam.windowMs) list.shift();
  userBuckets.set(key, list);

  const tooMany = list.length >= cfg.antiSpam.messageThreshold;
  const dupCount = list.filter(
    (m) => m.content && m.content === message.content,
  ).length;
  const tooManyDuplicates = dupCount >= cfg.antiSpam.duplicateThreshold;

  if (!tooMany && !tooManyDuplicates) return false;

  userBuckets.delete(key);

  await message.channel
    .bulkDelete(
      (await message.channel.messages.fetch({ limit: 30 }).catch(() => null))
        ?.filter((m) => m.author.id === message.author.id) ?? [],
      true,
    )
    .catch(() => {});

  const reason = tooManyDuplicates ? "Duplicate spam" : "Message flood";
  await applyAction(message.member, cfg.antiSpam.action, {
    reason: `Anti-spam: ${reason}`,
    durationMs: cfg.antiSpam.timeoutMs,
  });
  await issueWarning(message.guild, message.author, message.client.user, `Anti-spam: ${reason}`);

  await sendLog(message.guild, {
    type: "spam",
    title: "Spam Detected",
    description: `${message.author} → \`${cfg.antiSpam.action}\` (${reason})`,
    fields: [{ name: "Channel", value: `${message.channel}`, inline: true }],
    target: message.author,
  });

  return true;
}

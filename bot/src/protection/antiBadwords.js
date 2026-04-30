import { getGuildConfig } from "../storage.js";
import { isImmune } from "../utils/permissions.js";
import { applyAction, issueWarning } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const cache = new Map();
function regexFor(words) {
  const key = words.join("|");
  if (cache.has(key)) return cache.get(key);
  if (!words.length) {
    cache.set(key, null);
    return null;
  }
  const re = new RegExp(
    `\\b(?:${words.map(escape).join("|")})\\b`,
    "i",
  );
  cache.set(key, re);
  return re;
}

export async function handleBadWords(message) {
  if (!message.guild || !message.member) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.antiBadwords.enabled) return false;
  if (isImmune(message.member)) return false;
  if (!message.content) return false;

  const re = regexFor(cfg.antiBadwords.words);
  if (!re) return false;

  const match = message.content.match(re);
  if (!match) return false;

  await message.delete().catch(() => {});

  if (cfg.antiBadwords.action !== "delete") {
    await applyAction(message.member, cfg.antiBadwords.action, {
      reason: `Bad word: ${match[0]}`,
      durationMs: 10 * 60_000,
    });
  }
  await issueWarning(
    message.guild,
    message.author,
    message.client.user,
    `Used filtered word: \`${match[0]}\``,
  );

  await sendLog(message.guild, {
    type: "badword",
    title: "Bad Word Filter",
    description: `${message.author} used a filtered word in ${message.channel}`,
    fields: [{ name: "Word", value: `||${match[0]}||`, inline: true }],
    target: message.author,
  });

  return true;
}

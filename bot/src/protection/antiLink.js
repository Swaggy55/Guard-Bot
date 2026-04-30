import { getGuildConfig } from "../storage.js";
import { isImmune } from "../utils/permissions.js";
import { applyAction, issueWarning } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";

const URL_RE = /\bhttps?:\/\/[^\s<>"'`]+/gi;
const INVITE_RE = /(?:discord\.gg|discord(?:app)?\.com\/invite)\/[a-z0-9-]+/gi;

function hostFrom(u) {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function handleLinkSpam(message) {
  if (!message.guild || !message.member) return false;
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.antiLink.enabled) return false;
  if (isImmune(message.member)) return false;
  if (!message.content) return false;

  const urls = message.content.match(URL_RE) || [];
  const invites = message.content.match(INVITE_RE) || [];

  if (urls.length === 0 && invites.length === 0) return false;

  const offending = [];
  for (const u of urls) {
    const host = hostFrom(u);
    if (!host) continue;
    const allowed = cfg.antiLink.whitelist.some(
      (w) => host === w.toLowerCase() || host.endsWith("." + w.toLowerCase()),
    );
    if (!allowed) offending.push(u);
  }

  const blockInvite = !cfg.antiLink.allowDiscordInvites && invites.length > 0;

  if (offending.length === 0 && !blockInvite) return false;

  await message.delete().catch(() => {});

  if (cfg.antiLink.action !== "delete") {
    await applyAction(message.member, cfg.antiLink.action, {
      reason: "Anti-link",
      durationMs: 10 * 60_000,
    });
  }
  await issueWarning(
    message.guild,
    message.author,
    message.client.user,
    blockInvite ? "Posted a Discord invite" : "Posted unauthorized link",
  );

  await sendLog(message.guild, {
    type: "link",
    title: "Link Blocked",
    description: `${message.author} posted ${blockInvite ? "a Discord invite" : "a non-whitelisted link"}`,
    fields: [
      { name: "Channel", value: `${message.channel}`, inline: true },
      { name: "Action", value: cfg.antiLink.action, inline: true },
    ],
    target: message.author,
  });

  return true;
}

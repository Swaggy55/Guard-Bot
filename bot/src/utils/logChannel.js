import { getGuildConfig } from "../storage.js";
import { baseEmbed } from "./embeds.js";
import { BRAND } from "../config.js";
import { logger } from "./logger.js";

const COLOR_BY_TYPE = {
  info: BRAND.color,
  success: BRAND.successColor,
  warn: BRAND.warnColor,
  error: BRAND.errorColor,
  raid: 0xff5555,
  spam: 0xff9966,
  mention: 0xff9966,
  link: 0xffaa00,
  badword: 0xff66cc,
  bot: 0x9966ff,
  channel: 0xff3366,
  channel_create: 0x57f287,
  channel_update: 0x5865f2,
  role: 0xff3366,
  role_create: 0x57f287,
  role_update: 0x5865f2,
  webhook: 0xcc66ff,
  member_join: 0x57f287,
  member_leave: 0xff9966,
  member_kick: 0xed4245,
  member_ban: 0xed4245,
  member_unban: 0x57f287,
  member_update: 0x5865f2,
  emoji: 0xfee75c,
  invite: 0x5865f2,
  guild_update: 0x5865f2,
  warn_user: 0xfee75c,
  mute: 0xfee75c,
  timeout: 0xfee75c,
  kick: 0xed4245,
  ban: 0xed4245,
};

const ownerDmThrottle = new Map();
const ownerDmDisabled = new Set();

function buildEmbed({ type, title, description, fields = [], user, target }) {
  const embed = baseEmbed()
    .setColor(COLOR_BY_TYPE[type] ?? BRAND.color)
    .setTitle(title)
    .setDescription(description ?? null);
  if (fields.length) embed.addFields(fields);
  if (user) embed.setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL?.() });
  if (target) embed.setThumbnail(target.displayAvatarURL?.() ?? null);
  return embed;
}

async function dmOwner(guild, embed) {
  const cfg = getGuildConfig(guild.id);
  if (!cfg.ownerAlerts?.enabled) return;
  if (ownerDmDisabled.has(guild.id)) return;

  const now = Date.now();
  const last = ownerDmThrottle.get(guild.id) ?? 0;
  if (now - last < (cfg.ownerAlerts.minThrottleMs ?? 1500)) return;
  ownerDmThrottle.set(guild.id, now);

  try {
    const owner = await guild.fetchOwner();
    if (!owner) return;
    const ownerEmbed = baseEmbed()
      .setColor(embed.data.color ?? BRAND.color)
      .setTitle(embed.data.title ?? "Server Activity")
      .setDescription(
        `📡 Activity in **${guild.name}**\n\n${embed.data.description ?? ""}`,
      )
      .setFooter({ text: `${BRAND.footer} • ${guild.name} (${guild.id})` });
    if (embed.data.fields?.length) ownerEmbed.addFields(embed.data.fields);
    if (embed.data.author) ownerEmbed.setAuthor(embed.data.author);
    if (embed.data.thumbnail) ownerEmbed.setThumbnail(embed.data.thumbnail.url);
    await owner.send({ embeds: [ownerEmbed] });
  } catch (err) {
    if (err.code === 50007) {
      ownerDmDisabled.add(guild.id);
      logger.warn(`Owner of ${guild.name} has DMs closed — owner alerts disabled for this session`);
    } else {
      logger.warn(`Owner DM failed (${guild.name}): ${err.message}`);
    }
  }
}

export async function sendLog(guild, payload) {
  try {
    const embed = buildEmbed(payload);
    const cfg = getGuildConfig(guild.id);

    if (cfg.logsChannelId) {
      const channel = guild.channels.cache.get(cfg.logsChannelId);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [embed] });
      }
    }

    if (payload.dmOwner !== false) {
      await dmOwner(guild, embed);
    }
  } catch (err) {
    logger.error("Failed to send log:", err.message);
  }
}

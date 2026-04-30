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
  role: 0xff3366,
  webhook: 0xcc66ff,
  warn_user: 0xfee75c,
  mute: 0xfee75c,
  timeout: 0xfee75c,
  kick: 0xed4245,
  ban: 0xed4245,
};

export async function sendLog(guild, { type = "info", title, description, fields = [], user, target }) {
  try {
    const cfg = getGuildConfig(guild.id);
    if (!cfg.logsChannelId) return;
    const channel = guild.channels.cache.get(cfg.logsChannelId);
    if (!channel || !channel.isTextBased()) return;

    const embed = baseEmbed()
      .setColor(COLOR_BY_TYPE[type] ?? BRAND.color)
      .setTitle(title)
      .setDescription(description ?? null);

    if (fields.length) embed.addFields(fields);
    if (user) embed.setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL?.() });
    if (target) embed.setThumbnail(target.displayAvatarURL?.() ?? null);

    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.error("Failed to send log:", err.message);
  }
}

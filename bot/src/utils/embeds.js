import { EmbedBuilder } from "discord.js";
import { BRAND } from "../config.js";

export function baseEmbed() {
  return new EmbedBuilder()
    .setColor(BRAND.color)
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}

export function successEmbed(title, description) {
  return baseEmbed()
    .setColor(BRAND.successColor)
    .setTitle(`✓ ${title}`)
    .setDescription(description ?? null);
}

export function errorEmbed(title, description) {
  return baseEmbed()
    .setColor(BRAND.errorColor)
    .setTitle(`✗ ${title}`)
    .setDescription(description ?? null);
}

export function warnEmbed(title, description) {
  return baseEmbed()
    .setColor(BRAND.warnColor)
    .setTitle(`⚠ ${title}`)
    .setDescription(description ?? null);
}

export function infoEmbed(title, description) {
  return baseEmbed().setTitle(title).setDescription(description ?? null);
}

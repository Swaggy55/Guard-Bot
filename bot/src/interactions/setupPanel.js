import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  RoleSelectMenuBuilder,
} from "discord.js";
import { BRAND } from "../config.js";
import { getGuildConfig } from "../storage.js";

const STATUS = (b) => (b ? "🟢 ON" : "🔴 OFF");

export function buildSetupPanel(guild) {
  const cfg = getGuildConfig(guild.id);

  const embed = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle(`🛡️ ${BRAND.name} • Setup`)
    .setDescription(
      [
        `Configure protection for **${guild.name}**.`,
        `Use the buttons to toggle modules. Use the menus to set the **logs channel** and **mute role**.`,
        "",
        `**Prefix:** \`${cfg.prefix}\``,
        `**Logs Channel:** ${cfg.logsChannelId ? `<#${cfg.logsChannelId}>` : "_not set_"}`,
        `**Mute Role:** ${cfg.muteRoleId ? `<@&${cfg.muteRoleId}>` : "_not set_"}`,
      ].join("\n"),
    )
    .addFields(
      { name: "Anti-Raid", value: STATUS(cfg.antiRaid.enabled), inline: true },
      { name: "Anti-Spam", value: STATUS(cfg.antiSpam.enabled), inline: true },
      { name: "Anti-Mention", value: STATUS(cfg.antiMention.enabled), inline: true },
      { name: "Anti-Link", value: STATUS(cfg.antiLink.enabled), inline: true },
      { name: "Anti-Badwords", value: STATUS(cfg.antiBadwords.enabled), inline: true },
      { name: "Anti-Bot", value: STATUS(cfg.antiBot.enabled), inline: true },
      { name: "Anti-Channel Delete", value: STATUS(cfg.antiChannelDelete.enabled), inline: true },
      { name: "Anti-Role Delete", value: STATUS(cfg.antiRoleDelete.enabled), inline: true },
      { name: "Anti-Webhook", value: STATUS(cfg.antiWebhook.enabled), inline: true },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiRaid")
      .setLabel("Anti-Raid")
      .setStyle(cfg.antiRaid.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiSpam")
      .setLabel("Anti-Spam")
      .setStyle(cfg.antiSpam.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiMention")
      .setLabel("Anti-Mention")
      .setStyle(cfg.antiMention.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiLink")
      .setLabel("Anti-Link")
      .setStyle(cfg.antiLink.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiBadwords")
      .setLabel("Anti-Badwords")
      .setStyle(cfg.antiBadwords.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiBot")
      .setLabel("Anti-Bot")
      .setStyle(cfg.antiBot.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiChannelDelete")
      .setLabel("Anti-Channel")
      .setStyle(cfg.antiChannelDelete.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiRoleDelete")
      .setLabel("Anti-Role")
      .setStyle(cfg.antiRoleDelete.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:toggle:antiWebhook")
      .setLabel("Anti-Webhook")
      .setStyle(cfg.antiWebhook.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("setup:enableAll")
      .setLabel("Enable All")
      .setStyle(ButtonStyle.Primary),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId("setup:logsChannel")
      .setPlaceholder("Select logs channel")
      .setChannelTypes(ChannelType.GuildText)
      .setMinValues(1)
      .setMaxValues(1),
  );

  const row4 = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId("setup:muteRole")
      .setPlaceholder("Select mute role (optional)")
      .setMinValues(1)
      .setMaxValues(1),
  );

  return { embeds: [embed], components: [row1, row2, row3, row4] };
}

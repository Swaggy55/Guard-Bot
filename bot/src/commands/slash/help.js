import { SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../../utils/embeds.js";
import { BRAND } from "../../config.js";
import { getGuildConfig } from "../../storage.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands and features"),
  async execute({ interaction }) {
    const cfg = getGuildConfig(interaction.guildId);
    const embed = baseEmbed()
      .setTitle(`${BRAND.name} • Help`)
      .setDescription(
        `A modern Discord protection suite. Prefix: \`${cfg.prefix}\``,
      )
      .addFields(
        {
          name: "Setup",
          value:
            "`/setup` — open the interactive setup panel\n" +
            "`/config view` — view current settings\n" +
            "`/config set <module> <field> <value>` — tweak any setting",
        },
        {
          name: "Moderation",
          value:
            "`/warn`, `/warnings`, `/clearwarns`\n" +
            "`/mute`, `/unmute`, `/timeout`\n" +
            "`/kick`, `/ban`",
        },
        {
          name: "Protection Modules",
          value:
            "Anti-Raid · Anti-Spam · Anti-Mention · Anti-Link\n" +
            "Anti-Badwords · Anti-Bot · Anti-Channel/Role Delete\n" +
            "Anti-Webhook · Auto-restore",
        },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

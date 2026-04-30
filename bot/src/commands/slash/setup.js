import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { buildSetupPanel } from "../../interactions/setupPanel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Open the interactive setup panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute({ interaction }) {
    const payload = buildSetupPanel(interaction.guild);
    await interaction.reply({ ...payload, ephemeral: true });
  },
};

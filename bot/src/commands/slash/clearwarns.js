import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { clearWarnings } from "../../storage.js";
import { successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clear all warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member").setRequired(true),
    ),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    clearWarnings(interaction.guildId, user.id);

    await sendLog(interaction.guild, {
      type: "info",
      title: "Warnings Cleared",
      description: `${interaction.user} cleared warnings for ${user}`,
      target: user,
    });

    await interaction.reply({
      embeds: [successEmbed("Cleared", `All warnings for ${user} were removed.`)],
    });
  },
};

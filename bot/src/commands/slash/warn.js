import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { issueWarning } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member to warn").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason").setRequired(false),
    ),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (user.bot || user.id === interaction.user.id) {
      await interaction.reply({
        embeds: [errorEmbed("Invalid target", "You can't warn that user")],
        ephemeral: true,
      });
      return;
    }

    const { total } = await issueWarning(interaction.guild, user, interaction.user, reason);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Member Warned",
          `${user} now has **${total}** warning(s).\n**Reason:** ${reason}`,
        ),
      ],
    });
  },
};

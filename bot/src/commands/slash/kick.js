import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { kickMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member").setRequired(true),
    )
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        embeds: [errorEmbed("Not found", "User isn't in this server")],
        ephemeral: true,
      });
      return;
    }
    const ok = await kickMember(member, reason);
    if (!ok) {
      await interaction.reply({
        embeds: [errorEmbed("Failed", "I cannot kick that user")],
        ephemeral: true,
      });
      return;
    }
    await sendLog(interaction.guild, {
      type: "kick",
      title: "Member Kicked",
      description: `${user.tag} was kicked by ${interaction.user}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await interaction.reply({
      embeds: [successEmbed("Kicked", `${user.tag} was removed.\n**Reason:** ${reason}`)],
    });
  },
};

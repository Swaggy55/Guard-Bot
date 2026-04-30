import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { muteMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member (uses mute role or 1h timeout)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
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
    const ok = await muteMember(member, reason);
    if (!ok) {
      await interaction.reply({
        embeds: [errorEmbed("Failed", "I lack permission to mute that user")],
        ephemeral: true,
      });
      return;
    }
    await sendLog(interaction.guild, {
      type: "mute",
      title: "Member Muted",
      description: `${user} was muted by ${interaction.user}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await interaction.reply({
      embeds: [successEmbed("Muted", `${user} was muted.\n**Reason:** ${reason}`)],
    });
  },
};

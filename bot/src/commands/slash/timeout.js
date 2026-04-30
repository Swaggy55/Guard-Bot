import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { timeoutMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member for N minutes")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member").setRequired(true),
    )
    .addIntegerOption((o) =>
      o
        .setName("minutes")
        .setDescription("Duration in minutes (max 40320 = 28 days)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320),
    )
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    const minutes = interaction.options.getInteger("minutes", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        embeds: [errorEmbed("Not found", "User isn't in this server")],
        ephemeral: true,
      });
      return;
    }
    const ok = await timeoutMember(member, minutes * 60_000, reason);
    if (!ok) {
      await interaction.reply({
        embeds: [errorEmbed("Failed", "I lack permission to timeout that user")],
        ephemeral: true,
      });
      return;
    }
    await sendLog(interaction.guild, {
      type: "timeout",
      title: "Member Timed Out",
      description: `${user} was timed out for **${minutes}m** by ${interaction.user}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await interaction.reply({
      embeds: [
        successEmbed("Timed Out", `${user} for **${minutes} minutes**.\n**Reason:** ${reason}`),
      ],
    });
  },
};

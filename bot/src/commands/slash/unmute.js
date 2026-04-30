import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getGuildConfig } from "../../storage.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member").setRequired(true),
    ),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        embeds: [errorEmbed("Not found", "User isn't in this server")],
        ephemeral: true,
      });
      return;
    }
    const cfg = getGuildConfig(interaction.guildId);
    let action = false;
    if (cfg.muteRoleId && member.roles.cache.has(cfg.muteRoleId)) {
      await member.roles.remove(cfg.muteRoleId, "Manual unmute").catch(() => {});
      action = true;
    }
    if (member.communicationDisabledUntilTimestamp) {
      await member.timeout(null, "Manual unmute").catch(() => {});
      action = true;
    }
    if (!action) {
      await interaction.reply({
        embeds: [errorEmbed("Nothing to do", "User isn't muted")],
        ephemeral: true,
      });
      return;
    }
    await sendLog(interaction.guild, {
      type: "info",
      title: "Member Unmuted",
      description: `${user} was unmuted by ${interaction.user}`,
      target: user,
    });
    await interaction.reply({
      embeds: [successEmbed("Unmuted", `${user} can speak again.`)],
    });
  },
};

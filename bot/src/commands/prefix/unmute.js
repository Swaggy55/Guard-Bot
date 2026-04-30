import { PermissionsBitField } from "discord.js";
import { getGuildConfig } from "../../storage.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "unmute",
  description: "Unmute a member",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `unmute @user`")] });
      return;
    }
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply({ embeds: [errorEmbed("Not found", "User isn't in this server")] });
      return;
    }
    const cfg = getGuildConfig(message.guild.id);
    let acted = false;
    if (cfg.muteRoleId && member.roles.cache.has(cfg.muteRoleId)) {
      await member.roles.remove(cfg.muteRoleId, "Manual unmute").catch(() => {});
      acted = true;
    }
    if (member.communicationDisabledUntilTimestamp) {
      await member.timeout(null, "Manual unmute").catch(() => {});
      acted = true;
    }
    if (!acted) {
      await message.reply({ embeds: [errorEmbed("Nothing to do", "User isn't muted")] });
      return;
    }
    await sendLog(message.guild, {
      type: "info",
      title: "Member Unmuted",
      description: `${user} was unmuted by ${message.author}`,
      target: user,
    });
    await message.reply({ embeds: [successEmbed("Unmuted", `${user} can speak again.`)] });
  },
};

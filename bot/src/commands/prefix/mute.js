import { PermissionsBitField } from "discord.js";
import { muteMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "mute",
  description: "Mute a member",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `mute @user [reason]`")] });
      return;
    }
    const reason = args.slice(1).join(" ") || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply({ embeds: [errorEmbed("Not found", "User isn't in this server")] });
      return;
    }
    const ok = await muteMember(member, reason);
    if (!ok) {
      await message.reply({ embeds: [errorEmbed("Failed", "I lack permission to mute that user")] });
      return;
    }
    await sendLog(message.guild, {
      type: "mute",
      title: "Member Muted",
      description: `${user} was muted by ${message.author}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await message.reply({ embeds: [successEmbed("Muted", `${user} muted.\n**Reason:** ${reason}`)] });
  },
};

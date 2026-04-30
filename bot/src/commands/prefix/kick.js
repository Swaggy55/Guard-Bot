import { PermissionsBitField } from "discord.js";
import { kickMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "kick",
  description: "Kick a member",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Kick Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `kick @user [reason]`")] });
      return;
    }
    const reason = args.slice(1).join(" ") || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply({ embeds: [errorEmbed("Not found", "User isn't in this server")] });
      return;
    }
    const ok = await kickMember(member, reason);
    if (!ok) {
      await message.reply({ embeds: [errorEmbed("Failed", "I cannot kick that user")] });
      return;
    }
    await sendLog(message.guild, {
      type: "kick",
      title: "Member Kicked",
      description: `${user.tag} was kicked by ${message.author}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await message.reply({ embeds: [successEmbed("Kicked", `${user.tag} removed.\n**Reason:** ${reason}`)] });
  },
};

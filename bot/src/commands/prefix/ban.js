import { PermissionsBitField } from "discord.js";
import { banMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "ban",
  description: "Ban a member",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Ban Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `ban @user [reason]`")] });
      return;
    }
    const reason = args.slice(1).join(" ") || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply({ embeds: [errorEmbed("Not found", "User isn't in this server")] });
      return;
    }
    const ok = await banMember(member, reason);
    if (!ok) {
      await message.reply({ embeds: [errorEmbed("Failed", "I cannot ban that user")] });
      return;
    }
    await sendLog(message.guild, {
      type: "ban",
      title: "Member Banned",
      description: `${user.tag} was banned by ${message.author}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await message.reply({ embeds: [successEmbed("Banned", `${user.tag} banned.\n**Reason:** ${reason}`)] });
  },
};

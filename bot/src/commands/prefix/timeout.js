import { PermissionsBitField } from "discord.js";
import { timeoutMember } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "timeout",
  aliases: ["to"],
  description: "Timeout a member for N minutes",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first();
    const minutes = Number.parseInt(args[1], 10);
    if (!user || !Number.isFinite(minutes) || minutes <= 0) {
      await message.reply({
        embeds: [errorEmbed("Bad input", "Usage: `timeout @user <minutes> [reason]`")],
      });
      return;
    }
    const reason = args.slice(2).join(" ") || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await message.reply({ embeds: [errorEmbed("Not found", "User isn't in this server")] });
      return;
    }
    const ok = await timeoutMember(member, Math.min(minutes, 40320) * 60_000, reason);
    if (!ok) {
      await message.reply({ embeds: [errorEmbed("Failed", "I lack permission to timeout that user")] });
      return;
    }
    await sendLog(message.guild, {
      type: "timeout",
      title: "Member Timed Out",
      description: `${user} was timed out for **${minutes}m** by ${message.author}`,
      fields: [{ name: "Reason", value: reason }],
      target: user,
    });
    await message.reply({
      embeds: [successEmbed("Timed Out", `${user} for **${minutes}m**.\n**Reason:** ${reason}`)],
    });
  },
};

import { PermissionsBitField } from "discord.js";
import { issueWarning } from "../../utils/moderate.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";

export default {
  name: "warn",
  description: "Warn a member",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `warn @user [reason]`")] });
      return;
    }
    const reason = args.slice(1).join(" ") || "No reason provided";
    const { total } = await issueWarning(message.guild, user, message.author, reason);
    await message.reply({
      embeds: [successEmbed("Warned", `${user} now has **${total}** warning(s).\n**Reason:** ${reason}`)],
    });
  },
};

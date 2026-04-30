import { PermissionsBitField } from "discord.js";
import { clearWarnings } from "../../storage.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "clearwarns",
  aliases: ["clearwarnings", "resetwarns"],
  description: "Clear warnings for a member",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply({ embeds: [errorEmbed("Missing user", "Usage: `clearwarns @user`")] });
      return;
    }
    clearWarnings(message.guild.id, user.id);
    await sendLog(message.guild, {
      type: "info",
      title: "Warnings Cleared",
      description: `${message.author} cleared warnings for ${user}`,
      target: user,
    });
    await message.reply({ embeds: [successEmbed("Cleared", `All warnings for ${user} were removed.`)] });
  },
};

import { PermissionsBitField } from "discord.js";
import { getWarnings } from "../../storage.js";
import { baseEmbed, errorEmbed, infoEmbed } from "../../utils/embeds.js";

export default {
  name: "warnings",
  aliases: ["warns"],
  description: "Show warnings for a member",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Moderate Members")] });
      return;
    }
    const user = message.mentions.users.first() || message.author;
    const list = getWarnings(message.guild.id, user.id);

    if (!list.length) {
      await message.reply({ embeds: [infoEmbed("No warnings", `${user} has a clean record.`)] });
      return;
    }

    const embed = baseEmbed()
      .setTitle(`Warnings for ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`Total: **${list.length}**`)
      .addFields(
        list.slice(-10).map((w, i) => ({
          name: `#${list.length - Math.min(10, list.length) + i + 1} • <t:${Math.floor(w.timestamp / 1000)}:R>`,
          value: `**Reason:** ${w.reason}\n**By:** ${w.moderatorTag}`,
        })),
      );

    await message.reply({ embeds: [embed] });
  },
};

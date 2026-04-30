import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getWarnings } from "../../storage.js";
import { baseEmbed, infoEmbed } from "../../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("Member").setRequired(true),
    ),
  async execute({ interaction }) {
    const user = interaction.options.getUser("user", true);
    const list = getWarnings(interaction.guildId, user.id);

    if (!list.length) {
      await interaction.reply({
        embeds: [infoEmbed("No warnings", `${user} has a clean record.`)],
        ephemeral: true,
      });
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

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

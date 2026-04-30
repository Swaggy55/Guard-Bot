import { PermissionsBitField } from "discord.js";
import { setGuildField } from "../../storage.js";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";

export default {
  name: "prefix",
  description: "Change the command prefix",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await message.reply({
        embeds: [errorEmbed("Permission denied", "You need Manage Server")],
      });
      return;
    }
    if (!args[0] || args[0].length > 5) {
      await message.reply({
        embeds: [errorEmbed("Bad input", "Provide a prefix up to 5 characters")],
      });
      return;
    }
    setGuildField(message.guild.id, "prefix", args[0]);
    await message.reply({
      embeds: [successEmbed("Prefix updated", `New prefix: \`${args[0]}\``)],
    });
  },
};

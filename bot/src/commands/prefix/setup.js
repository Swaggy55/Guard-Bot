import { PermissionsBitField } from "discord.js";
import { buildSetupPanel } from "../../interactions/setupPanel.js";
import { errorEmbed } from "../../utils/embeds.js";

export default {
  name: "setup",
  description: "Open the interactive setup panel",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await message.reply({
        embeds: [errorEmbed("Permission denied", "You need Manage Server")],
      });
      return;
    }
    const payload = buildSetupPanel(message.guild);
    await message.reply(payload);
  },
};

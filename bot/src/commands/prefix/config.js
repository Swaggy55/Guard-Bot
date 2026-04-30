import { PermissionsBitField } from "discord.js";
import { getGuildConfig, setGuildField } from "../../storage.js";
import { baseEmbed, errorEmbed, successEmbed } from "../../utils/embeds.js";

export default {
  name: "config",
  aliases: ["settings", "cfg"],
  description: "View or change configuration",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await message.reply({
        embeds: [errorEmbed("Permission denied", "You need Manage Server")],
      });
      return;
    }

    const cfg = getGuildConfig(message.guild.id);

    if (args.length === 0) {
      const json = JSON.stringify(cfg, null, 2);
      const trimmed = json.length > 3500 ? json.slice(0, 3500) + "\n…" : json;
      const embed = baseEmbed()
        .setTitle("Current Configuration")
        .setDescription(`\`\`\`json\n${trimmed}\n\`\`\``);
      await message.reply({ embeds: [embed] });
      return;
    }

    if (args[0] === "prefix" && args[1]) {
      setGuildField(message.guild.id, "prefix", args[1]);
      await message.reply({
        embeds: [successEmbed("Prefix updated", `New prefix: \`${args[1]}\``)],
      });
      return;
    }

    await message.reply({
      embeds: [
        errorEmbed(
          "Tip",
          "Use `/config set <field> <value>` for full editing, or the setup panel.",
        ),
      ],
    });
  },
};

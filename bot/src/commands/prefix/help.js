import { baseEmbed } from "../../utils/embeds.js";
import { BRAND } from "../../config.js";
import { getGuildConfig } from "../../storage.js";

export default {
  name: "help",
  aliases: ["h", "commands"],
  description: "Show available prefix commands",
  async execute({ message }) {
    const cfg = getGuildConfig(message.guild.id);
    const p = cfg.prefix;
    const embed = baseEmbed()
      .setTitle(`${BRAND.name} • Prefix Commands`)
      .setDescription(`Prefix: \`${p}\`. Slash commands also available.`)
      .addFields(
        {
          name: "Setup",
          value: `\`${p}setup\` — open setup panel\n\`${p}config\` — view config\n\`${p}prefix <new>\` — change prefix`,
        },
        {
          name: "Moderation",
          value:
            `\`${p}warn @user [reason]\`\n` +
            `\`${p}warnings @user\`\n` +
            `\`${p}clearwarns @user\`\n` +
            `\`${p}mute @user [reason]\`\n` +
            `\`${p}unmute @user\`\n` +
            `\`${p}timeout @user <minutes> [reason]\`\n` +
            `\`${p}kick @user [reason]\`\n` +
            `\`${p}ban @user [reason]\``,
        },
        {
          name: "Utility",
          value: `\`${p}ping\` — bot latency\n\`${p}help\` — this menu`,
        },
      );
    await message.reply({ embeds: [embed] });
  },
};

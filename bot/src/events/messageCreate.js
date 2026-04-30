import { Events } from "discord.js";
import { getGuildConfig } from "../storage.js";
import { handleMessageSpam } from "../protection/antiSpam.js";
import { handleMassMention } from "../protection/antiMention.js";
import { handleLinkSpam } from "../protection/antiLink.js";
import { handleBadWords } from "../protection/antiBadwords.js";
import { errorEmbed } from "../utils/embeds.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot || message.system) return;

    if (await handleMassMention(message)) return;
    if (await handleLinkSpam(message)) return;
    if (await handleBadWords(message)) return;
    if (await handleMessageSpam(message)) return;

    const cfg = getGuildConfig(message.guild.id);
    if (!message.content.startsWith(cfg.prefix)) return;

    const args = message.content.slice(cfg.prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    const cmd =
      message.client.prefixCommands.get(name) ||
      message.client.prefixCommands.find((c) => c.aliases?.includes(name));
    if (!cmd) return;

    try {
      await cmd.execute({ message, args, client: message.client });
    } catch (err) {
      logger.error(`Prefix cmd ${name} failed:`, err);
      await message.reply({
        embeds: [errorEmbed("Command failed", err.message ?? "Unknown error")],
      }).catch(() => {});
    }
  },
};

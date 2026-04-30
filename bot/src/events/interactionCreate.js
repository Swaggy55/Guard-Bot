import { Events, MessageFlags } from "discord.js";
import { errorEmbed } from "../utils/embeds.js";
import { logger } from "../utils/logger.js";
import { handleSetupButton } from "../interactions/setupButtons.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const cmd = interaction.client.slashCommands.get(interaction.commandName);
        if (!cmd) return;
        await cmd.execute({ interaction, client: interaction.client });
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith("setup:")) {
          await handleSetupButton(interaction);
        }
        return;
      }

      if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("setup:")) {
          await handleSetupButton(interaction);
        }
        return;
      }
    } catch (err) {
      logger.error("Interaction error:", err);
      const payload = {
        embeds: [errorEmbed("Something went wrong", err.message ?? "Unknown error")],
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }
    }
  },
};

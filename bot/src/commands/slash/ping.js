import { SlashCommandBuilder } from "discord.js";
import { infoEmbed } from "../../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Show bot latency"),
  async execute({ interaction }) {
    const sent = await interaction.reply({ content: "Pinging…", fetchReply: true });
    const rtt = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = Math.round(interaction.client.ws.ping);
    await interaction.editReply({
      content: null,
      embeds: [
        infoEmbed(
          "Pong",
          `**Round-trip:** \`${rtt}ms\`\n**WebSocket:** \`${ws}ms\``,
        ),
      ],
    });
  },
};

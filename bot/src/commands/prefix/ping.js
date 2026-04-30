import { infoEmbed } from "../../utils/embeds.js";

export default {
  name: "ping",
  description: "Show bot latency",
  async execute({ message }) {
    const sent = await message.reply({ content: "Pinging…" });
    const rtt = sent.createdTimestamp - message.createdTimestamp;
    const ws = Math.round(message.client.ws.ping);
    await sent.edit({
      content: null,
      embeds: [
        infoEmbed("Pong", `**Round-trip:** \`${rtt}ms\`\n**WebSocket:** \`${ws}ms\``),
      ],
    });
  },
};

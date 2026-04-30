import { SlashCommandBuilder } from "discord.js";
import { LOCK_PERM, lockReply, setChannelLocked } from "../../utils/lock.js";
import { errorEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current channel (text or voice)")
    .setDefaultMemberPermissions(LOCK_PERM)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Channel to lock (defaults to current)"),
    ),
  async execute({ interaction }) {
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;
    try {
      const kind = await setChannelLocked(channel, true);
      if (!kind) {
        await interaction.reply({
          embeds: [errorEmbed("Unsupported", "That channel type cannot be locked.")],
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({ content: lockReply(kind, true) });
      await sendLog(interaction.guild, {
        type: "channel_update",
        title: "Channel Locked",
        description: `${channel} was locked by ${interaction.user}`,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed("Failed", err.message)],
        ephemeral: true,
      });
    }
  },
};

import { SlashCommandBuilder } from "discord.js";
import { LOCK_PERM, lockReply, setChannelLocked } from "../../utils/lock.js";
import { errorEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock the current channel (text or voice)")
    .setDefaultMemberPermissions(LOCK_PERM)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Channel to unlock (defaults to current)"),
    ),
  async execute({ interaction }) {
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;
    try {
      const kind = await setChannelLocked(channel, false);
      if (!kind) {
        await interaction.reply({
          embeds: [errorEmbed("Unsupported", "That channel type cannot be unlocked.")],
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({ content: lockReply(kind, false) });
      await sendLog(interaction.guild, {
        type: "channel_update",
        title: "Channel Unlocked",
        description: `${channel} was unlocked by ${interaction.user}`,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed("Failed", err.message)],
        ephemeral: true,
      });
    }
  },
};

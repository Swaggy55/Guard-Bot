import { PermissionsBitField } from "discord.js";
import { lockReply, setChannelLocked } from "../../utils/lock.js";
import { errorEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "unlock",
  description: "Unlock the current channel",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Manage Channels")] });
      return;
    }
    const target =
      message.mentions.channels.first() ?? message.member.voice?.channel ?? message.channel;
    try {
      const kind = await setChannelLocked(target, false);
      if (!kind) {
        await message.reply({ embeds: [errorEmbed("Unsupported", "That channel type cannot be unlocked.")] });
        return;
      }
      await message.reply({ content: lockReply(kind, false) });
      await sendLog(message.guild, {
        type: "channel_update",
        title: "Channel Unlocked",
        description: `${target} was unlocked by ${message.author}`,
      });
    } catch (err) {
      await message.reply({ embeds: [errorEmbed("Failed", err.message)] });
    }
  },
};

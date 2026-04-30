import { PermissionsBitField } from "discord.js";
import { LOCK_PERM, lockReply, setChannelLocked } from "../../utils/lock.js";
import { errorEmbed } from "../../utils/embeds.js";
import { sendLog } from "../../utils/logChannel.js";

export default {
  name: "lock",
  description: "Lock the current channel",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      await message.reply({ embeds: [errorEmbed("Permission denied", "You need Manage Channels")] });
      return;
    }
    const target =
      message.mentions.channels.first() ?? message.member.voice?.channel ?? message.channel;
    try {
      const kind = await setChannelLocked(target, true);
      if (!kind) {
        await message.reply({ embeds: [errorEmbed("Unsupported", "That channel type cannot be locked.")] });
        return;
      }
      await message.reply({ content: lockReply(kind, true) });
      await sendLog(message.guild, {
        type: "channel_update",
        title: "Channel Locked",
        description: `${target} was locked by ${message.author}`,
      });
    } catch (err) {
      await message.reply({ embeds: [errorEmbed("Failed", err.message)] });
    }
  },
};
void LOCK_PERM;

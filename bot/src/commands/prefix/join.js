import { ChannelType, PermissionsBitField } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";

export default {
  name: "join",
  aliases: ["j"],
  description: "Make the bot join your voice channel",
  async execute({ message }) {
    const channel = message.member?.voice?.channel;
    if (!channel) {
      await message.reply({
        embeds: [errorEmbed("No voice channel", "Join a voice channel first, then run `!join`.")],
      });
      return;
    }
    if (
      channel.type !== ChannelType.GuildVoice &&
      channel.type !== ChannelType.GuildStageVoice
    ) {
      await message.reply({
        embeds: [errorEmbed("Unsupported", "I can only join voice or stage channels.")],
      });
      return;
    }

    const me = message.guild.members.me;
    const perms = channel.permissionsFor(me);
    if (!perms?.has(PermissionsBitField.Flags.Connect)) {
      await message.reply({
        embeds: [errorEmbed("Missing permission", "I don't have permission to **Connect** to that channel.")],
      });
      return;
    }
    if (
      channel.type === ChannelType.GuildStageVoice &&
      !perms.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      await message.reply({
        embeds: [errorEmbed("Missing permission", "I need **Mute Members** to join a stage channel.")],
      });
      return;
    }

    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
      });
      await message.reply({
        embeds: [successEmbed("Joined", `Connected to **${channel.name}**.`)],
      });
    } catch (err) {
      await message.reply({
        embeds: [errorEmbed("Failed to join", err.message)],
      });
    }
  },
};

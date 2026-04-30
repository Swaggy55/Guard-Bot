import { ChannelType, PermissionsBitField } from "discord.js";
import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection,
} from "@discordjs/voice";
import { errorEmbed, successEmbed } from "../../utils/embeds.js";

async function resolveVoiceChannel(message) {
  let member = message.member;
  if (!member?.voice?.channelId) {
    member = await message.guild.members.fetch({ user: message.author.id, force: true })
      .catch(() => null);
  }
  if (!member?.voice?.channelId) return null;
  return (
    member.voice.channel ??
    (await message.guild.channels.fetch(member.voice.channelId).catch(() => null))
  );
}

export default {
  name: "join",
  aliases: ["j"],
  description: "Make the bot join your voice channel",
  async execute({ message }) {
    const channel = await resolveVoiceChannel(message);
    if (!channel) {
      await message.reply({
        embeds: [
          errorEmbed(
            "No voice channel",
            "I can't see you in any voice channel. Join one and try `!join` again.",
          ),
        ],
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

    const me = message.guild.members.me ?? (await message.guild.members.fetchMe().catch(() => null));
    const perms = me ? channel.permissionsFor(me) : null;
    if (!perms?.has(PermissionsBitField.Flags.ViewChannel)) {
      await message.reply({
        embeds: [errorEmbed("Missing permission", "I can't even **View** that channel.")],
      });
      return;
    }
    if (!perms.has(PermissionsBitField.Flags.Connect)) {
      await message.reply({
        embeds: [errorEmbed("Missing permission", "I don't have **Connect** for that channel.")],
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

    const existing = getVoiceConnection(channel.guild.id);
    if (existing && existing.joinConfig.channelId === channel.id) {
      await message.reply({
        embeds: [successEmbed("Already connected", `I'm already in **${channel.name}**.`)],
      });
      return;
    }
    if (existing) existing.destroy();

    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch {
          connection.destroy();
        }
      });

      if (channel.type === ChannelType.GuildStageVoice) {
        await message.guild.members.me?.voice?.setSuppressed(false).catch(() => {});
      }

      await message.reply({
        embeds: [successEmbed("Joined", `Connected to **${channel.name}**.`)],
      });
    } catch (err) {
      try {
        connection?.destroy();
      } catch {}
      await message.reply({
        embeds: [errorEmbed("Failed to join", err.message ?? "Unknown error")],
      });
    }
  },
};

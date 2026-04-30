import { ChannelType, PermissionFlagsBits } from "discord.js";

export function isVoiceChannel(channel) {
  return (
    channel.type === ChannelType.GuildVoice ||
    channel.type === ChannelType.GuildStageVoice
  );
}

export function isTextLikeChannel(channel) {
  return (
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildAnnouncement ||
    channel.type === ChannelType.GuildForum
  );
}

export async function setChannelLocked(channel, locked) {
  const everyone = channel.guild.roles.everyone;
  if (isVoiceChannel(channel)) {
    await channel.permissionOverwrites.edit(
      everyone,
      {
        Connect: locked ? false : null,
        Speak: locked ? false : null,
      },
      { reason: locked ? "Channel locked" : "Channel unlocked" },
    );
    return "voice";
  }
  if (isTextLikeChannel(channel)) {
    await channel.permissionOverwrites.edit(
      everyone,
      {
        SendMessages: locked ? false : null,
        SendMessagesInThreads: locked ? false : null,
        AddReactions: locked ? false : null,
      },
      { reason: locked ? "Channel locked" : "Channel unlocked" },
    );
    return "text";
  }
  return null;
}

export const LOCK_PERM = PermissionFlagsBits.ManageChannels;

export function lockReply(kind, locked) {
  const emoji = locked ? "🔒" : "🔓";
  if (kind === "voice") {
    return locked
      ? `- ${emoji} | **__Channel Locked Successfully & All Users In This Vc Permited__** ⋰⋱`
      : `- ${emoji} | **__Channel Unlocked Successfully & All Users In This Vc Can Speak__** ⋰⋱`;
  }
  return locked
    ? `- ${emoji} | **__Channel Locked Successfully & All Users In This Channel Permited__** ⋰⋱`
    : `- ${emoji} | **__Channel Unlocked Successfully & All Users In This Channel Can Chat__** ⋰⋱`;
}

import { PermissionsBitField } from "discord.js";
import { getGuildConfig } from "../storage.js";

export function isWhitelisted(member) {
  if (!member) return false;
  if (member.user?.bot) return false;
  const cfg = getGuildConfig(member.guild.id);
  if (cfg.whitelistedUsers.includes(member.id)) return true;
  for (const roleId of cfg.whitelistedRoles) {
    if (member.roles.cache.has(roleId)) return true;
  }
  return false;
}

export function isStaff(member) {
  if (!member) return false;
  if (member.id === member.guild.ownerId) return true;
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
}

export function isImmune(member) {
  if (!member) return false;
  if (member.id === member.guild.ownerId) return true;
  if (isWhitelisted(member)) return true;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  return false;
}

import { PermissionsBitField } from "discord.js";
import { addWarning, getGuildConfig, getWarnings } from "../storage.js";
import { sendLog } from "./logChannel.js";
import { logger } from "./logger.js";

export async function timeoutMember(member, durationMs, reason) {
  if (!member.moderatable) return false;
  try {
    await member.timeout(durationMs, reason);
    return true;
  } catch (err) {
    logger.warn(`Timeout failed for ${member.user.tag}: ${err.message}`);
    return false;
  }
}

export async function muteMember(member, reason) {
  const cfg = getGuildConfig(member.guild.id);
  if (cfg.muteRoleId) {
    const role = member.guild.roles.cache.get(cfg.muteRoleId);
    if (role && member.manageable) {
      try {
        await member.roles.add(role, reason);
        return true;
      } catch (err) {
        logger.warn(`Mute role add failed: ${err.message}`);
      }
    }
  }
  return timeoutMember(member, 60 * 60_000, reason);
}

export async function kickMember(member, reason) {
  if (!member.kickable) return false;
  try {
    await member.kick(reason);
    return true;
  } catch (err) {
    logger.warn(`Kick failed: ${err.message}`);
    return false;
  }
}

export async function banMember(member, reason) {
  if (!member.bannable) return false;
  try {
    await member.ban({ reason, deleteMessageSeconds: 60 * 60 });
    return true;
  } catch (err) {
    logger.warn(`Ban failed: ${err.message}`);
    return false;
  }
}

export async function removeAllRoles(member, reason) {
  if (!member.manageable) return false;
  try {
    const removable = member.roles.cache.filter(
      (r) => r.id !== member.guild.id && r.editable,
    );
    await member.roles.remove(removable, reason);
    return true;
  } catch (err) {
    logger.warn(`Remove roles failed: ${err.message}`);
    return false;
  }
}

export async function applyAction(member, action, { reason, durationMs } = {}) {
  switch (action) {
    case "timeout":
      return timeoutMember(member, durationMs ?? 10 * 60_000, reason);
    case "mute":
      return muteMember(member, reason);
    case "kick":
      return kickMember(member, reason);
    case "ban":
      return banMember(member, reason);
    case "removeRoles":
      return removeAllRoles(member, reason);
    case "warn":
      return true;
    case "delete":
      return true;
    case "none":
      return true;
    default:
      return false;
  }
}

export async function issueWarning(guild, target, moderator, reason) {
  const warning = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    moderatorId: moderator?.id ?? "system",
    moderatorTag: moderator?.tag ?? "System",
    reason: reason || "No reason provided",
    timestamp: Date.now(),
  };
  const list = addWarning(guild.id, target.id, warning);

  await sendLog(guild, {
    type: "warn_user",
    title: "Member Warned",
    description: `${target} was warned. They now have **${list.length}** warning(s).`,
    fields: [
      { name: "Reason", value: reason || "No reason provided" },
      { name: "Moderator", value: moderator ? `${moderator}` : "System", inline: true },
    ],
    user: moderator,
    target,
  });

  await checkWarnThresholds(guild, target, list.length);
  return { warning, total: list.length };
}

export async function checkWarnThresholds(guild, target, count) {
  const cfg = getGuildConfig(guild.id);
  if (!cfg.warnSystem.enabled) return;

  const member = await guild.members.fetch(target.id).catch(() => null);
  if (!member) return;

  const matched = cfg.warnSystem.thresholds
    .filter((t) => t.count === count)
    .sort((a, b) => b.count - a.count)[0];
  if (!matched) return;

  const reason = `Reached ${count} warnings`;
  const ok = await applyAction(member, matched.action, {
    reason,
    durationMs: matched.durationMs,
  });

  await sendLog(guild, {
    type: matched.action,
    title: "Warn Threshold Reached",
    description: `${target} hit **${count}** warnings → action: \`${matched.action}\` ${ok ? "✓" : "✗"}`,
  });
}

export function memberHasGuildBan(guild) {
  return guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers) ?? false;
}

export { getWarnings };

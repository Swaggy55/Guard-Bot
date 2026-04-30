import { getGuildConfig } from "../storage.js";
import { applyAction } from "../utils/moderate.js";
import { sendLog } from "../utils/logChannel.js";
import { logger } from "../utils/logger.js";

const joinBuckets = new Map();
const lockdownGuilds = new Set();

function bucket(guildId) {
  if (!joinBuckets.has(guildId)) joinBuckets.set(guildId, []);
  return joinBuckets.get(guildId);
}

export async function handleMemberJoin(member) {
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.antiRaid.enabled) return false;

  const now = Date.now();
  const arr = bucket(member.guild.id);
  arr.push({ id: member.id, t: now });
  while (arr.length && now - arr[0].t > cfg.antiRaid.joinWindowMs) arr.shift();

  const accountAge = now - member.user.createdTimestamp;
  const minAge = cfg.antiRaid.accountAgeMinDays * 24 * 60 * 60 * 1000;
  const isYoungAccount = accountAge < minAge;

  const burst = arr.length >= cfg.antiRaid.joinThreshold;

  if (burst && !lockdownGuilds.has(member.guild.id)) {
    lockdownGuilds.add(member.guild.id);
    setTimeout(() => lockdownGuilds.delete(member.guild.id), 60_000);

    await sendLog(member.guild, {
      type: "raid",
      title: "Raid Detected",
      description: `**${arr.length}** members joined within \`${cfg.antiRaid.joinWindowMs / 1000}s\`. Activating lockdown.`,
    });
    logger.warn(`Raid detected on ${member.guild.name}`);
  }

  if (lockdownGuilds.has(member.guild.id) || (isYoungAccount && burst)) {
    const ok = await applyAction(member, cfg.antiRaid.action, {
      reason: "Anti-raid: lockdown active",
    });
    await sendLog(member.guild, {
      type: "raid",
      title: "Raid Action",
      description: `${member} → \`${cfg.antiRaid.action}\` ${ok ? "✓" : "✗"}`,
      target: member.user,
    });
    return true;
  }
  return false;
}

export function isLocked(guildId) {
  return lockdownGuilds.has(guildId);
}

export function setLockdown(guildId, on) {
  if (on) lockdownGuilds.add(guildId);
  else lockdownGuilds.delete(guildId);
}

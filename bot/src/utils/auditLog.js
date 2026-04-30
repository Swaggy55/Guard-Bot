import { logger } from "./logger.js";

export async function findExecutor(guild, type, predicate, { limit = 5 } = {}) {
  try {
    const audit = await guild.fetchAuditLogs({ type, limit });
    const entry = predicate
      ? audit.entries.find((e) => predicate(e))
      : audit.entries.first();
    return entry
      ? { executor: entry.executor, entry, reason: entry.reason ?? null }
      : { executor: null, entry: null, reason: null };
  } catch (err) {
    logger.warn(`Audit fetch failed: ${err.message}`);
    return { executor: null, entry: null, reason: null };
  }
}

export function fmtUser(user) {
  if (!user) return "Unknown";
  return `<@${user.id}> (\`${user.tag ?? user.username ?? user.id}\`)`;
}

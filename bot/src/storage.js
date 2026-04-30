import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CONFIG, DEFAULT_BAD_WORDS } from "./config.js";
import { logger } from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "guilds.json");

let cache = { guilds: {}, warnings: {} };
let saveTimer = null;
let writing = false;
let pendingWrite = false;

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw);
    if (!cache.guilds) cache.guilds = {};
    if (!cache.warnings) cache.warnings = {};
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2));
    } else {
      throw err;
    }
  }
}

async function flush() {
  if (writing) {
    pendingWrite = true;
    return;
  }
  writing = true;
  try {
    const tmp = DATA_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(cache, null, 2));
    await fs.rename(tmp, DATA_FILE);
  } catch (err) {
    logger.error("Failed to persist storage:", err);
  } finally {
    writing = false;
    if (pendingWrite) {
      pendingWrite = false;
      flush();
    }
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flush();
  }, 250);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMerge(tv, sv);
    } else {
      out[key] = sv;
    }
  }
  return out;
}

export async function initStorage() {
  await ensureFile();
  logger.success(`Storage ready (${Object.keys(cache.guilds).length} guilds)`);
}

export function getGuildConfig(guildId) {
  if (!cache.guilds[guildId]) {
    cache.guilds[guildId] = structuredClone(DEFAULT_CONFIG);
    cache.guilds[guildId].antiBadwords.words = [...DEFAULT_BAD_WORDS];
    scheduleSave();
  }
  return cache.guilds[guildId];
}

export function updateGuildConfig(guildId, partial) {
  const current = getGuildConfig(guildId);
  cache.guilds[guildId] = deepMerge(current, partial);
  scheduleSave();
  return cache.guilds[guildId];
}

export function setGuildField(guildId, pathStr, value) {
  const cfg = getGuildConfig(guildId);
  const keys = pathStr.split(".");
  let node = cfg;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof node[keys[i]] !== "object" || node[keys[i]] === null) {
      node[keys[i]] = {};
    }
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
  scheduleSave();
  return cfg;
}

export function getWarnings(guildId, userId) {
  const key = `${guildId}:${userId}`;
  return cache.warnings[key] || [];
}

export function addWarning(guildId, userId, warning) {
  const key = `${guildId}:${userId}`;
  if (!cache.warnings[key]) cache.warnings[key] = [];
  cache.warnings[key].push(warning);
  scheduleSave();
  return cache.warnings[key];
}

export function clearWarnings(guildId, userId) {
  const key = `${guildId}:${userId}`;
  delete cache.warnings[key];
  scheduleSave();
}

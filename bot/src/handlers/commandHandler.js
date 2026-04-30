import { Collection } from "discord.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLASH_DIR = path.join(__dirname, "..", "commands", "slash");
const PREFIX_DIR = path.join(__dirname, "..", "commands", "prefix");

async function loadDir(dir) {
  const files = await fs.readdir(dir);
  const out = [];
  for (const f of files) {
    if (!f.endsWith(".js")) continue;
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    if (mod.default) out.push(mod.default);
  }
  return out;
}

export async function loadCommands(client) {
  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();

  const slashes = await loadDir(SLASH_DIR);
  for (const cmd of slashes) {
    if (!cmd.data?.name) continue;
    client.slashCommands.set(cmd.data.name, cmd);
  }

  const prefixes = await loadDir(PREFIX_DIR);
  for (const cmd of prefixes) {
    if (!cmd.name) continue;
    client.prefixCommands.set(cmd.name, cmd);
  }

  logger.success(`Loaded ${client.slashCommands.size} slash + ${client.prefixCommands.size} prefix commands`);
}

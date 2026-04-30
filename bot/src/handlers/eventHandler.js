import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = path.join(__dirname, "..", "events");

export async function loadEvents(client) {
  const files = await fs.readdir(EVENTS_DIR);
  let count = 0;
  for (const f of files) {
    if (!f.endsWith(".js")) continue;
    const mod = await import(pathToFileURL(path.join(EVENTS_DIR, f)).href);
    const evt = mod.default;
    if (!evt?.name) continue;
    if (evt.once) {
      client.once(evt.name, (...args) => evt.execute(...args));
    } else {
      client.on(evt.name, (...args) => evt.execute(...args));
    }
    count++;
  }
  logger.success(`Loaded ${count} events`);
}

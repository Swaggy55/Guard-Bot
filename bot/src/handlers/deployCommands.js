import { REST, Routes } from "discord.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLASH_DIR = path.join(__dirname, "..", "commands", "slash");

export async function deployCommands({ token, clientId, guildId } = {}) {
  const TOKEN = token ?? process.env.DISCORD_TOKEN;
  const CLIENT_ID = clientId ?? process.env.DISCORD_CLIENT_ID;
  const GUILD_ID = guildId ?? process.env.DISCORD_GUILD_ID;

  if (!TOKEN || !CLIENT_ID) {
    logger.error("DISCORD_TOKEN and DISCORD_CLIENT_ID required to deploy");
    return;
  }

  const files = await fs.readdir(SLASH_DIR);
  const body = [];
  for (const f of files) {
    if (!f.endsWith(".js")) continue;
    const mod = await import(pathToFileURL(path.join(SLASH_DIR, f)).href);
    if (mod.default?.data) body.push(mod.default.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    if (GUILD_ID) {
      logger.info(`Deploying ${body.length} guild commands to ${GUILD_ID}…`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
      logger.success("Guild commands deployed");
    } else {
      logger.info(`Deploying ${body.length} global commands…`);
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
      logger.success("Global commands deployed (may take up to 1 hour to propagate)");
    }
  } catch (err) {
    logger.error("Deploy failed:", err);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  deployCommands();
}

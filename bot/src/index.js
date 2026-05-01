import { Client, GatewayIntentBits, Partials } from "discord.js";
import { initStorage } from "./storage.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { deployCommands } from "./handlers/deployCommands.js";
import { logger } from "./utils/logger.js";
import { BRAND, BOT_VERSION } from "./config.js";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!TOKEN) {
  logger.error("DISCORD_TOKEN env var is required");
  process.exit(1);
}

console.log("");
console.log(`  🛡️  ${BRAND.name} v${BOT_VERSION}`);
console.log("  ─────────────────────────────");
console.log("");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
  allowedMentions: { parse: ["users"], repliedUser: false },
});

async function main() {
  await initStorage();
  await loadEvents(client);
  await loadCommands(client);

  if (CLIENT_ID) {
    await deployCommands({ token: TOKEN, clientId: CLIENT_ID });
  } else {
    logger.warn("DISCORD_CLIENT_ID not set — slash commands will not be deployed");
  }

  client.login(process.env.TOKEN);
}

process.on("unhandledRejection", (err) => logger.error("Unhandled rejection:", err));
process.on("uncaughtException", (err) => logger.error("Uncaught exception:", err));

const shutdown = async () => {
  logger.info("Shutting down…");
  try {
    await client.destroy();
  } catch {}
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});

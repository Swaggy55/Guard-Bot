import { ActivityType, Events } from "discord.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`);

    client.user.setPresence({
      activities: [
        { name: `${client.guilds.cache.size} servers • /setup`, type: ActivityType.Watching },
      ],
      status: "online",
    });

    setInterval(() => {
      client.user.setPresence({
        activities: [
          { name: `${client.guilds.cache.size} servers • /setup`, type: ActivityType.Watching },
        ],
        status: "online",
      });
    }, 5 * 60_000);
  },
};

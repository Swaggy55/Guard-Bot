import { Events } from "discord.js";
import { getGuildConfig } from "../storage.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.GuildCreate,
  async execute(guild) {
    getGuildConfig(guild.id);
    logger.success(`Joined guild ${guild.name} (${guild.id}) — ${guild.memberCount} members`);
  },
};

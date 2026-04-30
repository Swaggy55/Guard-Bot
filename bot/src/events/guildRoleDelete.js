import { Events } from "discord.js";
import { handleRoleDelete } from "../protection/antiRoleDelete.js";

export default {
  name: Events.GuildRoleDelete,
  async execute(role) {
    await handleRoleDelete(role);
  },
};

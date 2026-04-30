import { Events } from "discord.js";
import { handleChannelDelete } from "../protection/antiChannelDelete.js";

export default {
  name: Events.ChannelDelete,
  async execute(channel) {
    if (!channel.guild) return;
    await handleChannelDelete(channel);
  },
};

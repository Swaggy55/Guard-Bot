import { Events } from "discord.js";
import { handleWebhooksUpdate } from "../protection/antiWebhook.js";

export default {
  name: Events.WebhooksUpdate,
  async execute(channel) {
    await handleWebhooksUpdate(channel);
  },
};

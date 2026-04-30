import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildEmojiCreate,
  async execute(emoji) {
    const { executor } = await findExecutor(
      emoji.guild,
      AuditLogEvent.EmojiCreate,
      (e) => e.target?.id === emoji.id,
    );
    await sendLog(emoji.guild, {
      type: "emoji",
      title: "Emoji Added",
      description: `${emoji} \`:${emoji.name}:\` added by ${fmtUser(executor)}`,
    });
  },
};

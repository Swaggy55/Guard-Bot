import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildEmojiDelete,
  async execute(emoji) {
    const { executor } = await findExecutor(
      emoji.guild,
      AuditLogEvent.EmojiDelete,
      (e) => e.target?.id === emoji.id,
    );
    await sendLog(emoji.guild, {
      type: "emoji",
      title: "Emoji Removed",
      description: `\`:${emoji.name}:\` was deleted by ${fmtUser(executor)}`,
    });
  },
};

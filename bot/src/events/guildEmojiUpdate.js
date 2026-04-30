import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildEmojiUpdate,
  async execute(oldEmoji, newEmoji) {
    if (oldEmoji.name === newEmoji.name) return;
    const { executor } = await findExecutor(
      newEmoji.guild,
      AuditLogEvent.EmojiUpdate,
      (e) => e.target?.id === newEmoji.id,
    );
    await sendLog(newEmoji.guild, {
      type: "emoji",
      title: "Emoji Renamed",
      description: `${newEmoji} renamed \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\` by ${fmtUser(executor)}`,
    });
  },
};

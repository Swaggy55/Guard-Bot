import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildUpdate,
  async execute(oldGuild, newGuild) {
    const changes = [];
    if (oldGuild.name !== newGuild.name)
      changes.push(`**Name:** \`${oldGuild.name}\` → \`${newGuild.name}\``);
    if (oldGuild.iconURL() !== newGuild.iconURL()) changes.push("**Icon:** changed");
    if (oldGuild.bannerURL() !== newGuild.bannerURL()) changes.push("**Banner:** changed");
    if (oldGuild.ownerId !== newGuild.ownerId)
      changes.push(`**Owner:** <@${oldGuild.ownerId}> → <@${newGuild.ownerId}>`);
    if (oldGuild.verificationLevel !== newGuild.verificationLevel)
      changes.push(
        `**Verification:** \`${oldGuild.verificationLevel}\` → \`${newGuild.verificationLevel}\``,
      );
    if (!changes.length) return;

    const { executor } = await findExecutor(newGuild, AuditLogEvent.GuildUpdate);
    await sendLog(newGuild, {
      type: "guild_update",
      title: "Server Updated",
      description: `Server settings changed by ${fmtUser(executor)}\n\n${changes.join("\n")}`,
    });
  },
};

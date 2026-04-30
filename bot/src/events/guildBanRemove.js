import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildBanRemove,
  async execute(ban) {
    const { executor } = await findExecutor(
      ban.guild,
      AuditLogEvent.MemberBanRemove,
      (e) => e.target?.id === ban.user.id,
    );
    await sendLog(ban.guild, {
      type: "member_unban",
      title: "Member Unbanned",
      description: `${fmtUser(ban.user)} was unbanned by ${fmtUser(executor)}`,
      target: ban.user,
    });
  },
};

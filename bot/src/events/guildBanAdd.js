import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildBanAdd,
  async execute(ban) {
    const { executor, reason } = await findExecutor(
      ban.guild,
      AuditLogEvent.MemberBanAdd,
      (e) => e.target?.id === ban.user.id,
    );
    await sendLog(ban.guild, {
      type: "member_ban",
      title: "Member Banned",
      description: `${fmtUser(ban.user)} was banned by ${fmtUser(executor)}`,
      fields: reason ? [{ name: "Reason", value: reason }] : [],
      target: ban.user,
    });
  },
};

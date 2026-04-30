import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const cutoff = Date.now() - 5_000;
    const { executor, reason, entry } = await findExecutor(
      member.guild,
      AuditLogEvent.MemberKick,
      (e) => e.target?.id === member.id && e.createdTimestamp >= cutoff,
    );

    if (executor) {
      await sendLog(member.guild, {
        type: "member_kick",
        title: "Member Kicked",
        description: `${fmtUser(member.user)} was kicked by ${fmtUser(executor)}`,
        fields: reason ? [{ name: "Reason", value: reason }] : [],
        target: member.user,
      });
    } else {
      await sendLog(member.guild, {
        type: "member_leave",
        title: "Member Left",
        description: `${fmtUser(member.user)} left the server`,
        target: member.user,
      });
    }
    void entry;
  },
};

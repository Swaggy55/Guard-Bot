import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const changes = [];
    const fields = [];

    if (oldMember.nickname !== newMember.nickname) {
      changes.push(
        `**Nickname:** \`${oldMember.nickname ?? "—"}\` → \`${newMember.nickname ?? "—"}\``,
      );
    }

    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(newMember.roles.cache.keys());
    const added = [...newRoles].filter((id) => !oldRoles.has(id));
    const removed = [...oldRoles].filter((id) => !newRoles.has(id));
    if (added.length) changes.push(`**+ Roles:** ${added.map((id) => `<@&${id}>`).join(" ")}`);
    if (removed.length) changes.push(`**− Roles:** ${removed.map((id) => `<@&${id}>`).join(" ")}`);

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;
    if ((oldTimeout ?? 0) !== (newTimeout ?? 0)) {
      if (newTimeout && newTimeout > Date.now()) {
        changes.push(`**Timeout until:** <t:${Math.floor(newTimeout / 1000)}:F>`);
      } else if (oldTimeout && (!newTimeout || newTimeout <= Date.now())) {
        changes.push("**Timeout:** removed");
      }
    }

    if (!changes.length) return;

    let auditType = AuditLogEvent.MemberUpdate;
    if (added.length || removed.length) auditType = AuditLogEvent.MemberRoleUpdate;
    const { executor } = await findExecutor(
      newMember.guild,
      auditType,
      (e) => e.target?.id === newMember.id,
    );

    await sendLog(newMember.guild, {
      type: "member_update",
      title: "Member Updated",
      description: `${fmtUser(newMember.user)} updated by ${fmtUser(executor)}\n\n${changes.join("\n")}`,
      fields,
      target: newMember.user,
    });
  },
};

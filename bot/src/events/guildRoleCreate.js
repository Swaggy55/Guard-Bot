import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildRoleCreate,
  async execute(role) {
    const { executor, reason } = await findExecutor(
      role.guild,
      AuditLogEvent.RoleCreate,
      (e) => e.target?.id === role.id,
    );
    await sendLog(role.guild, {
      type: "role_create",
      title: "Role Created",
      description: `<@&${role.id}> (\`${role.name}\`) was created by ${fmtUser(executor)}`,
      fields: [
        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
        { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
        ...(reason ? [{ name: "Reason", value: reason }] : []),
      ],
    });
  },
};

import { AuditLogEvent, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

function diff(oldRole, newRole) {
  const changes = [];
  if (oldRole.name !== newRole.name)
    changes.push(`**Name:** \`${oldRole.name}\` → \`${newRole.name}\``);
  if (oldRole.color !== newRole.color)
    changes.push(`**Color:** \`#${oldRole.color.toString(16)}\` → \`#${newRole.color.toString(16)}\``);
  if (oldRole.hoist !== newRole.hoist)
    changes.push(`**Hoisted:** \`${oldRole.hoist}\` → \`${newRole.hoist}\``);
  if (oldRole.mentionable !== newRole.mentionable)
    changes.push(`**Mentionable:** \`${oldRole.mentionable}\` → \`${newRole.mentionable}\``);
  if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
    const added = newRole.permissions.toArray().filter((p) => !oldRole.permissions.has(p));
    const removed = oldRole.permissions.toArray().filter((p) => !newRole.permissions.has(p));
    if (added.length) changes.push(`**+ Perms:** \`${added.join(", ")}\``);
    if (removed.length) changes.push(`**− Perms:** \`${removed.join(", ")}\``);
  }
  return changes;
}

export default {
  name: Events.GuildRoleUpdate,
  async execute(oldRole, newRole) {
    const changes = diff(oldRole, newRole);
    if (!changes.length) return;
    const { executor } = await findExecutor(
      newRole.guild,
      AuditLogEvent.RoleUpdate,
      (e) => e.target?.id === newRole.id,
    );
    await sendLog(newRole.guild, {
      type: "role_update",
      title: "Role Updated",
      description: `<@&${newRole.id}> edited by ${fmtUser(executor)}\n\n${changes.join("\n")}`,
    });
  },
};

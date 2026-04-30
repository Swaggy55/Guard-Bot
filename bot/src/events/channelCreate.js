import { AuditLogEvent, ChannelType, Events } from "discord.js";
import { findExecutor, fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.ChannelCreate,
  async execute(channel) {
    if (!channel.guild) return;
    const { executor, reason } = await findExecutor(
      channel.guild,
      AuditLogEvent.ChannelCreate,
      (e) => e.target?.id === channel.id,
    );
    await sendLog(channel.guild, {
      type: "channel_create",
      title: "Channel Created",
      description: `${channel} (\`#${channel.name}\`) was created by ${fmtUser(executor)}`,
      fields: [
        { name: "Type", value: `${ChannelType[channel.type] ?? channel.type}`, inline: true },
        ...(reason ? [{ name: "Reason", value: reason }] : []),
      ],
    });
  },
};

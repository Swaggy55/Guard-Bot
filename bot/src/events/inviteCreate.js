import { Events } from "discord.js";
import { fmtUser } from "../utils/auditLog.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.InviteCreate,
  async execute(invite) {
    if (!invite.guild) return;
    await sendLog(invite.guild, {
      type: "invite",
      title: "Invite Created",
      description: `Invite \`${invite.code}\` for ${invite.channel ?? "—"} created by ${fmtUser(invite.inviter)}`,
      fields: [
        { name: "Max Uses", value: `${invite.maxUses || "∞"}`, inline: true },
        {
          name: "Expires",
          value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : "Never",
          inline: true,
        },
      ],
    });
  },
};

import { Events } from "discord.js";
import { handleMemberJoin } from "../protection/antiRaid.js";
import { handleBotJoin } from "../protection/antiBot.js";
import { sendLog } from "../utils/logChannel.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) {
      if (await handleBotJoin(member)) return;
    }
    if (await handleMemberJoin(member)) return;

    await sendLog(member.guild, {
      type: "info",
      title: "Member Joined",
      description: `${member} joined the server`,
      fields: [
        {
          name: "Account Created",
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      ],
      target: member.user,
    });
  },
};

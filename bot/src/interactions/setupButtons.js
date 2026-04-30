import { MessageFlags, PermissionsBitField } from "discord.js";
import { getGuildConfig, setGuildField } from "../storage.js";
import { buildSetupPanel } from "./setupPanel.js";
import { errorEmbed } from "../utils/embeds.js";

const TOGGLEABLE = new Set([
  "antiRaid",
  "antiSpam",
  "antiMention",
  "antiLink",
  "antiBadwords",
  "antiBot",
  "antiChannelDelete",
  "antiRoleDelete",
  "antiWebhook",
]);

export async function handleSetupButton(interaction) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    await interaction.reply({
      embeds: [errorEmbed("Permission denied", "You need Manage Server")],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const parts = interaction.customId.split(":");
  const action = parts[1];

  if (action === "toggle" && TOGGLEABLE.has(parts[2])) {
    const cfg = getGuildConfig(interaction.guildId);
    const next = !cfg[parts[2]].enabled;
    setGuildField(interaction.guildId, `${parts[2]}.enabled`, next);
    await interaction.update(buildSetupPanel(interaction.guild));
    return;
  }

  if (action === "enableAll") {
    for (const mod of TOGGLEABLE) {
      setGuildField(interaction.guildId, `${mod}.enabled`, true);
    }
    await interaction.update(buildSetupPanel(interaction.guild));
    return;
  }

  if (action === "logsChannel") {
    const channelId = interaction.values?.[0];
    if (channelId) setGuildField(interaction.guildId, "logsChannelId", channelId);
    await interaction.update(buildSetupPanel(interaction.guild));
    return;
  }

  if (action === "muteRole") {
    const roleId = interaction.values?.[0];
    if (roleId) setGuildField(interaction.guildId, "muteRoleId", roleId);
    await interaction.update(buildSetupPanel(interaction.guild));
    return;
  }
}

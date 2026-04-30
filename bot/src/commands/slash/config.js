import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { getGuildConfig, setGuildField } from "../../storage.js";
import { baseEmbed, errorEmbed, successEmbed } from "../../utils/embeds.js";

const FIELDS = {
  prefix: { type: "string" },
  logsChannelId: { type: "channel" },
  muteRoleId: { type: "role" },

  "antiRaid.enabled": { type: "bool" },
  "antiRaid.joinThreshold": { type: "int" },
  "antiRaid.joinWindowMs": { type: "int" },
  "antiRaid.action": { type: "string" },
  "antiRaid.accountAgeMinDays": { type: "int" },

  "antiSpam.enabled": { type: "bool" },
  "antiSpam.messageThreshold": { type: "int" },
  "antiSpam.windowMs": { type: "int" },
  "antiSpam.duplicateThreshold": { type: "int" },
  "antiSpam.action": { type: "string" },
  "antiSpam.timeoutMs": { type: "int" },

  "antiMention.enabled": { type: "bool" },
  "antiMention.maxMentions": { type: "int" },
  "antiMention.action": { type: "string" },
  "antiMention.timeoutMs": { type: "int" },

  "antiLink.enabled": { type: "bool" },
  "antiLink.allowDiscordInvites": { type: "bool" },
  "antiLink.action": { type: "string" },

  "antiBadwords.enabled": { type: "bool" },
  "antiBadwords.action": { type: "string" },

  "antiBot.enabled": { type: "bool" },
  "antiBot.action": { type: "string" },

  "antiChannelDelete.enabled": { type: "bool" },
  "antiChannelDelete.threshold": { type: "int" },
  "antiChannelDelete.windowMs": { type: "int" },
  "antiChannelDelete.action": { type: "string" },
  "antiChannelDelete.restore": { type: "bool" },

  "antiRoleDelete.enabled": { type: "bool" },
  "antiRoleDelete.threshold": { type: "int" },
  "antiRoleDelete.windowMs": { type: "int" },
  "antiRoleDelete.action": { type: "string" },
  "antiRoleDelete.restore": { type: "bool" },

  "antiWebhook.enabled": { type: "bool" },
  "antiWebhook.threshold": { type: "int" },
  "antiWebhook.windowMs": { type: "int" },
  "antiWebhook.action": { type: "string" },
};

function coerce(type, raw) {
  if (type === "bool") {
    if (["true", "on", "yes", "1", "enable", "enabled"].includes(raw.toLowerCase())) return true;
    if (["false", "off", "no", "0", "disable", "disabled"].includes(raw.toLowerCase())) return false;
    throw new Error("Expected true/false");
  }
  if (type === "int") {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) throw new Error("Expected a number");
    return n;
  }
  return raw;
}

export default {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("View or change protection settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s.setName("view").setDescription("Show the current configuration"))
    .addSubcommand((s) =>
      s
        .setName("set")
        .setDescription("Update a setting")
        .addStringOption((o) =>
          o
            .setName("field")
            .setDescription("Dotted path, e.g. antiSpam.enabled")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addStringOption((o) =>
          o.setName("value").setDescription("New value").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("addbadword")
        .setDescription("Add a word to the bad-words list")
        .addStringOption((o) =>
          o.setName("word").setDescription("Word to add").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("removebadword")
        .setDescription("Remove a word from the bad-words list")
        .addStringOption((o) =>
          o.setName("word").setDescription("Word to remove").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("whitelist")
        .setDescription("Add a user or role to the whitelist")
        .addUserOption((o) => o.setName("user").setDescription("User to whitelist"))
        .addRoleOption((o) => o.setName("role").setDescription("Role to whitelist")),
    ),
  async autocomplete(interaction) {
    const focus = interaction.options.getFocused();
    const choices = Object.keys(FIELDS)
      .filter((f) => f.toLowerCase().includes(focus.toLowerCase()))
      .slice(0, 25)
      .map((f) => ({ name: f, value: f }));
    await interaction.respond(choices);
  },
  async execute({ interaction }) {
    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guildId);

    if (sub === "view") {
      const json = JSON.stringify(cfg, null, 2);
      const trimmed = json.length > 3500 ? json.slice(0, 3500) + "\n…" : json;
      const embed = baseEmbed()
        .setTitle("Current Configuration")
        .setDescription(`\`\`\`json\n${trimmed}\n\`\`\``);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === "set") {
      const field = interaction.options.getString("field", true);
      const value = interaction.options.getString("value", true);
      const meta = FIELDS[field];
      if (!meta) {
        await interaction.reply({
          embeds: [errorEmbed("Unknown field", `\`${field}\` is not a valid field. Use autocomplete.`)],
          ephemeral: true,
        });
        return;
      }
      try {
        const v = coerce(meta.type, value);
        setGuildField(interaction.guildId, field, v);
        await interaction.reply({
          embeds: [successEmbed("Updated", `\`${field}\` → \`${JSON.stringify(v)}\``)],
          ephemeral: true,
        });
      } catch (err) {
        await interaction.reply({
          embeds: [errorEmbed("Invalid value", err.message)],
          ephemeral: true,
        });
      }
      return;
    }

    if (sub === "addbadword") {
      const word = interaction.options.getString("word", true).toLowerCase().trim();
      if (!cfg.antiBadwords.words.includes(word)) cfg.antiBadwords.words.push(word);
      setGuildField(interaction.guildId, "antiBadwords.words", cfg.antiBadwords.words);
      await interaction.reply({
        embeds: [successEmbed("Added", `\`${word}\` added to the filter`)],
        ephemeral: true,
      });
      return;
    }

    if (sub === "removebadword") {
      const word = interaction.options.getString("word", true).toLowerCase().trim();
      const next = cfg.antiBadwords.words.filter((w) => w !== word);
      setGuildField(interaction.guildId, "antiBadwords.words", next);
      await interaction.reply({
        embeds: [successEmbed("Removed", `\`${word}\` removed from the filter`)],
        ephemeral: true,
      });
      return;
    }

    if (sub === "whitelist") {
      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");
      if (!user && !role) {
        await interaction.reply({
          embeds: [errorEmbed("Nothing provided", "Pick a user or role to whitelist")],
          ephemeral: true,
        });
        return;
      }
      if (user && !cfg.whitelistedUsers.includes(user.id)) {
        cfg.whitelistedUsers.push(user.id);
        setGuildField(interaction.guildId, "whitelistedUsers", cfg.whitelistedUsers);
      }
      if (role && !cfg.whitelistedRoles.includes(role.id)) {
        cfg.whitelistedRoles.push(role.id);
        setGuildField(interaction.guildId, "whitelistedRoles", cfg.whitelistedRoles);
      }
      await interaction.reply({
        embeds: [
          successEmbed(
            "Whitelisted",
            [user && `User: ${user}`, role && `Role: ${role}`].filter(Boolean).join("\n"),
          ),
        ],
        ephemeral: true,
      });
    }
  },
};

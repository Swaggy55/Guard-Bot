export const BOT_VERSION = "1.0.0";

export const BRAND = {
  name: "Aegis Protection",
  color: 0x5865f2,
  successColor: 0x57f287,
  warnColor: 0xfee75c,
  errorColor: 0xed4245,
  footer: "Aegis • Discord Protection Suite",
};

export const DEFAULT_CONFIG = {
  prefix: "!",
  logsChannelId: null,
  muteRoleId: null,

  antiRaid: {
    enabled: true,
    joinThreshold: 8,
    joinWindowMs: 10_000,
    action: "kick",
    accountAgeMinDays: 7,
  },
  antiSpam: {
    enabled: true,
    messageThreshold: 6,
    windowMs: 5_000,
    duplicateThreshold: 3,
    action: "timeout",
    timeoutMs: 5 * 60_000,
  },
  antiMention: {
    enabled: true,
    maxMentions: 5,
    action: "timeout",
    timeoutMs: 10 * 60_000,
  },
  antiLink: {
    enabled: true,
    allowDiscordInvites: false,
    whitelist: ["tenor.com", "giphy.com"],
    action: "delete",
  },
  antiBadwords: {
    enabled: true,
    words: [],
    action: "delete",
  },
  antiBot: {
    enabled: true,
    action: "ban",
  },
  antiChannelDelete: {
    enabled: true,
    threshold: 1,
    windowMs: 30_000,
    action: "ban",
    restore: true,
  },
  antiRoleDelete: {
    enabled: true,
    threshold: 1,
    windowMs: 30_000,
    action: "ban",
    restore: true,
  },
  antiWebhook: {
    enabled: true,
    threshold: 1,
    windowMs: 30_000,
    action: "ban",
  },

  warnSystem: {
    enabled: true,
    thresholds: [
      { count: 3, action: "timeout", durationMs: 60 * 60_000 },
      { count: 5, action: "kick" },
      { count: 7, action: "ban" },
    ],
  },

  ownerAlerts: {
    enabled: true,
    minThrottleMs: 1500,
  },

  whitelistedUsers: [],
  whitelistedRoles: [],
};

export const DEFAULT_BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "cunt",
  "nigger",
  "faggot",
  "retard",
  "slut",
  "whore",
];

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/bot start` — run the Discord protection bot

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Discord Bot — Aegis Protection (`bot/`)

A standalone Node.js + discord.js v14 protection suite (workspace package, not an artifact). Runs via the `Discord Bot` workflow.

**Modules:** anti-raid, anti-spam, anti-mass-mention, anti-link, anti-badwords, anti-bot-joins, anti-channel-delete (with restore), anti-role-delete (with restore), anti-webhook spam, warn system with escalation, logs channel, slash + prefix commands, interactive setup panel with buttons and select menus.

**Required secrets:** `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`. Optional: `DISCORD_GUILD_ID` (deploy slash commands instantly to a single guild instead of globally).

**Per-guild config storage:** `bot/data/guilds.json` (auto-created, atomic writes). Defaults live in `bot/src/config.js` and merge per guild on first interaction.

**Structure:**
- `src/index.js` — entry point, intents, lifecycle
- `src/handlers/` — command + event auto-loaders, slash deployer
- `src/events/` — `ready`, `messageCreate`, `interactionCreate`, `guildMemberAdd`, `channelDelete`, `guildRoleDelete`, `webhooksUpdate`, `guildCreate`
- `src/protection/` — one file per protection module
- `src/commands/slash/` and `src/commands/prefix/` — both interfaces share helpers
- `src/interactions/` — setup panel embed/components + button handlers
- `src/utils/` — `logger`, `embeds`, `logChannel`, `moderate`, `permissions`

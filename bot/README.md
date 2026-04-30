# Aegis Protection — Discord Bot

A modern, professional Discord protection suite built on **discord.js v14** + Node.js.

## Features

- **Anti-Raid** — detect and stop join floods, kick young accounts during a wave
- **Anti-Spam** — rate-limit messages per user with duplicate detection
- **Anti-Mass-Mention** — block mention bombs and `@everyone` abuse
- **Anti-Link** — block non-whitelisted links and Discord invites
- **Anti-Badwords** — configurable filtered word list
- **Anti-Bot** — auto-action unauthorized bot adds (anyone but the owner)
- **Anti-Channel-Delete** — punish nukes and **restore deleted channels**
- **Anti-Role-Delete** — punish nukes and **recreate deleted roles**
- **Anti-Webhook** — auto-delete unauthorized webhooks and punish spam
- **Auto-mute / Auto-timeout** — automatic punishment ladder
- **Warn system** — escalating thresholds (timeout → kick → ban)
- **Logs channel** — colored embeds for every protection event
- **Slash + prefix commands** — both interfaces always available
- **Setup panel** — interactive embed with buttons + select menus

## Setup

1. Set `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` (already provided here as Replit secrets).
2. Invite the bot to your server with the `applications.commands` and `bot` scopes.
   Required permissions include: Manage Channels, Manage Roles, Manage Webhooks, Kick/Ban/Moderate Members, View Audit Log, Send Messages, Embed Links, Read Message History.
3. In your server, run `/setup` (or `!setup`) to open the configuration panel.

## Customization

Per-guild config is persisted in `bot/data/guilds.json` and is editable via:

- `/setup` — visual panel with toggles, channel selector, role selector
- `/config view` — dump current settings
- `/config set <field> <value>` — tweak any setting (autocomplete on field)
- `/config addbadword <word>` / `/config removebadword <word>`
- `/config whitelist <user|role>`
- `!prefix <new>` — change the prefix (default `!`)

## Commands

| Slash | Prefix | Purpose |
|-------|--------|---------|
| `/setup` | `!setup` | Open setup panel |
| `/config view` / `set` | `!config` | View / change config |
| `/help` | `!help` | Command list |
| `/ping` | `!ping` | Latency |
| `/warn` | `!warn` | Warn member |
| `/warnings` | `!warnings` | List warnings |
| `/clearwarns` | `!clearwarns` | Reset warnings |
| `/mute` | `!mute` | Mute member |
| `/unmute` | `!unmute` | Unmute member |
| `/timeout` | `!timeout` | Timeout for N minutes |
| `/kick` | `!kick` | Kick member |
| `/ban` | `!ban` | Ban member |

## Run

```bash
pnpm --filter @workspace/bot start
```

Slash commands are deployed globally on every startup. To deploy to a single test guild faster, set `DISCORD_GUILD_ID`.

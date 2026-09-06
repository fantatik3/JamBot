# TrankiJamBot

A small, well-structured Discord bot built with [discord.js v14](https://discord.js.org/) that:

- **Welcomes new members** in a channel, pinging them with a random friendly phrase.
- **Lets members self-assign roles** from a button menu. An admin picks the roles from a list; no config editing.
- **Lets moderators assign/remove roles** with a slash command.
- Optionally **auto-assigns a role** to everyone who joins.
- **Runs "Mata la jerga"**, a Taboo-style game: explain a game dev term without the banned words, vote for the clearest, build a glossary.

Everything the bot says in Discord (welcome messages, role menu, command descriptions, replies, errors) is in **Spanish**.
Command names such as `/role` and `/rolemenu` stay in English.

## Project structure

```
src/
├── index.js                  # Entry point: wires everything together and logs in
├── client.js                 # Creates the Discord client (intents, partials)
├── deploy-commands.js        # Registers slash commands with Discord (npm run deploy)
├── config/
│   ├── index.js              # Loads and validates .env
│   ├── jergaTerms.js         # Terms + banned words for Mata la jerga  <-- EDIT THIS
│   └── welcomePhrases.js     # Random welcome phrases  <-- EDIT THIS
├── commands/                 # One file per slash command
│   ├── jerga.js              # /jerga start|next|cancel|scores|glossary
│   ├── phrases.js            # /phrases                         (role in PREVIEW_ROLE_ID)
│   ├── ping.js               # /ping
│   ├── role.js               # /role add|remove <user> <role>   (Manage Roles)
│   ├── rolemenu.js           # /rolemenu create                 (Manage Roles)
│   └── welcome.js            # /welcome preview|send            (Manage Server)
├── events/                   # One file per gateway event
│   ├── ready.js
│   ├── guildMemberAdd.js     # Welcome message + auto-role
│   └── interactionCreate.js  # Routes commands and button clicks
├── interactions/             # Button / select-menu handlers, routed by customId prefix
│   ├── jerga.js              # Buttons + modal for Mata la jerga
│   └── roleMenu.js           # rolemenu:setup (role picker) and rolemenu:toggle:<roleId>
├── handlers/                 # Auto-loaders for commands, events, and component handlers
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── componentHandler.js
├── services/                 # Business logic, reusable by commands and events
│   ├── roleService.js        # Add/remove/toggle roles with hierarchy checks
│   ├── jergaScheduler.js     # Starts jerga rounds automatically at random times
│   ├── jergaService.js       # Mata la jerga rounds, voting, scores, glossary
│   ├── roleMenuService.js    # Validates picked roles, builds the menu embed + buttons
│   └── welcomeService.js     # Builds the welcome message
└── utils/
    ├── logger.js
    ├── random.js
    ├── store.js              # JSON persistence (data/store.json)
    ├── text.js
    └── errors.js             # UserFacingError: safe to show to users
```

## Setup

### 1. Create the bot in the Discord Developer Portal

1. Go to <https://discord.com/developers/applications> and click **New Application**.
2. **General Information** → copy the **Application ID** (this is `CLIENT_ID`).
3. **Bot** tab:
   - Click **Reset Token** and copy it (this is `DISCORD_TOKEN`). It is shown only once.
   - Under **Privileged Gateway Intents**, enable **Server Members Intent**.
     Without it the bot never sees people joining and cannot welcome them.
4. **Installation** tab (or OAuth2 → URL Generator):
   - Scopes: `bot` and `applications.commands`
   - Bot permissions: **View Channels**, **Send Messages**, **Embed Links**,
     **Read Message History**, **Manage Roles**
   - Or use this URL directly (replace `YOUR_CLIENT_ID`):

     ```
     https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=268520448
     ```
5. Open the URL and invite the bot to your server.

### 2. Fix the role hierarchy in your server

Discord only lets a bot manage roles that sit **below the bot's own role**.

Server Settings → Roles → drag the bot's role **above** every role you want it to hand out
(the self-assignable ones, the auto-role, and anything mods will assign with `/role`).

### 3. Get the IDs you need

Enable Developer Mode: Discord → User Settings → Advanced → **Developer Mode**. Then:

- Right-click your server → **Copy Server ID** → `GUILD_ID`
- Right-click the welcome channel → **Copy Channel ID** → `WELCOME_CHANNEL_ID`
- (Optional) Server Settings → Roles → right-click a role → **Copy Role ID** for `AUTO_ROLE_ID` / `PREVIEW_ROLE_ID`

### 4. Configure

```bash
cp .env.example .env      # then fill in the values
```

Edit [`src/config/welcomePhrases.js`](src/config/welcomePhrases.js) to taste
(`{user}` becomes the mention, `{server}` becomes the server name).

### 5. Install, register commands, run

On Windows, double-click **`install.bat`** (installs dependencies and registers the slash commands),
then **`run.bat`** (starts the bot; keep the window open).

Or from a terminal:

```bash
npm install
npm run deploy    # registers slash commands (instant when GUILD_ID is set)
npm start         # or: npm run dev  (auto-restarts on file changes)
```

Re-run `npm run deploy` whenever you add or change a command definition.

## Using the bot

| Command | Who | What it does |
|---|---|---|
| `/rolemenu create [channel] [title] [description]` | Manage Roles | Opens a role picker; the roles you tick become a button menu in the channel. |
| `/role add <user> <role>` | Manage Roles | Gives a role to someone. |
| `/role remove <user> <role>` | Manage Roles | Takes a role away. |
| `/welcome preview` | Manage Server | Shows you a sample welcome message (only you see it). |
| `/welcome send [user]` | Manage Server | Posts a real welcome message to the welcome channel. |
| `/phrases` | Role in `PREVIEW_ROLE_ID` | Posts every welcome phrase, numbered, in the current channel (no pings). |
| `/jerga start [duration]` | Everyone | Starts a round right now (only in the game channel). |
| `/jerga schedule` | Everyone | Shows today's automatic rounds. |
| `/jerga tutorial` | Everyone | Posts the how-to-play instructions publicly. |
| `/jerga next` / `/jerga cancel` | Host or Manage Messages | Advance to voting/results, or drop the round. |
| `/jerga scores` / `/jerga glossary` | Everyone | Leaderboard and the latest winning explanations. |
| `/ping` | Everyone | Latency check. |

The role menu is a normal message: it stays in the channel and keeps working after restarts,
because each button carries the role ID in its `customId`. To change the roles, run
`/rolemenu create` again and delete the old message. You can post several menus (for example one per
discipline). Only roles below both the bot and the admin creating the menu can be offered.

## Mata la jerga

1. `/jerga start` posts a term and five banned words. Members press **Enviar explicación** and write up to 280 characters.
   The bot rejects any text that uses the term or a banned word (case, accents and plurals ignored).
2. When the timer ends (or the host presses **Cerrar envíos y votar**), explanations are shown anonymously in
   random order with numbered vote buttons. You cannot vote for your own.
3. When voting ends, the winner is announced and pinged. Winner +3 points, everyone who submitted +1.
   The winning explanation is saved to the glossary.

Terms live in [`src/config/jergaTerms.js`](src/config/jergaTerms.js). Scores, glossary and in-progress rounds are
saved to `data/store.json`, so a restart keeps them and resumes the timers.

### Automatic rounds

With `JERGA_CHANNEL_ID` set in `.env`, the game only works in that channel and the bot starts rounds by itself:

| Variable | Default | Meaning |
|---|---|---|
| `JERGA_CHANNEL_ID` | (none) | Channel where rounds are posted. Unset = no automatic rounds, commands work anywhere. |
| `JERGA_ROUNDS_PER_DAY` | 6 | Random start times per day. 0 disables automation. With 3-hour rounds, 8 is the most that fit in a day. |
| `JERGA_ACTIVE_HOURS` | 0-24 | Rounds only start inside this window (local time of the machine running the bot). 0-24 is all day. |
| `JERGA_SUBMIT_MINUTES` | 120 | How long people have to send explanations. |
| `JERGA_VOTE_MINUTES` | 60 | How long voting stays open. |
| `JERGA_ROUND_ON_START` | false | Also post a round the moment the bot logs in. Useful for testing. |

Each day the bot draws the start times once, spreads them so rounds never overlap, and saves the plan so a
restart keeps it. Automatic rounds are hosted by the bot; anyone with Manage Messages can still use
`/jerga next` or `/jerga cancel` on them. `/jerga schedule` shows what is coming today.

## Adding things

- **New slash command**: drop a file in `src/commands/` exporting `{ data, execute }`, then `npm run deploy`.
- **New event**: drop a file in `src/events/` exporting `{ name, once?, execute }`.
- **New button/menu**: drop a file in `src/interactions/` exporting `{ prefix, execute }` and build
  customIds as `prefix:arg1:arg2` with `buildCustomId()` from `handlers/componentHandler.js`.
- Throw `UserFacingError` for anything the user should read; other errors are logged and replaced
  with a generic message.

## Troubleshooting

- **No welcome messages**: Server Members Intent is off, `WELCOME_CHANNEL_ID` is wrong, or the bot
  cannot view/send in that channel.
- **"No puedo gestionar <rol>"**: the bot's role is below that role, or it lacks Manage Roles.
- **Slash commands missing**: run `npm run deploy`. Global commands (no `GUILD_ID`) can take up to an hour.
- **Buttons say "This interaction failed"**: the bot is offline or crashed; check the console.

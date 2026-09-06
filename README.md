# JamBot

[Versión en español](README.es.md)

Discord bot for the Tranki Jam mentor server, built with [discord.js v14](https://discord.js.org/).

It welcomes new members with a random phrase, lets people pick their own roles from a button menu,
gives moderators a command to assign roles, and runs "Mata la jerga", a Taboo-style game where you
explain a game dev term without using the banned words.

Everything the bot says in Discord is in Spanish. Command names such as `/role` and `/rolemenu`
stay in English.

## Project structure

```
src/
├── index.js                  # Entry point: wires everything together and logs in
├── client.js                 # Creates the Discord client (intents, partials)
├── deploy-commands.js        # Registers slash commands with Discord (npm run deploy)
├── config/
│   ├── index.js              # Loads and validates .env
│   ├── jergaTerms.js         # Terms and banned words for Mata la jerga
│   └── welcomePhrases.js     # Welcome phrases
├── commands/                 # One file per slash command
│   ├── jerga.js              # /jerga start|next|cancel|scores|glossary|schedule|tutorial
│   ├── phrases.js            # /phrases                         (role in PREVIEW_ROLE_ID)
│   ├── ping.js               # /ping
│   ├── role.js               # /role add|remove <user> <role>   (Manage Roles)
│   ├── rolemenu.js           # /rolemenu create                 (Manage Roles)
│   └── welcome.js            # /welcome preview|send            (Manage Server)
├── events/                   # One file per gateway event
│   ├── ready.js
│   ├── guildMemberAdd.js     # Welcome message and auto-role
│   └── interactionCreate.js  # Routes commands, buttons and modals
├── interactions/             # Button, select menu and modal handlers, routed by customId prefix
│   ├── jerga.js              # Buttons and modal for Mata la jerga
│   └── roleMenu.js           # rolemenu:setup (role picker) and rolemenu:toggle:<roleId>
├── handlers/                 # Loaders for commands, events and component handlers
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── componentHandler.js
├── services/                 # Logic shared by commands and events
│   ├── jergaScheduler.js     # Starts jerga rounds automatically at random times
│   ├── jergaService.js       # Mata la jerga rounds, voting, scores, glossary
│   ├── roleMenuService.js    # Validates picked roles, builds the menu
│   ├── roleService.js        # Add, remove and toggle roles with hierarchy checks
│   └── welcomeService.js     # Builds the welcome message
└── utils/
    ├── errors.js             # UserFacingError, safe to show to users
    ├── logger.js
    ├── random.js
    ├── store.js              # JSON persistence (data/store.json)
    └── text.js
```

## Setup

### 1. Create the bot in the Discord Developer Portal

1. Go to <https://discord.com/developers/applications> and click New Application.
2. In General Information, copy the Application ID. That is `CLIENT_ID`.
3. In the Bot tab, click Reset Token and copy the token. That is `DISCORD_TOKEN`. It is shown only once.
4. Still in the Bot tab, under Privileged Gateway Intents, enable Server Members Intent.
   Without it the bot never sees people joining and cannot welcome them.
5. In the Installation tab (or OAuth2 > URL Generator), pick the `bot` and `applications.commands`
   scopes and these permissions: View Channels, Send Messages, Embed Links, Read Message History,
   Manage Roles. Or use this URL with your own client id:

   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=268520448
   ```

6. Open the URL and invite the bot to your server.

### 2. Role hierarchy

Discord only lets a bot manage roles that sit below the bot's own role. In Server Settings > Roles,
drag the bot's role above every role it should hand out: the self-assignable ones, the auto-role, and
anything moderators will assign with `/role`.

### 3. IDs you need

Enable Developer Mode in Discord (User Settings > Advanced). Then right-click to copy:

- your server, for `GUILD_ID`
- the welcome channel, for `WELCOME_CHANNEL_ID`
- the game channel, for `JERGA_CHANNEL_ID`
- optionally a role, for `AUTO_ROLE_ID` and `PREVIEW_ROLE_ID`

### 4. Configure

```bash
cp .env.example .env      # then fill in the values
```

Welcome phrases live in [`src/config/welcomePhrases.js`](src/config/welcomePhrases.js). `{user}` becomes
the mention and `{server}` the server name.

### 5. Install, register commands, run

On Windows, run `install.bat` (installs dependencies and registers the slash commands), then `run.bat`
(starts the bot; keep the window open).

From a terminal:

```bash
npm install
npm run deploy    # registers slash commands (instant when GUILD_ID is set)
npm start         # or: npm run dev, which restarts on file changes
```

Run `npm run deploy` again whenever you add or change a command definition. Run only one instance of
the bot at a time: two copies with the same token answer the same interactions and confuse each other.

## Commands

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

The role menu is a normal message. It stays in the channel and keeps working after restarts because
each button carries the role id in its `customId`. To change the roles, run `/rolemenu create` again and
delete the old message. You can post several menus, for example one per discipline. Only roles below
both the bot and the admin creating the menu can be offered.

## Mata la jerga

1. A round posts a term and five banned words. Members press "Enviar explicación" and write up to
   280 characters. The bot rejects any text that uses the term or a banned word, ignoring case, accents
   and plurals.
2. When the timer ends, or the host presses "Cerrar envíos y votar", the explanations are shown
   anonymously in random order with numbered vote buttons. You cannot vote for your own.
3. When voting ends, the winner is announced and pinged. Winner +3 points, everyone who submitted +1.
   Ties share the win, and if nobody voted one explanation is picked at random. The winning explanation
   goes into the glossary.

Terms live in [`src/config/jergaTerms.js`](src/config/jergaTerms.js). Scores, glossary and in-progress
rounds are saved to `data/store.json`, so a restart keeps them and resumes the timers.

### Automatic rounds

With `JERGA_CHANNEL_ID` set, the game only works in that channel and the bot starts rounds by itself.

| Variable | Default | Meaning |
|---|---|---|
| `JERGA_CHANNEL_ID` | (none) | Channel where rounds are posted. Unset means no automatic rounds and commands work anywhere. |
| `JERGA_ROUNDS_PER_DAY` | 6 | Random start times per day. 0 disables automation. With 3-hour rounds, 8 is the most that fit in a day. |
| `JERGA_ACTIVE_HOURS` | 0-24 | Rounds only start inside this window, in the local time of the machine running the bot. |
| `JERGA_SUBMIT_MINUTES` | 120 | How long people have to send explanations. |
| `JERGA_VOTE_MINUTES` | 60 | How long voting stays open. |
| `JERGA_ROUND_ON_START` | false | Also post a round the moment the bot logs in. Useful while testing. |

Each day the bot draws the start times once, spreads them so rounds never overlap, and saves the plan so a
restart keeps it. Automatic rounds are hosted by the bot; anyone with Manage Messages can still use
`/jerga next` or `/jerga cancel` on them.

## Extending

To add a slash command, drop a file in `src/commands/` exporting `{ data, execute }` and run
`npm run deploy`. Events go in `src/events/` exporting `{ name, once?, execute }`. Buttons, menus and
modals go in `src/interactions/` exporting `{ prefix, execute }`, with customIds built as
`prefix:arg1:arg2` through `buildCustomId()` from `handlers/componentHandler.js`.

Throw `UserFacingError` for anything the user should read. Any other error is logged and replaced with
a generic message.

## Troubleshooting

No welcome messages: the Server Members Intent is off, `WELCOME_CHANNEL_ID` is wrong, or the bot cannot
view or send in that channel.

"No puedo gestionar <rol>": the bot's role is below that role, or it lacks Manage Roles.

Slash commands missing or answering "Comando desconocido": run `npm run deploy` and restart the bot. Global
commands (no `GUILD_ID`) can take up to an hour to appear.

Buttons say "This interaction failed" or a round is "already over" right after posting: the bot is
offline, crashed, or a second copy of it is running somewhere else. Check the console and keep a single
instance.

# JamBot

[Versión en español](README.md)

Discord bot for the Tranki Jam mentor server, built with [discord.js v14](https://discord.js.org/).

It welcomes new members with a random phrase, lets people pick their own roles from a button menu,
gives moderators a command to assign roles, and runs six short educational games for mentors, from
explaining a term without jargon to spotting a planted bug.

Everything the bot says in Discord is in Spanish. Command names such as `/role` and `/rolemenu`
stay in English.

## Project structure

```
src/
├── index.js                  # Entry point: wires everything together and logs in
├── client.js                 # Creates the Discord client (intents, partials)
├── deploy-commands.js        # Registers slash commands with Discord (npm run deploy)
├── i18n.js                   # t(key) returns the text in the BOT_LANGUAGE language
├── config/
│   └── index.js              # Loads and validates .env
├── locales/                  # Everything the bot says, one folder per language
│   ├── index.js              # Available languages (es, en)
│   ├── es/                   # common.js, roles.js, welcome.js (with the phrases), engine.js, games/<game>.js
│   └── en/                   # The same in English
├── games/                    # One folder per educational game
│   ├── index.js              # Registry: list a game here and its command, buttons and rounds appear
│   ├── engine/               # Shared round engine
│   │   ├── roundEngine.js    # Submissions, voting, points, glossary, timers, storage
│   │   ├── messages.js       # Embeds, buttons and modal; texts come from locales/
│   │   ├── command.js        # Builds /<game> start|next|cancel|scores|glossary|schedule|tutorial
│   │   └── interaction.js    # Builds the button and modal handler for a game
│   ├── jerga/                # Mata la jerga: index.js + terms.js
│   ├── triaje/               # Triaje: index.js + scenarios.js
│   ├── nombralo/             # Nómbralo: index.js + items.js
│   ├── scope/                # Scope it: index.js + features.js
│   ├── bugs/                 # Caza el bug: index.js + snippets/ (one file per language)
│   ├── smells/               # Huele mal: index.js + snippets/ (one file per language)
│   └── trivia/               # Trivia por disciplina: index.js + questions/ (one file per discipline)
├── commands/                 # Slash commands
│   ├── games.js              # One command per registered game
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
│   ├── games.js              # One handler per registered game
│   └── roleMenu.js           # rolemenu:setup (role picker) and rolemenu:toggle:<roleId>
├── handlers/                 # Loaders for commands, events and component handlers
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── componentHandler.js
├── services/                 # Logic shared by commands and events
│   ├── gameScheduler.js      # Starts game rounds automatically, rotating between games
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
- one channel per game, for `JERGA_CHANNEL_ID`, `TRIAJE_CHANNEL_ID`, `NOMBRALO_CHANNEL_ID`, `SCOPE_CHANNEL_ID`,
  `BUGS_CHANNEL_ID` and `TRIVIA_CHANNEL_ID`
- optionally a role, for `AUTO_ROLE_ID` and `PREVIEW_ROLE_ID`

### 4. Configure

```bash
cp .env.example .env      # then fill in the values
```

`BOT_LANGUAGE` picks the language of everything the bot says: `es` (default) or `en`. Texts live in
`src/locales/<language>/`; the welcome phrases are in each language's `welcome.js`, where `{user}` becomes
the mention and `{server}` the server name. After changing the language, run `npm run deploy` so the
command descriptions are registered in the new language.

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
| `/<game> start [duration]` | Everyone | Starts a round of that game right now (only in that game's channel). |
| `/<game> next` / `/<game> cancel` | Host or Manage Messages | Advance to voting/results, or drop the round. |
| `/<game> scores` / `/<game> glossary` | Everyone | Leaderboard with points from all games; latest winning answers of that game. |
| `/<game> schedule` | Everyone | Today's automatic rounds. |
| `/<game> tutorial` | Role in `PREVIEW_ROLE_ID` | Posts the how-to-play publicly in the current channel, whatever channel that is. |
| `/<game> test [duration]` | Role in `PREVIEW_ROLE_ID` | Short test round in the current channel, whatever channel that is. |
| `/ping` | Everyone | Latency check. |

`<game>` is one of jerga, triaje, nombralo, scope, bugs or trivia.

The role menu is a normal message. It stays in the channel and keeps working after restarts because
each button carries the role id in its `customId`. To change the roles, run `/rolemenu create` again and
delete the old message. You can post several menus, for example one per discipline. Only roles below
both the bot and the admin creating the menu can be offered.

## Games

Every game runs on the same engine: a prompt is posted in that game's channel, people answer, the winner gets
points and the winning answer goes to that game's glossary. Rounds start on their own during the day, rotating
between games, each in its own channel, with at most one round per channel at a time. There are three shapes of round:

- Vote: answers go through a form, are shown anonymously in random order, and everyone votes for the best one.
  Ties share the win; if nobody votes, one answer is picked at random.
- Judge: answers go through a form and the game decides the winner by a rule, with no voting.
- Choice: the question has lettered options and you press one. Whoever picks the right one wins.

| Game | Command | Round | What you do |
|---|---|---|---|
| Mata la jerga | `/jerga` | Vote | Explain a game dev term without using five banned words. 255 terms. |
| Triaje | `/triaje` | Vote | Read a vague message from someone stuck and list the three questions you would ask first. 130 cases. |
| Nómbralo | `/nombralo` | Vote | Propose the clearest name for a described variable, function, class or asset. 150 items. |
| Scope it | `/scope` | Judge | Estimate the hours a jam task takes; closest to the group median wins. 120 tasks. |
| Caza el bug | `/bugs` | Vote | Find the planted bug in a short snippet of C#, GDScript, JavaScript, C++, GLSL or Python. The fix is revealed with the results. 188 snippets, at least 30 per language. |
| Huele mal | `/smells` | Vote | Read a snippet that works but is badly written and say what you would change and why. The suggested change is revealed with the results. 180 snippets, 30 per language. |
| Trivia por disciplina | `/trivia` | Choice | A four-option question about programming, art, audio, design, narrative or production, with an explanation. 202 questions. |

Every game has the same subcommands: `start`, `next`, `cancel`, `scores`, `glossary`, `schedule`, `tutorial` and
`test`. Points are shared across games, so `scores` shows one leaderboard; glossaries are per game. `tutorial` and
`test` are reserved for the tester role and work in any channel.

`/<game> test [duration]` is for the tester role set in `PREVIEW_ROLE_ID`. It starts a short round, 2 minutes per
phase by default, in whatever channel you run it, so you can try a game outside its channel. `next` and
`cancel` work on it as usual.

Banks live in each game folder under `src/games/<id>/`. Scores, glossaries and in-progress rounds of every game
are saved to `data/store.json`, so a restart keeps them and resumes the timers.

### Automatic rounds

Each game has its own channel, set with `<ID>_CHANNEL_ID` (for example `TRIAJE_CHANNEL_ID`). A game only answers
commands in its channel and its automatic rounds are posted there. `GAMES_CHANNEL_ID` is an optional fallback for
games without their own variable; a game with neither has no automatic rounds and answers commands anywhere.
Automatic rounds rotate between the games that have a channel.

| Variable | Default | Meaning |
|---|---|---|
| `JERGA_CHANNEL_ID`, `TRIAJE_CHANNEL_ID`, ... | (none) | Channel of each game: commands work only there and its rounds are posted there. |
| `GAMES_CHANNEL_ID` | (none) | Fallback channel for games without their own variable. |
| `GAMES_ROUNDS_PER_DAY` | 6 | Random start times per day, shared by all games in rotation (6 means one round of each game). 0 disables automation. |
| `GAMES_ACTIVE_HOURS` | 0-24 | Rounds only start inside this window, in the local time of the machine running the bot. |
| `GAMES_SUBMIT_MINUTES` | 120 | How long people have to send explanations. |
| `GAMES_VOTE_MINUTES` | 60 | How long voting stays open. |
| `GAMES_ROUND_ON_START` | false | What to post when the bot logs in: `false` nothing, `true` one round (next game in rotation), `all` one round of every game in its channel. Useful for testing. |
| `GAMES_ROUND_ON_START_MINUTES` | (none) | Minutes per phase for those startup rounds. Empty means the normal durations. |

Each day the bot draws the start times once, spreads them so rounds never overlap, and saves the plan so a
restart keeps it. Automatic rounds are hosted by the bot; anyone with Manage Messages can still use
`/jerga next` or `/jerga cancel` on them.

## Extending

### Adding a game

Every game lives in its own folder under `src/games/` and shares the round engine: a prompt is posted,
people answer through a form, answers are voted anonymously, the winner gets points and the answer goes
to the glossary. To add one:

1. Copy `src/games/jerga/` to `src/games/<id>/` and edit `index.js`: the id becomes the command name
   (`/<id>`) and the customId prefix; `pickPrompt` chooses what to ask, `promptBody` renders it and
   `validateAnswer` rejects bad answers.
2. Create `src/locales/es/games/<id>.js` (and its `en/` counterpart) with the name, description, texts
   and `tutorial` of the game; the answer noun and any engine text can be overridden in `strings`.
   Register it in each language's `index.js`.
3. Add it to the list in `src/games/index.js`.
4. Run `npm run deploy`.

The command, the buttons, the scheduler rotation, scores and glossary come for free. Set `mode: 'judge'` with a
`pickWinners` function to skip voting and decide by a rule, or `mode: 'choice'` with `options` and `correct` in
the prompt for lettered answers.

### Adding a language

Everything the bot says comes from `src/locales/<code>/` and is chosen with `BOT_LANGUAGE` in `.env` (`es`
by default, `en` available). To add one:

1. Copy `src/locales/es/` to `src/locales/<code>/` and translate its files: `common.js`, `roles.js`,
   `welcome.js` (includes the welcome phrases), `engine.js` and `games/<game>.js`.
2. Register it in `src/locales/index.js`.
3. Run `npm run check:locales` to see which keys are missing or extra compared with Spanish, and
   `npm run deploy` to register the command descriptions in the new language.

Any missing key falls back to Spanish with a warning in the log. Command names (`/jerga`, `/triaje`...) do
not change with the language, and the game banks (terms, cases, questions, code snippets) are Spanish
content that is not translated either.

### Other things

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

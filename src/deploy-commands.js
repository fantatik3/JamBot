/**
 * Registers slash commands with Discord. Run with `npm run deploy`.
 *
 * - If GUILD_ID is set, commands are registered to that server only (instant).
 * - Otherwise they are registered globally (can take up to an hour to appear).
 *
 * Re-run this whenever you add, remove, or change a command definition.
 */
const { REST, Routes } = require('discord.js');
const config = require('./config');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');

async function main() {
  const body = loadCommands().map((command) => command.data.toJSON());
  const rest = new REST().setToken(config.token);

  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  const scope = config.guildId ? `to guild ${config.guildId}` : 'globally';
  logger.info(`Registering ${body.length} command(s) ${scope}...`);

  const result = await rest.put(route, { body });
  const names = result.map((command) => `/${command.name}`).join(', ');
  logger.info(`Done. ${result.length} command(s) registered: ${names}`);
}

main().catch((error) => {
  logger.error('Failed to register commands:', error);
  process.exit(1);
});

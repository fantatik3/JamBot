/**
 * Registra los comandos de barra en Discord. Se ejecuta con `npm run deploy`.
 *
 * - Si GUILD_ID está definido, los comandos se registran solo en ese servidor (al instante).
 * - Si no, se registran de forma global (pueden tardar hasta una hora en aparecer).
 *
 * Vuelve a ejecutarlo cada vez que añadas, quites o cambies la definición de un comando.
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

/**
 * Descubre los comandos de barra en `src/commands`.
 * Cada módulo de comando debe exportar `{ data: SlashCommandBuilder, execute(interaction) }`.
 */
const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

/**
 * @typedef {object} Command
 * @property {import('discord.js').SlashCommandBuilder} data
 * @property {(interaction: import('discord.js').ChatInputCommandInteraction) => Promise<void>} execute
 */

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/** @returns {Collection<string, Command>} */
function loadCommands() {
  const commands = new Collection();
  const files = fs.readdirSync(COMMANDS_DIR).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(COMMANDS_DIR, file);
    const command = require(filePath);

    if (!command?.data?.name || typeof command.execute !== 'function') {
      logger.warn(`Skipping ${file}: missing "data" or "execute" export.`);
      continue;
    }

    commands.set(command.data.name, command);
    logger.debug(`Loaded command /${command.data.name}`);
  }

  logger.info(`Loaded ${commands.size} command(s).`);
  return commands;
}

module.exports = { loadCommands };

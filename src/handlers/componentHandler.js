/**
 * Discovers message-component handlers (buttons, select menus) in `src/interactions`.
 *
 * Handlers are routed by the first segment of the component's customId.
 * A customId of `rolemenu:toggle:123` is dispatched to the handler whose
 * `prefix` is `rolemenu`, receiving `['toggle', '123']` as args.
 *
 * Every handler module must export `{ prefix: string, execute(interaction, args) }`.
 */
const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

/**
 * @typedef {object} ComponentHandler
 * @property {string} prefix
 * @property {(interaction: import('discord.js').MessageComponentInteraction, args: string[]) => Promise<void>} execute
 */

const INTERACTIONS_DIR = path.join(__dirname, '..', 'interactions');
const SEPARATOR = ':';

/** @returns {Collection<string, ComponentHandler>} */
function loadComponentHandlers() {
  const handlers = new Collection();
  const files = fs.readdirSync(INTERACTIONS_DIR).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const handler = require(path.join(INTERACTIONS_DIR, file));

    if (!handler?.prefix || typeof handler.execute !== 'function') {
      logger.warn(`Skipping ${file}: missing "prefix" or "execute" export.`);
      continue;
    }

    handlers.set(handler.prefix, handler);
    logger.debug(`Loaded component handler "${handler.prefix}"`);
  }

  logger.info(`Loaded ${handlers.size} component handler(s).`);
  return handlers;
}

/** Splits `prefix:arg1:arg2` into `{ prefix, args }`. */
function parseCustomId(customId) {
  const [prefix, ...args] = customId.split(SEPARATOR);
  return { prefix, args };
}

/** Builds a customId from a prefix and args. */
function buildCustomId(prefix, ...args) {
  return [prefix, ...args].join(SEPARATOR);
}

module.exports = { loadComponentHandlers, parseCustomId, buildCustomId };

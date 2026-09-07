/**
 * Descubre los manejadores de componentes (botones, menús, modales) en `src/interactions`.
 *
 * Los manejadores se eligen por el primer segmento del customId del componente.
 * Un customId `rolemenu:toggle:123` se envía al manejador cuyo `prefix` es `rolemenu`,
 * que recibe `['toggle', '123']` como argumentos.
 *
 * Cada módulo debe exportar `{ prefix: string, execute(interaction, args) }`
 * o un array de esos objetos.
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
    const exported = require(path.join(INTERACTIONS_DIR, file));
    const list = Array.isArray(exported) ? exported : [exported];

    for (const handler of list) {
      if (!handler?.prefix || typeof handler.execute !== 'function') {
        logger.warn(`Skipping ${file}: missing "prefix" or "execute" export.`);
        continue;
      }
      handlers.set(handler.prefix, handler);
      logger.debug(`Loaded component handler "${handler.prefix}"`);
    }
  }

  logger.info(`Loaded ${handlers.size} component handler(s).`);
  return handlers;
}

/** Divide `prefix:arg1:arg2` en `{ prefix, args }`. */
function parseCustomId(customId) {
  const [prefix, ...args] = customId.split(SEPARATOR);
  return { prefix, args };
}

/** Construye un customId a partir de un prefijo y sus argumentos. */
function buildCustomId(prefix, ...args) {
  return [prefix, ...args].join(SEPARATOR);
}

module.exports = { loadComponentHandlers, parseCustomId, buildCustomId };

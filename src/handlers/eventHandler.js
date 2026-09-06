/**
 * Descubre los escuchadores de eventos del gateway en `src/events` y los conecta al cliente.
 * Cada módulo de evento debe exportar `{ name: Events.X, once?: boolean, execute(...args, client) }`.
 */
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

function loadEvents(client) {
  const files = fs.readdirSync(EVENTS_DIR).filter((file) => file.endsWith('.js'));
  let count = 0;

  for (const file of files) {
    const event = require(path.join(EVENTS_DIR, file));

    if (!event?.name || typeof event.execute !== 'function') {
      logger.warn(`Skipping ${file}: missing "name" or "execute" export.`);
      continue;
    }

    const listener = (...args) =>
      Promise.resolve(event.execute(...args, client)).catch((error) =>
        logger.error(`Unhandled error in event "${event.name}":`, error),
      );

    if (event.once) client.once(event.name, listener);
    else client.on(event.name, listener);

    count += 1;
    logger.debug(`Bound event ${event.name}${event.once ? ' (once)' : ''}`);
  }

  logger.info(`Bound ${count} event listener(s).`);
}

module.exports = { loadEvents };

const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const engine = require('../games/engine/roundEngine');
const scheduler = require('../services/gameScheduler');
const { games } = require('../games');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /** @param {import('discord.js').Client<true>} client */
  async execute(client) {
    client.user.setPresence({
      // El estado personalizado muestra `state` tal cual, sin el prefijo "Jugando a"/"Viendo" en ningún idioma del cliente.
      activities: [{ name: 'estado', type: ActivityType.Custom, state: 'Dando la bienvenida a los nuevos miembros' }],
      status: 'online',
    });
    await engine.resume(client, games);
    scheduler.start(client);
    logger.info(`Logged in as ${client.user.tag}, serving ${client.guilds.cache.size} guild(s).`);
  },
};

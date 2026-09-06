const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const jergaService = require('../services/jergaService');
const jergaScheduler = require('../services/jergaScheduler');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /** @param {import('discord.js').Client<true>} client */
  async execute(client) {
    client.user.setPresence({
      // Custom status shows `state` as-is, with no "Playing"/"Watching" prefix in any client language.
      activities: [{ name: 'estado', type: ActivityType.Custom, state: 'Dando la bienvenida a los nuevos miembros' }],
      status: 'online',
    });
    jergaService.resume(client);
    jergaScheduler.start(client);
    logger.info(`Logged in as ${client.user.tag}, serving ${client.guilds.cache.size} guild(s).`);
  },
};

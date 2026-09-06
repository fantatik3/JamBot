/**
 * Crea el cliente de Discord solo con los intents que necesita este bot.
 *
 * GuildMembers es un intent PRIVILEGIADO: hay que activarlo en
 * Portal de desarrolladores > Bot > Privileged Gateway Intents > Server Members Intent,
 * o el evento `guildMemberAdd` (mensajes de bienvenida) nunca se dispara.
 */
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

function createClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember],
  });

  /** @type {Collection<string, import('./handlers/commandHandler').Command>} */
  client.commands = new Collection();
  /** @type {Collection<string, import('./handlers/componentHandler').ComponentHandler>} */
  client.componentHandlers = new Collection();

  return client;
}

module.exports = { createClient };

/**
 * Builds the Discord client with only the intents this bot needs.
 *
 * GuildMembers is a PRIVILEGED intent: it must be enabled in
 * Developer Portal > Bot > Privileged Gateway Intents > Server Members Intent,
 * otherwise `guildMemberAdd` (welcome messages) never fires.
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

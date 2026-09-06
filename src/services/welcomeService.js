/**
 * Construye el mensaje de bienvenida para un miembro nuevo.
 */
const phrases = require('../config/welcomePhrases');
const { pickRandom } = require('../utils/random');

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {import('discord.js').MessageCreateOptions}
 */
function buildWelcomeMessage(member) {
  const content = pickRandom(phrases)
    .replaceAll('{user}', member.toString())
    .replaceAll('{server}', member.guild.name);

  return {
    content,
    // Solo notifica al miembro nuevo, nunca a @everyone ni a roles aunque una frase los incluya.
    allowedMentions: { users: [member.id] },
  };
}

module.exports = { buildWelcomeMessage };

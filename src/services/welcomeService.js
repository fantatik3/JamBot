/**
 * Construye el mensaje de bienvenida para un miembro nuevo. Las frases viven en el idioma
 * configurado (src/locales/<idioma>/welcome.js).
 */
const { pickRandom } = require('../utils/random');
const { get } = require('../i18n');

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {import('discord.js').MessageCreateOptions}
 */
function buildWelcomeMessage(member) {
  const content = pickRandom(get('welcome.phrases'))
    .replaceAll('{user}', member.toString())
    .replaceAll('{server}', member.guild.name);

  return {
    content,
    // Solo notifica al miembro nuevo, nunca a @everyone ni a roles aunque una frase los incluya.
    allowedMentions: { users: [member.id] },
  };
}

module.exports = { buildWelcomeMessage };

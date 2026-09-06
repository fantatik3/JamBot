/**
 * Builds the welcome message payload for a new member.
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
    // Only ping the new member, never @everyone or roles even if a phrase contained them.
    allowedMentions: { users: [member.id] },
  };
}

module.exports = { buildWelcomeMessage };

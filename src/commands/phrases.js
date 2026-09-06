/**
 * /phrases
 * Posts every welcome phrase in the current channel so they can be reviewed.
 * Only members holding the role in PREVIEW_ROLE_ID can use it.
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const config = require('../config');
const phrases = require('../config/welcomePhrases');
const { chunkLines } = require('../utils/text');
const { UserFacingError } = require('../utils/errors');

// Keep a margin under Discord's 2000-character message limit.
const MAX_MESSAGE_LENGTH = 1900;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('phrases')
    .setDescription('Muestra todas las frases de bienvenida en este canal.')
    .setContexts(InteractionContextType.Guild),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    if (!config.previewRoleId) {
      throw new UserFacingError('PREVIEW_ROLE_ID no está definido en el archivo .env.');
    }

    if (!interaction.member.roles.cache.has(config.previewRoleId)) {
      throw new UserFacingError(`Este comando solo está disponible para el rol <@&${config.previewRoleId}>.`);
    }

    const lines = phrases.map((phrase, index) => {
      const rendered = phrase
        .replaceAll('{user}', interaction.member.toString())
        .replaceAll('{server}', interaction.guild.name);
      return `**${index + 1}.** ${rendered}`;
    });

    const chunks = chunkLines([`**Frases de bienvenida (${phrases.length}):**`, ...lines], MAX_MESSAGE_LENGTH);

    // Mentions still render, but nobody gets pinged.
    const noPings = { allowedMentions: { parse: [] } };
    await interaction.reply({ content: chunks[0], ...noPings });
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, ...noPings });
    }
  },
};

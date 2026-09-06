/**
 * /phrases
 * Publica todas las frases de bienvenida en el canal actual para revisarlas.
 * Solo pueden usarlo los miembros con el rol de PREVIEW_ROLE_ID.
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const config = require('../config');
const phrases = require('../config/welcomePhrases');
const { chunkLines } = require('../utils/text');
const { UserFacingError } = require('../utils/errors');

// Deja margen por debajo del límite de 2000 caracteres por mensaje de Discord.
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

    // Las menciones se muestran, pero no notifican a nadie.
    const noPings = { allowedMentions: { parse: [] } };
    await interaction.reply({ content: chunks[0], ...noPings });
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, ...noPings });
    }
  },
};

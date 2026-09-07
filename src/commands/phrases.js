/**
 * /phrases
 * Publica todas las frases de bienvenida en el canal actual para revisarlas.
 * Solo pueden usarlo los miembros con el rol de PREVIEW_ROLE_ID.
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const config = require('../config');
const { chunkLines } = require('../utils/text');
const { UserFacingError } = require('../utils/errors');
const { t, get } = require('../i18n');

// Deja margen por debajo del límite de 2000 caracteres por mensaje de Discord.
const MAX_MESSAGE_LENGTH = 1900;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('phrases')
    .setDescription(t('welcome.phrasesCommand.description'))
    .setContexts(InteractionContextType.Guild),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    if (!config.testerRoleId) {
      throw new UserFacingError(t('common.envMissing', { name: 'PREVIEW_ROLE_ID' }));
    }

    if (!interaction.member.roles.cache.has(config.testerRoleId)) {
      throw new UserFacingError(t('common.testerRoleOnly', { roleId: config.testerRoleId }));
    }

    const phrases = get('welcome.phrases');
    const lines = phrases.map((phrase, index) => {
      const rendered = phrase
        .replaceAll('{user}', interaction.member.toString())
        .replaceAll('{server}', interaction.guild.name);
      return `**${index + 1}.** ${rendered}`;
    });

    const header = t('welcome.phrasesCommand.header', { count: phrases.length });
    const chunks = chunkLines([header, ...lines], MAX_MESSAGE_LENGTH);

    // Las menciones se muestran, pero no notifican a nadie.
    const noPings = { allowedMentions: { parse: [] } };
    await interaction.reply({ content: chunks[0], ...noPings });
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, ...noPings });
    }
  },
};

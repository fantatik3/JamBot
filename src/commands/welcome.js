/**
 * /welcome preview        -> te muestra cómo queda un mensaje de bienvenida (solo lo ves tú)
 * /welcome send [user]    -> publica un mensaje de bienvenida real en el canal de bienvenida
 */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const config = require('../config');
const { buildWelcomeMessage } = require('../services/welcomeService');
const { UserFacingError } = require('../utils/errors');
const { t } = require('../i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription(t('welcome.command.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) => sub.setName('preview').setDescription(t('welcome.command.preview')))
    .addSubcommand((sub) =>
      sub
        .setName('send')
        .setDescription(t('welcome.command.send'))
        .addUserOption((opt) => opt.setName('user').setDescription(t('welcome.command.user'))),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.options.getMember('user') ?? interaction.member;

    if (!member) {
      throw new UserFacingError(t('common.notAMember'));
    }

    const payload = buildWelcomeMessage(member);

    if (sub === 'preview') {
      await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
      return;
    }

    if (!config.welcomeChannelId) {
      throw new UserFacingError(t('common.envMissing', { name: 'WELCOME_CHANNEL_ID' }));
    }

    const channel = interaction.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel?.isTextBased()) {
      throw new UserFacingError(t('welcome.command.channelMissing'));
    }

    const message = await channel.send(payload);
    await interaction.reply({ content: t('welcome.command.sent', { url: message.url }), flags: MessageFlags.Ephemeral });
  },
};

/**
 * /welcome preview        -> te muestra cómo queda un mensaje de bienvenida (solo lo ves tú)
 * /welcome send [user]    -> publica un mensaje de bienvenida real en el canal de bienvenida
 */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const config = require('../config');
const { buildWelcomeMessage } = require('../services/welcomeService');
const { UserFacingError } = require('../utils/errors');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Prueba el mensaje de bienvenida.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub.setName('preview').setDescription('Muestra un mensaje de bienvenida de ejemplo (solo tú lo ves).'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('send')
        .setDescription('Publica un mensaje de bienvenida en el canal de bienvenida.')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Miembro al que dar la bienvenida (por defecto, tú)'),
        ),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.options.getMember('user') ?? interaction.member;

    if (!member) {
      throw new UserFacingError('Ese usuario no es miembro de este servidor.');
    }

    const payload = buildWelcomeMessage(member);

    if (sub === 'preview') {
      await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
      return;
    }

    if (!config.welcomeChannelId) {
      throw new UserFacingError('WELCOME_CHANNEL_ID no está definido en el archivo .env.');
    }

    const channel = interaction.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel?.isTextBased()) {
      throw new UserFacingError('No se encontró el canal de bienvenida configurado o no es un canal de texto.');
    }

    const message = await channel.send(payload);
    await interaction.reply({ content: `Mensaje de bienvenida enviado: ${message.url}`, flags: MessageFlags.Ephemeral });
  },
};

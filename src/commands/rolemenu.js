/**
 * /rolemenu create [channel] [title] [description]
 * Muestra al administrador un selector de roles; los roles elegidos se convierten en un menú de
 * botones autoasignables publicado en el canal elegido. El selector se gestiona en interactions/roleMenu.js.
 */
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  InteractionContextType,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
} = require('discord.js');
const { PREFIX, ACTION_SETUP, MAX_ROLES, rememberSetup } = require('../services/roleMenuService');
const { buildCustomId } = require('../handlers/componentHandler');
const { UserFacingError } = require('../utils/errors');

const REQUIRED_CHANNEL_PERMS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Gestiona los menús de roles autoasignables.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Elige roles de una lista y publica un menú para que los miembros se los asignen.')
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('Dónde publicar el menú (por defecto, este canal)')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addStringOption((opt) =>
          opt.setName('title').setDescription('Título del menú (por defecto: "Elige tus roles")').setMaxLength(256),
        )
        .addStringOption((opt) =>
          opt.setName('description').setDescription('Texto explicativo que aparece bajo el título').setMaxLength(1000),
        ),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    if (!channel) {
      throw new UserFacingError('No puedo ver este canal. Indica uno con la opción `channel`.');
    }

    const botPerms = channel.permissionsFor(interaction.guild.members.me);
    if (!botPerms?.has(REQUIRED_CHANNEL_PERMS)) {
      throw new UserFacingError(
        `Necesito los permisos **Ver canal**, **Enviar mensajes** e **Insertar enlaces** en ${channel} ` +
          'para publicar el menú ahí.',
      );
    }

    rememberSetup(interaction.guildId, interaction.user.id, {
      channelId: channel.id,
      title: interaction.options.getString('title'),
      description: interaction.options.getString('description'),
    });

    const picker = new RoleSelectMenuBuilder()
      .setCustomId(buildCustomId(PREFIX, ACTION_SETUP))
      .setPlaceholder(`Elige los roles (hasta ${MAX_ROLES})`)
      .setMinValues(1)
      .setMaxValues(MAX_ROLES);

    await interaction.reply({
      content:
        `Elige los roles que quieres incluir en el menú de ${channel}.\n` +
        'Solo se incluirán los que yo pueda gestionar y que estén por debajo de tu rol más alto.',
      components: [new ActionRowBuilder().addComponents(picker)],
      flags: MessageFlags.Ephemeral,
    });
  },
};

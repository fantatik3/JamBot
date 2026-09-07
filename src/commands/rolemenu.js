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
const { t } = require('../i18n');

const REQUIRED_CHANNEL_PERMS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription(t('roles.menu.command.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription(t('roles.menu.command.create.description'))
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription(t('roles.menu.command.create.channel'))
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addStringOption((opt) =>
          opt.setName('title').setDescription(t('roles.menu.command.create.title')).setMaxLength(256),
        )
        .addStringOption((opt) =>
          opt.setName('description').setDescription(t('roles.menu.command.create.text')).setMaxLength(1000),
        ),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    if (!channel) {
      throw new UserFacingError(t('roles.menu.cannotSeeChannel'));
    }

    const botPerms = channel.permissionsFor(interaction.guild.members.me);
    if (!botPerms?.has(REQUIRED_CHANNEL_PERMS)) {
      throw new UserFacingError(t('roles.menu.missingPermissions', { channel }));
    }

    rememberSetup(interaction.guildId, interaction.user.id, {
      channelId: channel.id,
      title: interaction.options.getString('title'),
      description: interaction.options.getString('description'),
    });

    const picker = new RoleSelectMenuBuilder()
      .setCustomId(buildCustomId(PREFIX, ACTION_SETUP))
      .setPlaceholder(t('roles.menu.pickerPlaceholder', { max: MAX_ROLES }))
      .setMinValues(1)
      .setMaxValues(MAX_ROLES);

    await interaction.reply({
      content: t('roles.menu.pickerIntro', { channel }),
      components: [new ActionRowBuilder().addComponents(picker)],
      flags: MessageFlags.Ephemeral,
    });
  },
};

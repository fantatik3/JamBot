/**
 * Gestiona las dos mitades del menú de roles:
 *   rolemenu:setup           -> el administrador eligió roles en el selector; publica el menú
 *   rolemenu:toggle:<roleId> -> un miembro pulsó un botón; añade o quita el rol
 */
const { MessageFlags } = require('discord.js');
const {
  PREFIX,
  ACTION_TOGGLE,
  ACTION_SETUP,
  takeSetup,
  validateMenuRoles,
  buildRoleMenu,
} = require('../services/roleMenuService');
const roleService = require('../services/roleService');
const { UserFacingError } = require('../utils/errors');
const { t } = require('../i18n');

const NO_PINGS = { allowedMentions: { parse: [] } };

module.exports = {
  prefix: PREFIX,

  /**
   * @param {import('discord.js').MessageComponentInteraction} interaction
   * @param {string[]} args
   */
  async execute(interaction, [action, roleId]) {
    if (!interaction.inCachedGuild()) {
      throw new UserFacingError(t('roles.menu.guildOnly'));
    }

    if (action === ACTION_SETUP && interaction.isRoleSelectMenu()) {
      await handleSetup(interaction);
    } else if (action === ACTION_TOGGLE && interaction.isButton()) {
      await handleToggle(interaction, roleId);
    }
  },
};

/** @param {import('discord.js').RoleSelectMenuInteraction<'cached'>} interaction */
async function handleSetup(interaction) {
  const setup = takeSetup(interaction.guildId, interaction.user.id);
  if (!setup) {
    throw new UserFacingError(t('roles.menu.setupExpired'));
  }

  const channel = interaction.guild.channels.cache.get(setup.channelId);
  if (!channel?.isTextBased()) {
    throw new UserFacingError(t('roles.menu.channelGone'));
  }

  const { valid, problems } = validateMenuRoles(interaction.member, [...interaction.roles.values()]);
  if (valid.length === 0) {
    const details = problems.map((p) => `• ${p}`).join('\n');
    throw new UserFacingError(t('roles.menu.nothingValid', { details }));
  }

  const message = await channel.send({
    ...buildRoleMenu({ title: setup.title, description: setup.description, roles: valid }),
    ...NO_PINGS,
  });

  const lines = [t('roles.menu.published', { channel, url: message.url })];
  if (problems.length > 0) {
    lines.push('', t('roles.menu.someSkipped'), ...problems.map((p) => `• ${p}`));
  }

  // Sustituye el selector efímero por la confirmación.
  await interaction.update({ content: lines.join('\n'), components: [], ...NO_PINGS });
}

/** @param {import('discord.js').ButtonInteraction<'cached'>} interaction */
async function handleToggle(interaction, roleId) {
  const isOwnMessage = interaction.message.author?.id === interaction.client.user.id;
  if (!isOwnMessage || !roleId) {
    throw new UserFacingError(t('roles.menu.invalidButton'));
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    throw new UserFacingError(t('roles.menu.roleGone'));
  }

  const { added } = await roleService.toggleRole(interaction.member, role);

  await interaction.reply({
    content: added ? t('roles.menu.nowHave', { role }) : t('roles.menu.noLongerHave', { role }),
    flags: MessageFlags.Ephemeral,
    ...NO_PINGS,
  });
}

/**
 * /role add|remove <user> <role>
 * Comando de moderación para asignar roles a mano. Requiere Gestionar roles.
 */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const roleService = require('../services/roleService');
const { UserFacingError } = require('../utils/errors');
const { t } = require('../i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription(t('roles.command.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription(t('roles.command.add.description'))
        .addUserOption((opt) => opt.setName('user').setDescription(t('roles.command.add.user')).setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription(t('roles.command.add.role')).setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription(t('roles.command.remove.description'))
        .addUserOption((opt) => opt.setName('user').setDescription(t('roles.command.remove.user')).setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription(t('roles.command.remove.role')).setRequired(true)),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getSubcommand();

    if (!target) {
      throw new UserFacingError(t('common.notAMember'));
    }

    roleService.assertActorOutranks(interaction.member, role);

    const reason = t('roles.reasons.command', { action, user: interaction.user.tag });
    const changed =
      action === 'add'
        ? await roleService.addRole(target, role, reason)
        : await roleService.removeRole(target, role, reason);

    let key;
    if (action === 'add') key = changed ? 'added' : 'alreadyHas';
    else key = changed ? 'removed' : 'doesNotHave';
    const content = t(`roles.command.${key}`, { role, member: target });

    await interaction.reply({ content, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } });
  },
};

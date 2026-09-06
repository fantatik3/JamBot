/**
 * /role add|remove <user> <role>
 * Comando de moderación para asignar roles a mano. Requiere Gestionar roles.
 */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const roleService = require('../services/roleService');
const { UserFacingError } = require('../utils/errors');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Asigna o quita un rol a un miembro.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Da un rol a un miembro.')
        .addUserOption((opt) => opt.setName('user').setDescription('Quién recibe el rol').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Rol a asignar').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Quita un rol a un miembro.')
        .addUserOption((opt) => opt.setName('user').setDescription('Quién pierde el rol').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Rol a quitar').setRequired(true)),
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getSubcommand();

    if (!target) {
      throw new UserFacingError('Ese usuario no es miembro de este servidor.');
    }

    roleService.assertActorOutranks(interaction.member, role);

    const reason = `/role ${action} por ${interaction.user.tag}`;
    const changed =
      action === 'add'
        ? await roleService.addRole(target, role, reason)
        : await roleService.removeRole(target, role, reason);

    let content;
    if (action === 'add') {
      content = changed ? `Se asignó ${role} a ${target}.` : `${target} ya tiene ${role}.`;
    } else {
      content = changed ? `Se quitó ${role} a ${target}.` : `${target} no tiene ${role}.`;
    }

    await interaction.reply({ content, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } });
  },
};

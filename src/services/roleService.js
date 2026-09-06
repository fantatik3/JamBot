/**
 * All role mutations go through here so permission/hierarchy checks live in one place.
 */
const { UserFacingError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Throws a UserFacingError if the bot cannot assign/remove `role`.
 * @param {import('discord.js').Role} role
 */
function assertManageable(role) {
  if (role.managed) {
    throw new UserFacingError(
      `**${role.name}** lo gestiona una integración (bot o mejora de servidor) y no se puede asignar a mano.`,
    );
  }
  if (role.id === role.guild.id) {
    throw new UserFacingError('El rol @everyone no se puede asignar.');
  }
  if (!role.editable) {
    throw new UserFacingError(
      `No puedo gestionar **${role.name}**. Asegúrate de que tengo el permiso **Gestionar roles** y de que ` +
        'mi rol está por encima de él en Ajustes del servidor > Roles.',
    );
  }
}

/**
 * Throws if `actor` (a moderator) is not allowed to hand out `role`.
 * Prevents mods from granting roles equal to or above their own.
 * @param {import('discord.js').GuildMember} actor
 * @param {import('discord.js').Role} role
 */
function assertActorOutranks(actor, role) {
  const isOwner = actor.guild.ownerId === actor.id;
  if (!isOwner && actor.roles.highest.comparePositionTo(role) <= 0) {
    throw new UserFacingError(
      `Solo puedes gestionar roles por debajo de tu rol más alto (**${actor.roles.highest.name}**).`,
    );
  }
}

/**
 * @returns {Promise<boolean>} true if the role was added, false if the member already had it.
 */
async function addRole(member, role, reason = 'Rol asignado por el bot') {
  assertManageable(role);
  if (member.roles.cache.has(role.id)) return false;
  await member.roles.add(role, reason);
  logger.info(`Added role "${role.name}" to ${member.user.tag} (${member.id}) in ${member.guild.name}`);
  return true;
}

/**
 * @returns {Promise<boolean>} true if the role was removed, false if the member did not have it.
 */
async function removeRole(member, role, reason = 'Rol quitado por el bot') {
  assertManageable(role);
  if (!member.roles.cache.has(role.id)) return false;
  await member.roles.remove(role, reason);
  logger.info(`Removed role "${role.name}" from ${member.user.tag} (${member.id}) in ${member.guild.name}`);
  return true;
}

/**
 * Adds the role if the member lacks it, removes it otherwise.
 * @returns {Promise<{ added: boolean }>}
 */
async function toggleRole(member, role, reason = 'Rol cambiado desde el menú de roles') {
  if (member.roles.cache.has(role.id)) {
    await removeRole(member, role, reason);
    return { added: false };
  }
  await addRole(member, role, reason);
  return { added: true };
}

module.exports = { assertManageable, assertActorOutranks, addRole, removeRole, toggleRole };

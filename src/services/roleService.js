/**
 * Todos los cambios de roles pasan por aquí para que las comprobaciones de permisos y jerarquía estén en un solo sitio.
 */
const { UserFacingError } = require('../utils/errors');
const logger = require('../utils/logger');
const { t } = require('../i18n');

/**
 * Lanza un UserFacingError si el bot no puede asignar o quitar `role`.
 * @param {import('discord.js').Role} role
 */
function assertManageable(role) {
  if (role.managed) {
    throw new UserFacingError(t('roles.errors.managed', { role: role.name }));
  }
  if (role.id === role.guild.id) {
    throw new UserFacingError(t('roles.errors.everyone'));
  }
  if (!role.editable) {
    throw new UserFacingError(t('roles.errors.notEditable', { role: role.name }));
  }
}

/**
 * Lanza un error si `actor` (un moderador) no puede repartir `role`.
 * Evita que los moderadores concedan roles iguales o superiores al suyo.
 * @param {import('discord.js').GuildMember} actor
 * @param {import('discord.js').Role} role
 */
function assertActorOutranks(actor, role) {
  const isOwner = actor.guild.ownerId === actor.id;
  if (!isOwner && actor.roles.highest.comparePositionTo(role) <= 0) {
    throw new UserFacingError(t('roles.errors.outranked', { role: actor.roles.highest.name }));
  }
}

/**
 * @returns {Promise<boolean>} true si se añadió el rol, false si el miembro ya lo tenía.
 */
async function addRole(member, role, reason = t('roles.reasons.assigned')) {
  assertManageable(role);
  if (member.roles.cache.has(role.id)) return false;
  await member.roles.add(role, reason);
  logger.info(`Added role "${role.name}" to ${member.user.tag} (${member.id}) in ${member.guild.name}`);
  return true;
}

/**
 * @returns {Promise<boolean>} true si se quitó el rol, false si el miembro no lo tenía.
 */
async function removeRole(member, role, reason = t('roles.reasons.removed')) {
  assertManageable(role);
  if (!member.roles.cache.has(role.id)) return false;
  await member.roles.remove(role, reason);
  logger.info(`Removed role "${role.name}" from ${member.user.tag} (${member.id}) in ${member.guild.name}`);
  return true;
}

/**
 * Añade el rol si el miembro no lo tiene y lo quita en caso contrario.
 * @returns {Promise<{ added: boolean }>}
 */
async function toggleRole(member, role, reason = t('roles.reasons.toggled')) {
  if (member.roles.cache.has(role.id)) {
    await removeRole(member, role, reason);
    return { added: false };
  }
  await addRole(member, role, reason);
  return { added: true };
}

module.exports = { assertManageable, assertActorOutranks, addRole, removeRole, toggleRole };

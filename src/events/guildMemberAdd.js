/**
 * Da la bienvenida a los miembros nuevos y (opcionalmente) les asigna el rol automático.
 * Requiere tener activado el Server Members Intent en el Portal de desarrolladores.
 */
const { Events, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { buildWelcomeMessage } = require('../services/welcomeService');
const roleService = require('../services/roleService');
const { t } = require('../i18n');

module.exports = {
  name: Events.GuildMemberAdd,

  /** @param {import('discord.js').GuildMember} member */
  async execute(member) {
    if (member.user.bot) return;

    await Promise.allSettled([sendWelcome(member), applyAutoRole(member)]);
  },
};

async function sendWelcome(member) {
  if (!config.welcomeChannelId) {
    logger.debug('WELCOME_CHANNEL_ID not set; skipping welcome message.');
    return;
  }

  const channel = member.guild.channels.cache.get(config.welcomeChannelId);
  if (!channel?.isTextBased()) {
    logger.warn(`Welcome channel ${config.welcomeChannelId} not found in ${member.guild.name}.`);
    return;
  }

  const perms = channel.permissionsFor(member.guild.members.me);
  if (!perms?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
    logger.warn(`Missing View Channel / Send Messages in #${channel.name}; cannot welcome ${member.user.tag}.`);
    return;
  }

  try {
    await channel.send(buildWelcomeMessage(member));
    logger.info(`Welcomed ${member.user.tag} in #${channel.name}.`);
  } catch (error) {
    logger.error(`Failed to welcome ${member.user.tag}:`, error);
  }
}

async function applyAutoRole(member) {
  if (!config.autoRoleId) return;

  const role = member.guild.roles.cache.get(config.autoRoleId);
  if (!role) {
    logger.warn(`AUTO_ROLE_ID ${config.autoRoleId} not found in ${member.guild.name}.`);
    return;
  }

  try {
    await roleService.addRole(member, role, t('roles.reasons.autoRole'));
  } catch (error) {
    logger.error(`Failed to apply auto-role to ${member.user.tag}:`, error.message ?? error);
  }
}

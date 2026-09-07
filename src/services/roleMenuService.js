/**
 * Menús de selección de roles: un embed con la lista de roles y un botón de alternar por rol.
 *
 * Flujo:
 *   1. `/rolemenu create` recuerda dónde debe ir el menú (rememberSetup) y muestra
 *      al administrador el selector de roles nativo de Discord.
 *   2. Cuando el administrador elige roles, el manejador los valida (validateMenuRoles),
 *      construye el mensaje (buildRoleMenu) y lo publica.
 *   3. Los miembros pulsan botones cuyo customId es `rolemenu:toggle:<roleId>`.
 */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { chunk } = require('../utils/random');
const { buildCustomId } = require('../handlers/componentHandler');
const { t } = require('../i18n');

const PREFIX = 'rolemenu';
const ACTION_TOGGLE = 'toggle';
const ACTION_SETUP = 'setup';

const BUTTONS_PER_ROW = 5;
const MAX_ROWS = 5;
const MAX_ROLES = BUTTONS_PER_ROW * MAX_ROWS;
const MAX_BUTTON_LABEL = 80;
const SETUP_TTL_MS = 10 * 60 * 1000;
const MENU_COLOR = 0x5865f2;

/** Sesiones pendientes de `/rolemenu create`, indexadas por `guildId:userId`. */
const pendingSetups = new Map();

function setupKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

/** Guarda dónde y cómo debe publicarse el próximo menú de este administrador. */
function rememberSetup(guildId, userId, { channelId, title, description }) {
  pendingSetups.set(setupKey(guildId, userId), {
    channelId,
    title,
    description,
    expiresAt: Date.now() + SETUP_TTL_MS,
  });
}

/** Recupera y borra la configuración pendiente, o devuelve null si no existe o caducó. */
function takeSetup(guildId, userId) {
  const key = setupKey(guildId, userId);
  const setup = pendingSetups.get(key);
  pendingSetups.delete(key);
  if (!setup || setup.expiresAt < Date.now()) return null;
  return setup;
}

/**
 * Filtra los roles elegidos por un administrador y deja solo los que se pueden autoasignar con seguridad.
 * @param {import('discord.js').GuildMember} actor  El administrador que crea el menú.
 * @param {import('discord.js').Role[]} roles
 * @returns {{ valid: import('discord.js').Role[], problems: string[] }}
 */
function validateMenuRoles(actor, roles) {
  const valid = [];
  const problems = [];
  const isOwner = actor.guild.ownerId === actor.id;

  for (const role of roles) {
    if (role.id === role.guild.id) {
      problems.push(t('roles.menu.problems.everyone'));
      continue;
    }
    if (role.managed) {
      problems.push(t('roles.menu.problems.managed', { role }));
      continue;
    }
    if (!role.editable) {
      problems.push(t('roles.menu.problems.aboveBot', { role }));
      continue;
    }
    if (!isOwner && actor.roles.highest.comparePositionTo(role) <= 0) {
      problems.push(t('roles.menu.problems.aboveActor', { role }));
      continue;
    }
    valid.push(role);
  }

  if (valid.length > MAX_ROLES) {
    problems.push(t('roles.menu.problems.tooMany', { max: MAX_ROLES }));
  }

  return { valid: valid.slice(0, MAX_ROLES), problems };
}

/**
 * @param {{ title?: string|null, description?: string|null, roles: import('discord.js').Role[] }} options
 * @returns {import('discord.js').MessageCreateOptions}
 */
function buildRoleMenu({ title, description, roles }) {
  const rows = chunk(roles, BUTTONS_PER_ROW).map((group) =>
    new ActionRowBuilder().addComponents(
      group.map((role) =>
        new ButtonBuilder()
          .setCustomId(buildCustomId(PREFIX, ACTION_TOGGLE, role.id))
          .setLabel(role.name.slice(0, MAX_BUTTON_LABEL))
          .setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  const lines = roles.map((role) => `• ${role}`);

  const embed = new EmbedBuilder()
    .setColor(MENU_COLOR)
    .setTitle(title || t('roles.menu.defaultTitle'))
    .setDescription(`${description || t('roles.menu.defaultDescription')}\n\n${lines.join('\n')}`);

  return { embeds: [embed], components: rows };
}

module.exports = {
  PREFIX,
  ACTION_TOGGLE,
  ACTION_SETUP,
  MAX_ROLES,
  rememberSetup,
  takeSetup,
  validateMenuRoles,
  buildRoleMenu,
};

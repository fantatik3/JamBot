/**
 * Role-selection menus: an embed listing roles plus one toggle button per role.
 *
 * Flow:
 *   1. `/rolemenu create` remembers where the menu should go (rememberSetup) and shows
 *      the admin a native Discord role picker.
 *   2. When the admin picks roles, the handler validates them (validateMenuRoles),
 *      builds the message (buildRoleMenu) and posts it.
 *   3. Members click buttons whose customId is `rolemenu:toggle:<roleId>`.
 */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { chunk } = require('../utils/random');
const { buildCustomId } = require('../handlers/componentHandler');

const PREFIX = 'rolemenu';
const ACTION_TOGGLE = 'toggle';
const ACTION_SETUP = 'setup';

const BUTTONS_PER_ROW = 5;
const MAX_ROWS = 5;
const MAX_ROLES = BUTTONS_PER_ROW * MAX_ROWS;
const MAX_BUTTON_LABEL = 80;
const SETUP_TTL_MS = 10 * 60 * 1000;

const DEFAULT_TITLE = 'Elige tus roles';
const DEFAULT_DESCRIPTION = 'Pulsa un botón para activar un rol. Vuelve a pulsarlo para quitártelo.';
const MENU_COLOR = 0x5865f2;

/** Pending `/rolemenu create` sessions, keyed by `guildId:userId`. */
const pendingSetups = new Map();

function setupKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

/** Stores where and how the next menu for this admin should be posted. */
function rememberSetup(guildId, userId, { channelId, title, description }) {
  pendingSetups.set(setupKey(guildId, userId), {
    channelId,
    title,
    description,
    expiresAt: Date.now() + SETUP_TTL_MS,
  });
}

/** Retrieves and clears the pending setup, or returns null if none / expired. */
function takeSetup(guildId, userId) {
  const key = setupKey(guildId, userId);
  const setup = pendingSetups.get(key);
  pendingSetups.delete(key);
  if (!setup || setup.expiresAt < Date.now()) return null;
  return setup;
}

/**
 * Filters the roles an admin picked down to the ones that can safely be self-assigned.
 * @param {import('discord.js').GuildMember} actor  The admin creating the menu.
 * @param {import('discord.js').Role[]} roles
 * @returns {{ valid: import('discord.js').Role[], problems: string[] }}
 */
function validateMenuRoles(actor, roles) {
  const valid = [];
  const problems = [];
  const isOwner = actor.guild.ownerId === actor.id;

  for (const role of roles) {
    if (role.id === role.guild.id) {
      problems.push('@everyone no se puede incluir.');
      continue;
    }
    if (role.managed) {
      problems.push(`${role} lo gestiona una integración y no se puede autoasignar.`);
      continue;
    }
    if (!role.editable) {
      problems.push(`${role} está por encima de mi rol más alto; mueve mi rol por encima de él.`);
      continue;
    }
    if (!isOwner && actor.roles.highest.comparePositionTo(role) <= 0) {
      problems.push(`${role} está por encima de tu rol más alto, así que no puedes ofrecerlo.`);
      continue;
    }
    valid.push(role);
  }

  if (valid.length > MAX_ROLES) {
    problems.push(`Solo se incluyen los primeros ${MAX_ROLES} roles (límite de botones de Discord).`);
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
    .setTitle(title || DEFAULT_TITLE)
    .setDescription(`${description || DEFAULT_DESCRIPTION}\n\n${lines.join('\n')}`);

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

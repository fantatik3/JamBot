/**
 * Configuración central.
 * Carga `.env`, valida los valores obligatorios y expone un único objeto de configuración inmutable.
 */
require('dotenv').config();

const REQUIRED = ['DISCORD_TOKEN', 'CLIENT_ID'];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}.\n` +
      'Copy .env.example to .env and fill in the values.',
  );
}

/** Lee una variable de entorno entera, con valor por defecto y límites opcionales. */
function intEnv(name, fallback, { min = -Infinity, max = Infinity } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max} (got "${raw}").`);
  }
  return value;
}

/** Lee una variable de entorno booleana: true / 1 / yes / on cuentan como verdadero. */
function boolEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

/** Convierte "10-23" en { start: 10, end: 23 } (horas, hora local, fin exclusivo). */
function hoursEnv(name, fallback) {
  const raw = process.env[name] || fallback;
  const match = /^(\d{1,2})\s*-\s*(\d{1,2})$/.exec(raw);
  const start = match ? Number(match[1]) : NaN;
  const end = match ? Number(match[2]) : NaN;
  if (!match || start < 0 || end > 24 || start >= end) {
    throw new Error(`${name} must look like "10-23" with start < end and hours between 0 and 24 (got "${raw}").`);
  }
  return { start, end };
}

module.exports = Object.freeze({
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || null,
  autoRoleId: process.env.AUTO_ROLE_ID || null,
  previewRoleId: process.env.PREVIEW_ROLE_ID || null,
  logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),

  // Mata la jerga
  jergaChannelId: process.env.JERGA_CHANNEL_ID || null,
  jergaRoundsPerDay: intEnv('JERGA_ROUNDS_PER_DAY', 6, { min: 0, max: 24 }),
  jergaActiveHours: hoursEnv('JERGA_ACTIVE_HOURS', '0-24'),
  jergaSubmitMinutes: intEnv('JERGA_SUBMIT_MINUTES', 120, { min: 1, max: 720 }),
  jergaVoteMinutes: intEnv('JERGA_VOTE_MINUTES', 60, { min: 1, max: 720 }),
  jergaRoundOnStart: boolEnv('JERGA_ROUND_ON_START', false),
});

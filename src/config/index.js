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

/** Primer valor no vacío entre varios nombres de variable (permite nombres antiguos). */
function firstEnv(names) {
  for (const name of [].concat(names)) {
    const raw = process.env[name];
    if (raw !== undefined && raw !== '') return { name, raw };
  }
  return null;
}

/** Lee una variable de entorno entera, con valor por defecto y límites opcionales. */
function intEnv(names, fallback, { min = -Infinity, max = Infinity } = {}) {
  const found = firstEnv(names);
  if (!found) return fallback;
  const value = Number.parseInt(found.raw, 10);
  if (Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${found.name} must be an integer between ${min} and ${max} (got "${found.raw}").`);
  }
  return value;
}

/** Convierte "10-23" en { start: 10, end: 23 } (horas, hora local, fin exclusivo). */
function hoursEnv(names, fallback) {
  const found = firstEnv(names);
  const raw = found ? found.raw : fallback;
  const match = /^(\d{1,2})\s*-\s*(\d{1,2})$/.exec(raw);
  const start = match ? Number(match[1]) : NaN;
  const end = match ? Number(match[2]) : NaN;
  if (!match || start < 0 || end > 24 || start >= end) {
    const label = found ? found.name : [].concat(names)[0];
    throw new Error(`${label} must look like "10-23" with start < end and hours between 0 and 24 (got "${raw}").`);
  }
  return { start, end };
}

const defaultGamesChannelId = firstEnv(['GAMES_CHANNEL_ID'])?.raw ?? null;


/**
 * Qué rondas publicar al arrancar el bot:
 *   'off'  -> ninguna (por defecto)
 *   'one'  -> una, del siguiente juego de la rotación (true, 1, yes, on)
 *   'all'  -> una de cada juego con canal, útil para probar (all, todos)
 */
function roundOnStartEnv() {
  const found = firstEnv(['GAMES_ROUND_ON_START', 'JERGA_ROUND_ON_START']);
  if (!found) return 'off';
  const value = found.raw.trim().toLowerCase();
  if (['all', 'todos', 'todas'].includes(value)) return 'all';
  if (['true', '1', 'yes', 'on', 'one', 'uno', 'una'].includes(value)) return 'one';
  return 'off';
}

/**
 * Canal de un juego: <ID>_CHANNEL_ID (por ejemplo JERGA_CHANNEL_ID) o, si no existe,
 * GAMES_CHANNEL_ID. Sin ninguno de los dos, el juego no tiene rondas automáticas y sus
 * comandos funcionan en cualquier canal.
 */
function gameChannelId(gameId) {
  return firstEnv([`${gameId.toUpperCase()}_CHANNEL_ID`])?.raw ?? defaultGamesChannelId;
}

module.exports = Object.freeze({
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || null,
  autoRoleId: process.env.AUTO_ROLE_ID || null,
  testerRoleId: firstEnv(['TEST_ROLE_ID', 'PREVIEW_ROLE_ID'])?.raw ?? null,
  logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),

  // Juegos educativos (los nombres JERGA_* de rondas y horas siguen funcionando por compatibilidad)
  games: Object.freeze({
    channelId: defaultGamesChannelId,
    roundsPerDay: intEnv(['GAMES_ROUNDS_PER_DAY', 'JERGA_ROUNDS_PER_DAY'], 6, { min: 0, max: 24 }),
    activeHours: hoursEnv(['GAMES_ACTIVE_HOURS', 'JERGA_ACTIVE_HOURS'], '0-24'),
    submitMinutes: intEnv(['GAMES_SUBMIT_MINUTES', 'JERGA_SUBMIT_MINUTES'], 120, { min: 1, max: 720 }),
    voteMinutes: intEnv(['GAMES_VOTE_MINUTES', 'JERGA_VOTE_MINUTES'], 60, { min: 1, max: 720 }),
    roundOnStart: roundOnStartEnv(),
    // Minutos por fase de las rondas de arranque; vacío = las duraciones normales
    roundOnStartMinutes: intEnv(['GAMES_ROUND_ON_START_MINUTES'], null, { min: 1, max: 720 }),
  }),
  gameChannelId,
});

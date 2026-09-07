/**
 * Inicia rondas automáticas a horas aleatorias cada día, rotando entre los juegos que tienen canal.
 *
 * Cada día se sortean GAMES_ROUNDS_PER_DAY horas de inicio dentro de GAMES_ACTIVE_HOURS (hora
 * local de la máquina que ejecuta el bot). El plan se guarda en el almacén, así que un reinicio
 * conserva las horas. Cada ronda se publica en el canal de su juego (<ID>_CHANNEL_ID) con el bot
 * como anfitrión; quien tenga Gestionar mensajes puede adelantarla o cancelarla a mano.
 */
const config = require('../config');
const store = require('../utils/store');
const logger = require('../utils/logger');
const engine = require('../games/engine/roundEngine');
const { games } = require('../games');

const MINUTE = 60 * 1000;
/** Un inicio perdido (el bot estaba apagado) se ejecuta igualmente si llega con este retraso como máximo. */
const GRACE_MS = 15 * MINUTE;

let client = null;
let timer = null;

/** Juegos que participan en la rotación: los que tienen un canal configurado. */
function scheduledGames() {
  return games.filter((game) => config.gameChannelId(game.id));
}

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function atHour(date, hour) {
  const copy = new Date(date);
  copy.setHours(hour, 0, 0, 0);
  return copy.getTime();
}

function roundLengthMs() {
  return (config.games.submitMinutes + config.games.voteMinutes) * MINUTE;
}

/**
 * Sortea horas de inicio para `date`, una por cada franja igual de la ventana activa,
 * nunca antes de `now` y dejando margen para que la ronda termine dentro de la ventana.
 */
function planDay(date, now = Date.now()) {
  const { start, end } = config.games.activeHours;
  const roundMs = roundLengthMs();
  const earliest = Math.max(now, atHour(date, start));
  const latest = atHour(date, end) - roundMs;
  if (config.games.roundsPerDay <= 0 || latest < earliest) return [];

  // Solo tantas rondas como quepan seguidas entre el primer y el último inicio posible.
  const available = latest - earliest;
  const fits = Math.floor(available / roundMs) + 1;
  const count = Math.min(config.games.roundsPerDay, fits);

  // Un inicio aleatorio por franja; cada franja dura al menos una ronda, así que nunca se solapan,
  // y la última franja llega hasta `latest` para aprovechar toda la ventana.
  const slot = (available + roundMs) / count;
  const spread = slot - roundMs;
  const times = [];
  for (let i = 0; i < count; i += 1) {
    times.push(Math.round(earliest + i * slot + Math.random() * spread));
  }
  return times;
}

/** Identifica la configuración con la que se sorteó un plan, para volver a sortear el de hoy si cambia .env. */
function settingsSignature() {
  const { roundsPerDay, activeHours, submitMinutes, voteMinutes } = config.games;
  return [roundsPerDay, activeHours.start, activeHours.end, submitMinutes, voteMinutes].join('|');
}

/** Plan del día: horas sorteadas, cuáles ya se ejecutaron y qué juego toca a continuación. */
function getPlan() {
  const plan = store.section('gameSchedule');
  // Recupera el plan guardado por la versión anterior, si existe.
  const legacy = store.load().jergaSchedule;
  if (legacy && !plan.day) {
    Object.assign(plan, { day: legacy.day, times: legacy.times ?? [], done: legacy.done ?? [] });
    delete store.load().jergaSchedule;
  }
  plan.nextGame ??= 0;
  return plan;
}

/** Devuelve el plan de hoy, generándolo si cambió el día o la configuración. */
function ensurePlan(now = Date.now()) {
  const plan = getPlan();
  const today = dayKey(new Date(now));
  const signature = settingsSignature();
  if (plan.day !== today || plan.signature !== signature) {
    plan.day = today;
    plan.signature = signature;
    plan.times = planDay(new Date(now), now);
    plan.done = [];
    store.save();
    const list = plan.times.map((t) => new Date(t).toLocaleTimeString()).join(', ');
    logger.info(`Game schedule for ${today}: ${list || 'no rounds'}`);
  }
  return plan;
}

function gameAt(offset) {
  const pool = scheduledGames();
  if (pool.length === 0) return null;
  const plan = getPlan();
  return pool[(plan.nextGame + offset) % pool.length];
}

/** Rondas de hoy que todavía no se han ejecutado, con el juego que les tocará. */
function upcoming(now = Date.now()) {
  const plan = ensurePlan(now);
  return plan.times
    .filter((t) => !plan.done.includes(t) && t >= now)
    .sort((a, b) => a - b)
    .map((time, index) => ({ time, game: gameAt(index) }))
    .filter((entry) => entry.game);
}

function armNext() {
  if (timer) clearTimeout(timer);
  timer = null;

  const now = Date.now();
  const plan = ensurePlan(now);
  const pending = plan.times.filter((t) => !plan.done.includes(t) && t >= now - GRACE_MS);

  if (pending.length > 0) {
    const next = Math.min(...pending);
    timer = setTimeout(() => fire(next), Math.max(0, next - now));
    return next;
  }

  // No queda nada hoy: despierta al inicio de la ventana de mañana y vuelve a planificar.
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const wake = atHour(tomorrow, config.games.activeHours.start);
  timer = setTimeout(armNext, Math.max(1000, wake - now));
  return null;
}

/** Toma el siguiente juego de la rotación y avanza el puntero. */
function takeNextGame() {
  const pool = scheduledGames();
  if (pool.length === 0) return null;
  const plan = getPlan();
  const game = pool[plan.nextGame % pool.length];
  plan.nextGame = (plan.nextGame + 1) % pool.length;
  store.save();
  return game;
}

/**
 * Publica una ronda con el bot como anfitrión en el canal del juego, salvo que ya haya una en marcha.
 * `minutes` fuerza la duración de las dos fases (rondas de arranque para probar).
 */
async function startAutomaticRound(game, reason, minutes = null) {
  if (!game) return false;
  const channelId = config.gameChannelId(game.id);
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased() || !channel.guild) {
      throw new Error(`${game.id.toUpperCase()}_CHANNEL_ID ${channelId} is not a text channel in a server`);
    }
    const busy = engine.getActiveRound(game, channel.guild.id) ?? engine.getActiveRoundInChannel(channel.guild.id, channel.id);
    if (busy) {
      logger.info(`Skipped ${reason} ${game.name} round: a round is still active in that game or channel.`);
      return false;
    }
    await engine.startRound({
      game,
      guild: channel.guild,
      channel,
      hostId: client.user.id,
      submitMinutes: minutes ?? game.submitMinutes ?? config.games.submitMinutes,
      voteMinutes: minutes ?? game.voteMinutes ?? config.games.voteMinutes,
    });
    return true;
  } catch (error) {
    logger.error(`${reason} ${game.name} round failed:`, error);
    return false;
  }
}

async function fire(time) {
  const plan = getPlan();
  plan.done.push(time);
  store.save();

  await startAutomaticRound(takeNextGame(), 'scheduled');

  const next = armNext();
  if (next) logger.info(`Next automatic round at ${new Date(next).toLocaleString()}`);
}

/** Llamar una vez que el cliente esté listo. */
function start(discordClient) {
  client = discordClient;
  const { roundsPerDay, activeHours, roundOnStart } = config.games;
  const pool = scheduledGames();

  if (pool.length === 0) {
    logger.info('Game scheduler disabled: no game has a channel (set <ID>_CHANNEL_ID or GAMES_CHANNEL_ID).');
    return;
  }
  if (roundsPerDay <= 0) {
    logger.info('Game scheduler disabled: GAMES_ROUNDS_PER_DAY is 0.');
    return;
  }

  const windowMs = (activeHours.end - activeHours.start) * 60 * MINUTE;
  if (roundsPerDay * roundLengthMs() > windowMs) {
    logger.warn(
      `${roundsPerDay} round(s) of ${roundLengthMs() / MINUTE} min do not fit in ` +
        `${activeHours.start}:00-${activeHours.end}:00; some will be skipped.`,
    );
  }

  const next = armNext();
  logger.info(
    next
      ? `Game scheduler on (${pool.map((g) => g.name).join(', ')}): next round at ${new Date(next).toLocaleString()}`
      : 'Game scheduler on: no more rounds today, planning again tomorrow.',
  );

  const minutes = config.games.roundOnStartMinutes;
  if (roundOnStart === 'all') {
    logger.info(`GAMES_ROUND_ON_START=all: posting a round of every game now (${pool.length}).`);
    (async () => {
      for (const game of pool) await startAutomaticRound(game, 'startup', minutes);
    })().catch((error) => logger.error('Startup rounds failed:', error));
  } else if (roundOnStart === 'one') {
    logger.info('GAMES_ROUND_ON_START is on: posting a round now.');
    startAutomaticRound(takeNextGame(), 'startup', minutes).catch((error) => logger.error('Startup round failed:', error));
  }
}

function stop() {
  if (timer) clearTimeout(timer);
  timer = null;
}

module.exports = { start, stop, upcoming, planDay, scheduledGames };

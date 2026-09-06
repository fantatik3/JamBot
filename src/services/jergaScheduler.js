/**
 * Inicia rondas de "Mata la jerga" automáticamente a horas aleatorias cada día.
 *
 * Cada día el planificador sortea JERGA_ROUNDS_PER_DAY horas de inicio dentro de
 * JERGA_ACTIVE_HOURS (hora local de la máquina que ejecuta el bot), repartidas para que
 * las rondas no se solapen. El plan se guarda en el almacén, así que un reinicio conserva las horas.
 * Las rondas se publican en JERGA_CHANNEL_ID con el bot como anfitrión; quien tenga
 * Gestionar mensajes puede adelantarlas o cancelarlas a mano.
 */
const config = require('../config');
const store = require('../utils/store');
const logger = require('../utils/logger');
const jerga = require('./jergaService');

const MINUTE = 60 * 1000;
/** Un inicio perdido (el bot estaba apagado) se ejecuta igualmente si llega con este retraso como máximo. */
const GRACE_MS = 15 * MINUTE;

let client = null;
let timer = null;

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
  return (config.jergaSubmitMinutes + config.jergaVoteMinutes) * MINUTE;
}

/**
 * Sortea horas de inicio para `date`, una por cada franja igual de la ventana activa,
 * nunca antes de `now` y dejando margen para que la ronda termine dentro de la ventana.
 */
function planDay(date, now = Date.now()) {
  const { start, end } = config.jergaActiveHours;
  const roundMs = roundLengthMs();
  const earliest = Math.max(now, atHour(date, start));
  const latest = atHour(date, end) - roundMs;
  if (config.jergaRoundsPerDay <= 0 || latest < earliest) return [];

  // Solo tantas rondas como quepan seguidas entre el primer y el último inicio posible.
  const available = latest - earliest;
  const fits = Math.floor(available / roundMs) + 1;
  const count = Math.min(config.jergaRoundsPerDay, fits);

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
  const { start, end } = config.jergaActiveHours;
  return [config.jergaRoundsPerDay, start, end, config.jergaSubmitMinutes, config.jergaVoteMinutes].join('|');
}

/** Devuelve el plan de hoy, generándolo si cambió el día o la configuración. */
function ensurePlan(now = Date.now()) {
  const plan = store.section('jergaSchedule');
  const today = dayKey(new Date(now));
  const signature = settingsSignature();
  if (plan.day !== today || plan.signature !== signature) {
    plan.day = today;
    plan.signature = signature;
    plan.times = planDay(new Date(now), now);
    plan.done = [];
    store.save();
    const list = plan.times.map((t) => new Date(t).toLocaleTimeString()).join(', ');
    logger.info(`Jerga schedule for ${today}: ${list || 'no rounds'}`);
  }
  return plan;
}

/** Horas de inicio de hoy que todavía no se han ejecutado. */
function upcoming(now = Date.now()) {
  const plan = ensurePlan(now);
  return plan.times.filter((t) => !plan.done.includes(t) && t >= now).sort((a, b) => a - b);
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
  const wake = atHour(tomorrow, config.jergaActiveHours.start);
  timer = setTimeout(armNext, Math.max(1000, wake - now));
  return null;
}

/** Publica una ronda con el bot como anfitrión en el canal del juego, salvo que ya haya una en marcha. */
async function startAutomaticRound(reason) {
  try {
    const channel = await client.channels.fetch(config.jergaChannelId);
    if (!channel?.isTextBased() || !channel.guild) {
      throw new Error(`JERGA_CHANNEL_ID ${config.jergaChannelId} is not a text channel in a server`);
    }
    if (jerga.getActiveRound(channel.guild.id)) {
      logger.info(`Skipped ${reason} jerga round: another round is still active.`);
      return false;
    }
    await jerga.startRound({
      guild: channel.guild,
      channel,
      hostId: client.user.id,
      submitMinutes: config.jergaSubmitMinutes,
      voteMinutes: config.jergaVoteMinutes,
    });
    return true;
  } catch (error) {
    logger.error(`${reason} jerga round failed:`, error);
    return false;
  }
}

async function fire(time) {
  const plan = store.section('jergaSchedule');
  plan.done.push(time);
  store.save();

  await startAutomaticRound('scheduled');

  const next = armNext();
  if (next) logger.info(`Next automatic jerga round at ${new Date(next).toLocaleString()}`);
}

/** Llamar una vez que el cliente esté listo. */
function start(discordClient) {
  client = discordClient;

  if (!config.jergaChannelId) {
    logger.info('Jerga scheduler disabled: JERGA_CHANNEL_ID is not set.');
    return;
  }
  if (config.jergaRoundsPerDay <= 0) {
    logger.info('Jerga scheduler disabled: JERGA_ROUNDS_PER_DAY is 0.');
    return;
  }

  const { start: from, end: to } = config.jergaActiveHours;
  const windowMs = (to - from) * 60 * MINUTE;
  if (config.jergaRoundsPerDay * roundLengthMs() > windowMs) {
    logger.warn(
      `${config.jergaRoundsPerDay} round(s) of ${roundLengthMs() / MINUTE} min do not fit in ${from}:00-${to}:00; ` +
        'some rounds will be skipped or overlap the window end.',
    );
  }

  const next = armNext();
  logger.info(
    next
      ? `Jerga scheduler on: next automatic round at ${new Date(next).toLocaleString()}`
      : 'Jerga scheduler on: no more rounds today, planning again tomorrow.',
  );

  if (config.jergaRoundOnStart) {
    logger.info('JERGA_ROUND_ON_START is on: posting a round now.');
    startAutomaticRound('startup').catch((error) => logger.error('Startup jerga round failed:', error));
  }
}

function stop() {
  if (timer) clearTimeout(timer);
  timer = null;
}

module.exports = { start, stop, upcoming, planDay };

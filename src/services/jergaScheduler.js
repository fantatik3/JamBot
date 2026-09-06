/**
 * Starts "Mata la jerga" rounds automatically at random times each day.
 *
 * Every day the scheduler picks JERGA_ROUNDS_PER_DAY random start times inside
 * JERGA_ACTIVE_HOURS (local time of the machine running the bot), spread out so rounds
 * do not overlap. The plan is saved in the store, so a restart keeps the same times.
 * Rounds are posted in JERGA_CHANNEL_ID with the bot as host; anyone with Manage
 * Messages can still advance or cancel them by hand.
 */
const config = require('../config');
const store = require('../utils/store');
const logger = require('../utils/logger');
const jerga = require('./jergaService');

const MINUTE = 60 * 1000;
/** A missed start (bot was down) still fires if it is at most this late. */
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
 * Picks random start times for `date`, one per equal slot of the active window,
 * never earlier than `now` and leaving room for the round to finish inside the window.
 */
function planDay(date, now = Date.now()) {
  const { start, end } = config.jergaActiveHours;
  const roundMs = roundLengthMs();
  const earliest = Math.max(now, atHour(date, start));
  const latest = atHour(date, end) - roundMs;
  if (config.jergaRoundsPerDay <= 0 || latest < earliest) return [];

  // Only as many rounds as fit back-to-back between the first and last possible start.
  const available = latest - earliest;
  const fits = Math.floor(available / roundMs) + 1;
  const count = Math.min(config.jergaRoundsPerDay, fits);

  // One random start per slot; slots are at least a round long, so rounds never overlap,
  // and the last slot reaches `latest` so the whole window is used.
  const slot = (available + roundMs) / count;
  const spread = slot - roundMs;
  const times = [];
  for (let i = 0; i < count; i += 1) {
    times.push(Math.round(earliest + i * slot + Math.random() * spread));
  }
  return times;
}

/** Identifies the settings a plan was drawn with, so changing .env re-draws today's plan. */
function settingsSignature() {
  const { start, end } = config.jergaActiveHours;
  return [config.jergaRoundsPerDay, start, end, config.jergaSubmitMinutes, config.jergaVoteMinutes].join('|');
}

/** Returns today's plan, generating it if the day or the settings changed. */
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

/** Upcoming start times for today that have not fired yet. */
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

  // Nothing left today: wake up at the start of tomorrow's window and plan again.
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const wake = atHour(tomorrow, config.jergaActiveHours.start);
  timer = setTimeout(armNext, Math.max(1000, wake - now));
  return null;
}

/** Posts a bot-hosted round in the game channel, unless one is already running. */
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

/** Call once the client is ready. */
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

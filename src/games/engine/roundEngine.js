/**
 * Motor genérico de rondas para los juegos educativos.
 *
 * Un juego (ver games/index.js) define qué se plantea en cada ronda y cómo se valida o se
 * corrige una respuesta. El motor se encarga del resto. Hay tres modos:
 *   vote   -> la gente responde con un formulario y luego vota de forma anónima (por defecto)
 *   judge  -> la gente responde con un formulario y el juego elige quién gana (game.pickWinners)
 *   choice -> la gente pulsa una opción (A, B, C, D) y gana quien acierta (prompt.correct)
 *
 * Fases: submitting -> voting (solo en modo vote) -> finished. Avanzan por temporizador o
 * cuando quien organiza pulsa el botón. El estado vive en el almacén JSON (una sección por
 * juego y servidor); resume() vuelve a armar los temporizadores tras un reinicio.
 */
const { PermissionFlagsBits } = require('discord.js');
const store = require('../../utils/store');
const logger = require('../../utils/logger');
const { UserFacingError } = require('../../utils/errors');
const { shuffle, pickRandom } = require('../../utils/random');
const messages = require('./messages');

const ACTIONS = Object.freeze({
  SUBMIT: 'submit', // botón: abre el modal de respuesta
  MODAL: 'modal', // envío de modal: texto de la respuesta
  PICK: 'pick', // botón (modo choice): elige la opción <index>
  OPEN_VOTE: 'openvote', // botón (organiza): cierra envíos y abre votación o corrige
  VOTE: 'vote', // botón: vota la respuesta <index>
  FINISH: 'finish', // botón (organiza): cierra votación, anuncia resultados
});
const MODAL_FIELD = 'answer';
const PHASE = Object.freeze({ SUBMITTING: 'submitting', VOTING: 'voting', FINISHED: 'finished' });
const MODES = Object.freeze({ VOTE: 'vote', JUDGE: 'judge', CHOICE: 'choice' });

const DEFAULTS = Object.freeze({
  maxSubmissions: 15,
  recentMemory: 10,
  points: Object.freeze({ win: 3, participate: 1 }),
  answer: Object.freeze({ min: 10, max: 280 }),
});
const MAX_GLOSSARY_ENTRIES = 500;

let client = null;
let gamesById = new Map();
/** Temporizadores setTimeout activos, indexados por id de ronda. */
const timers = new Map();

/** Modo de juego: el declarado, o judge si define pickWinners, o vote. */
function modeOf(game) {
  return game.mode ?? (game.pickWinners ? MODES.JUDGE : MODES.VOTE);
}

/** Ajustes efectivos de un juego: los suyos por encima de los predeterminados. */
function settingsOf(game) {
  return {
    mode: modeOf(game),
    maxSubmissions: game.maxSubmissions ?? DEFAULTS.maxSubmissions,
    recentMemory: game.recentMemory ?? DEFAULTS.recentMemory,
    points: { ...DEFAULTS.points, ...(game.points ?? {}) },
    answer: { ...DEFAULTS.answer, ...(game.answer ?? {}) },
  };
}

function gameOf(round) {
  const game = gamesById.get(round.gameId);
  if (!game) throw new Error(`Unknown game "${round.gameId}" for round ${round.id}`);
  return game;
}

// ---- Almacén ----

function emptyGameData() {
  return { roundCounter: 0, activeRoundId: null, rounds: {}, scores: {}, glossary: [], recentKeys: [] };
}

/** Convierte los datos guardados por la versión anterior (sección "jerga") al formato actual. */
function migrateLegacy(gameId, guildId) {
  if (gameId !== 'jerga') return null;
  const legacySection = store.load().jerga;
  const legacy = legacySection?.[guildId];
  if (!legacy) return null;

  const data = { ...emptyGameData(), ...legacy, recentKeys: legacy.recentTerms ?? [] };
  delete data.recentTerms;
  for (const round of Object.values(data.rounds)) {
    round.gameId ??= 'jerga';
    round.prompt ??= { key: round.term, term: round.term, banned: round.banned };
  }
  data.glossary = data.glossary.map((entry) => ({
    label: entry.label ?? entry.term,
    answer: entry.answer ?? entry.explanation,
    authorId: entry.authorId,
    votes: entry.votes,
    at: entry.at,
  }));

  delete legacySection[guildId];
  if (Object.keys(legacySection).length === 0) delete store.load().jerga;
  logger.info(`Migrated legacy jerga data for guild ${guildId}.`);
  return data;
}

function gameData(game, guildId) {
  const section = store.section('games');
  section[guildId] ??= {};
  section[guildId][game.id] ??= migrateLegacy(game.id, guildId) ?? emptyGameData();
  return section[guildId][game.id];
}

function getActiveRound(game, guildId) {
  const data = gameData(game, guildId);
  return data.activeRoundId ? (data.rounds[data.activeRoundId] ?? null) : null;
}

function getRound(game, guildId, roundId) {
  return gameData(game, guildId).rounds[roundId] ?? null;
}

/** Primera ronda activa de cualquier juego en el servidor, o null. */
function getAnyActiveRound(guildId) {
  for (const game of gamesById.values()) {
    const round = getActiveRound(game, guildId);
    if (round) return round;
  }
  return null;
}

/** Ronda activa de cualquier juego en un canal concreto, o null. Solo cabe una ronda por canal. */
function getActiveRoundInChannel(guildId, channelId) {
  for (const game of gamesById.values()) {
    const round = getActiveRound(game, guildId);
    if (round && round.channelId === channelId) return round;
  }
  return null;
}

/** Clasificación con los puntos sumados de todos los juegos. */
function getScores(guildId) {
  const totals = {};
  for (const game of gamesById.values()) {
    for (const [userId, points] of Object.entries(gameData(game, guildId).scores)) {
      totals[userId] = (totals[userId] ?? 0) + points;
    }
  }
  return Object.entries(totals)
    .map(([userId, points]) => ({ userId, points }))
    .sort((a, b) => b.points - a.points);
}

function getGlossary(game, guildId) {
  return [...gameData(game, guildId).glossary].reverse();
}

// ---- Utilidades ----

function messageLink(round, messageId = round.messageId) {
  return `https://discord.com/channels/${round.guildId}/${round.channelId}/${messageId}`;
}

function submissionCount(round) {
  return Object.keys(round.submissions).length;
}

/** Si `member` puede adelantar o cancelar la ronda. */
function canManage(round, member) {
  return round.hostId === member.id || member.permissions.has(PermissionFlagsBits.ManageMessages);
}

function assertCanManage(round, member) {
  if (!canManage(round, member)) {
    throw new UserFacingError(messages.strings(gameOf(round)).manageOnly);
  }
}

async function fetchChannel(channelId) {
  if (!client) throw new Error('roundEngine.resume(client, games) has not been called');
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) throw new UserFacingError('El canal de la ronda ya no existe.');
  return channel;
}

async function editMessage(round, messageId, payload) {
  if (!messageId) return;
  try {
    const channel = await fetchChannel(round.channelId);
    const message = await channel.messages.fetch(messageId);
    await message.edit(payload);
  } catch (error) {
    logger.warn(`Could not edit game message ${messageId}:`, error.message ?? error);
  }
}

function pickPrompt(game, data) {
  const { recentMemory } = settingsOf(game);
  const prompt = game.pickPrompt(data.recentKeys);
  data.recentKeys = [...data.recentKeys, prompt.key].slice(-recentMemory);
  return prompt;
}

// ---- Temporizadores ----

function clearTimer(roundId) {
  const handle = timers.get(roundId);
  if (handle) clearTimeout(handle);
  timers.delete(roundId);
}

function armTimer(round) {
  clearTimer(round.id);
  const delay = Math.max(0, round.deadline - Date.now());
  timers.set(
    round.id,
    setTimeout(() => onDeadline(round.gameId, round.guildId, round.id), delay),
  );
}

async function onDeadline(gameId, guildId, roundId) {
  timers.delete(roundId);
  const game = gamesById.get(gameId);
  const round = game ? getRound(game, guildId, roundId) : null;
  if (!round) return;
  try {
    if (round.phase === PHASE.SUBMITTING) await closeSubmissions(round);
    else if (round.phase === PHASE.VOTING) await finishRound(round);
  } catch (error) {
    logger.error(`Round ${roundId} (${gameId}) failed to advance on deadline:`, error);
  }
}

/**
 * Vincula el cliente y los juegos, cierra las rondas que vencieron con el bot apagado y vuelve a
 * armar los temporizadores del resto. Se espera a que las vencidas cierren antes de devolver el
 * control, para que el planificador vea el estado real al decidir qué rondas de arranque publicar.
 */
async function resume(discordClient, games) {
  client = discordClient;
  gamesById = new Map(games.map((game) => [game.id, game]));

  // Fuerza la migración de datos antiguos antes de buscar rondas activas.
  const jerga = gamesById.get('jerga');
  if (jerga) {
    for (const guildId of Object.keys(store.load().jerga ?? {})) gameData(jerga, guildId);
  }

  let resumed = 0;
  const overdue = [];
  for (const [guildId, perGame] of Object.entries(store.section('games'))) {
    for (const [gameId, data] of Object.entries(perGame)) {
      if (!gamesById.has(gameId)) continue;
      const round = data.activeRoundId ? data.rounds[data.activeRoundId] : null;
      if (!round) continue;
      round.gameId ??= gameId;
      round.guildId ??= guildId;
      if (round.deadline <= Date.now()) overdue.push(round);
      else armTimer(round);
      resumed += 1;
    }
  }
  if (resumed > 0) logger.info(`Resumed ${resumed} game round(s).`);
  for (const round of overdue) await onDeadline(round.gameId, round.guildId, round.id);
}

// ---- Ciclo de vida de la ronda ----

async function startRound({ game, guild, channel, hostId, submitMinutes, voteMinutes }) {
  const data = gameData(game, guild.id);
  // Una ronda por juego y una ronda por canal; juegos distintos en canales distintos pueden coincidir.
  const active = getActiveRound(game, guild.id) ?? getActiveRoundInChannel(guild.id, channel.id);
  if (active) {
    throw new UserFacingError(`Ya hay una ronda en marcha: ${messageLink(active)}`);
  }

  const prompt = pickPrompt(game, data);
  const submitMs = submitMinutes * 60 * 1000;
  const voteMs = voteMinutes * 60 * 1000;
  data.roundCounter += 1;

  const round = {
    id: Date.now().toString(36),
    gameId: game.id,
    number: data.roundCounter,
    guildId: guild.id,
    channelId: channel.id,
    messageId: null,
    voteMessageId: null,
    hostId,
    prompt,
    phase: PHASE.SUBMITTING,
    submitMs,
    voteMs,
    deadline: Date.now() + submitMs,
    submissions: {},
    order: [],
    votes: {},
  };

  const message = await channel.send(messages.round(game, round));
  round.messageId = message.id;

  data.rounds[round.id] = round;
  data.activeRoundId = round.id;
  store.save();
  armTimer(round);

  logger.info(`${game.name} round ${round.number} started in ${guild.name}: ${game.promptLabel(prompt)}`);
  return round;
}

/** Valida y guarda la respuesta escrita de un miembro (modos vote y judge). */
async function submit(round, userId, text) {
  const game = gameOf(round);
  const s = messages.strings(game);
  const { mode, answer, maxSubmissions } = settingsOf(game);

  if (mode === MODES.CHOICE) throw new UserFacingError(s.badOption);
  if (round.phase !== PHASE.SUBMITTING) throw new UserFacingError(s.closed);

  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length < answer.min) throw new UserFacingError(s.tooShort);
  if (clean.length > answer.max) throw new UserFacingError(s.tooLong(answer.max));

  const problem = game.validateAnswer?.(round.prompt, clean);
  if (problem) throw new UserFacingError(problem);
  const stored = game.normalizeAnswer?.(round.prompt, clean) ?? clean;

  const replaced = Boolean(round.submissions[userId]);
  if (!replaced && submissionCount(round) >= maxSubmissions) {
    throw new UserFacingError(s.maxSubmissions(maxSubmissions));
  }

  round.submissions[userId] = { text: stored, at: Date.now() };
  store.save();
  await editMessage(round, round.messageId, messages.round(game, round));

  return { replaced };
}

/** Guarda (o cambia) la opción elegida por un miembro (modo choice). */
async function pick(round, userId, index) {
  const game = gameOf(round);
  const s = messages.strings(game);

  if (settingsOf(game).mode !== MODES.CHOICE) throw new UserFacingError(s.badOption);
  if (round.phase !== PHASE.SUBMITTING) throw new UserFacingError(s.closed);
  if (!round.prompt.options?.[index]) throw new UserFacingError(s.badOption);

  const previous = round.submissions[userId]?.text;
  round.submissions[userId] = { text: String(index), at: Date.now() };
  store.save();
  await editMessage(round, round.messageId, messages.round(game, round));

  return { changed: previous !== undefined && previous !== String(index), index };
}

/**
 * Cierra los envíos. Cancela si nadie participó; abre la votación en modo vote (salvo que solo
 * haya una respuesta) y en los demás modos pasa directamente a los resultados.
 */
async function closeSubmissions(round) {
  if (round.phase !== PHASE.SUBMITTING) return { outcome: round.phase };
  const game = gameOf(round);
  const { mode } = settingsOf(game);
  clearTimer(round.id);

  const count = submissionCount(round);
  if (count === 0) {
    await cancelRound(round, messages.strings(game).cancelledEmpty);
    return { outcome: 'cancelled' };
  }

  round.order = shuffle(Object.keys(round.submissions));
  await editMessage(round, round.messageId, messages.round(game, round, { closed: true }));

  if (mode !== MODES.VOTE || count === 1) {
    await finishRound(round);
    return { outcome: 'finished' };
  }

  round.phase = PHASE.VOTING;
  round.deadline = Date.now() + (round.voteMs ?? round.submitMs);
  const channel = await fetchChannel(round.channelId);
  const voteMessage = await channel.send(messages.voting(game, round));
  round.voteMessageId = voteMessage.id;
  store.save();
  armTimer(round);

  return { outcome: 'voting' };
}

/** Registra (o cambia) el voto de un miembro. */
async function vote(round, userId, index) {
  const game = gameOf(round);
  const s = messages.strings(game);

  if (round.phase !== PHASE.VOTING) throw new UserFacingError(s.notVoting);
  const target = round.order[index];
  if (!target) throw new UserFacingError(s.badOption);
  if (target === userId) throw new UserFacingError(s.selfVote);

  const previous = round.votes[userId];
  round.votes[userId] = index;
  store.save();
  await editMessage(round, round.voteMessageId, messages.voting(game, round));

  return { changed: previous !== undefined && previous !== index };
}

/** Decide quién gana según el modo del juego. */
function decideWinners(game, round, tally) {
  const { mode } = settingsOf(game);

  if (mode === MODES.CHOICE) {
    return { winners: tally.filter((entry) => Number(entry.text) === round.prompt.correct), byLuck: false };
  }
  if (mode === MODES.JUDGE) {
    return { winners: game.pickWinners(tally, round.prompt) ?? [], byLuck: false };
  }

  const top = Math.max(...tally.map((entry) => entry.votes));
  // Gana la más votada (los empates se reparten). Si nadie votó, la suerte elige una.
  const byLuck = top === 0 && tally.length > 1;
  return { winners: byLuck ? [pickRandom(tally)] : tally.filter((entry) => entry.votes === top), byLuck };
}

/** Cuenta los votos, reparte puntos, guarda la ganadora en el glosario y anuncia los resultados. */
async function finishRound(round) {
  if (round.phase === PHASE.FINISHED) return { winners: [] };
  const game = gameOf(round);
  const { mode, points } = settingsOf(game);
  clearTimer(round.id);
  round.phase = PHASE.FINISHED;
  if (round.order.length === 0) round.order = shuffle(Object.keys(round.submissions));

  const tally = round.order.map((userId, index) => ({
    userId,
    index,
    text: round.submissions[userId].text,
    votes: Object.values(round.votes).filter((v) => v === index).length,
  }));
  const { winners, byLuck } = decideWinners(game, round, tally);

  const data = gameData(game, round.guildId);
  for (const userId of Object.keys(round.submissions)) {
    data.scores[userId] = (data.scores[userId] ?? 0) + points.participate;
  }
  for (const winner of winners) {
    data.scores[winner.userId] += points.win;
  }

  const label = game.promptLabel(round.prompt);
  if (mode === MODES.CHOICE) {
    // En modo choice la respuesta ganadora es la correcta, no la de una persona.
    data.glossary.push({ label, answer: game.glossaryAnswer(round.prompt), authorId: null, votes: winners.length, at: Date.now() });
  } else {
    for (const winner of winners) {
      data.glossary.push({
        label,
        answer: game.glossaryAnswer?.(round.prompt, winner, tally) ?? winner.text,
        authorId: winner.userId,
        votes: winner.votes,
        at: Date.now(),
      });
    }
  }

  // El glosario no crece sin límite: se conservan las últimas entradas.
  if (data.glossary.length > MAX_GLOSSARY_ENTRIES) data.glossary.splice(0, data.glossary.length - MAX_GLOSSARY_ENTRIES);

  delete data.rounds[round.id];
  if (data.activeRoundId === round.id) data.activeRoundId = null;
  store.save();

  await editMessage(round, round.voteMessageId, messages.voting(game, round, { closed: true }));
  const channel = await fetchChannel(round.channelId);
  await channel.send(
    messages.results(game, round, winners, tally, {
      mode,
      byLuck,
      points,
      summary: game.resultsSummary?.(tally, winners, round.prompt) ?? null,
      reveal: game.revealText?.(round.prompt) ?? null,
    }),
  );

  logger.info(`${game.name} round ${round.number} finished, won by ${winners.map((w) => w.userId).join(', ') || 'nobody'}`);
  return { winners };
}

/** Descarta la ronda sin repartir puntos. */
async function cancelRound(round, reason = 'Ronda cancelada.') {
  const game = gameOf(round);
  clearTimer(round.id);
  const data = gameData(game, round.guildId);
  delete data.rounds[round.id];
  if (data.activeRoundId === round.id) data.activeRoundId = null;
  store.save();

  await editMessage(round, round.messageId, messages.round(game, round, { closed: true, note: reason }));
  if (round.voteMessageId) {
    await editMessage(round, round.voteMessageId, messages.voting(game, round, { closed: true }));
  }
  logger.info(`${game.name} round ${round.number} cancelled: ${reason}`);
}

module.exports = {
  ACTIONS,
  MODAL_FIELD,
  PHASE,
  MODES,
  settingsOf,
  resume,
  getActiveRound,
  getAnyActiveRound,
  getActiveRoundInChannel,
  getRound,
  getScores,
  getGlossary,
  assertCanManage,
  startRound,
  submit,
  pick,
  closeSubmissions,
  openVoting: closeSubmissions,
  vote,
  finishRound,
  cancelRound,
  messageLink,
};

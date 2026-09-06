/**
 * "Mata la jerga": explica un término de desarrollo de videojuegos sin usar las palabras prohibidas.
 *
 * Ciclo de vida de una ronda (una ronda activa por servidor):
 *   submitting -> los miembros envían explicaciones mediante un modal
 *   voting     -> las explicaciones se muestran de forma anónima con botones de voto numerados
 *   finished   -> se anuncia la ganadora, se reparten puntos y la explicación va al glosario
 *
 * Las fases avanzan por temporizador o cuando el anfitrión pulsa el botón. El estado vive en el
 * almacén JSON, así que un reinicio conserva rondas y puntos; resume() vuelve a armar los temporizadores.
 */
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
} = require('discord.js');
const terms = require('../config/jergaTerms');
const store = require('../utils/store');
const logger = require('../utils/logger');
const { UserFacingError } = require('../utils/errors');
const { buildCustomId } = require('../handlers/componentHandler');
const { pickRandom, chunk, shuffle } = require('../utils/random');
const { findForbiddenWords, chunkLines, truncate } = require('../utils/text');

const PREFIX = 'jerga';
const ACTIONS = Object.freeze({
  SUBMIT: 'submit', // botón: abre el modal de explicación
  MODAL: 'modal', // envío de modal: texto de la explicación
  OPEN_VOTE: 'openvote', // botón (anfitrión): cierra envíos, abre votación
  VOTE: 'vote', // botón: vota la explicación <index>
  FINISH: 'finish', // botón (anfitrión): cierra votación, anuncia resultados
});
const MODAL_FIELD = 'explanation';

const PHASE = Object.freeze({ SUBMITTING: 'submitting', VOTING: 'voting', FINISHED: 'finished' });

const MIN_EXPLANATION_LENGTH = 10;
const MAX_EXPLANATION_LENGTH = 280;
const MAX_SUBMISSIONS = 15;
const RECENT_TERMS_MEMORY = 10;
const BUTTONS_PER_ROW = 5;
const POINTS = Object.freeze({ WIN: 3, PARTICIPATE: 1 });
const COLOR = 0xeb459e;

let client = null;
/** Temporizadores setTimeout activos, indexados por id de ronda. */
const timers = new Map();

// ---- Acceso al almacén ----

function guildData(guildId) {
  const section = store.section('jerga');
  section[guildId] ??= {
    roundCounter: 0,
    activeRoundId: null,
    rounds: {},
    scores: {},
    glossary: [],
    recentTerms: [],
  };
  return section[guildId];
}

function getActiveRound(guildId) {
  const data = guildData(guildId);
  return data.activeRoundId ? (data.rounds[data.activeRoundId] ?? null) : null;
}

function getRound(guildId, roundId) {
  return guildData(guildId).rounds[roundId] ?? null;
}

function getScores(guildId) {
  return Object.entries(guildData(guildId).scores)
    .map(([userId, points]) => ({ userId, points }))
    .sort((a, b) => b.points - a.points);
}

function getGlossary(guildId) {
  return [...guildData(guildId).glossary].reverse();
}

// ---- Utilidades ----

function messageLink(round, messageId = round.messageId) {
  return `https://discord.com/channels/${round.guildId}/${round.channelId}/${messageId}`;
}

function discordTimestamp(ms) {
  return `<t:${Math.floor(ms / 1000)}:R>`;
}

function termWords(term) {
  return term.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1);
}

function submissionCount(round) {
  return Object.keys(round.submissions).length;
}

function pickTerm(data) {
  const fresh = terms.filter((entry) => !data.recentTerms.includes(entry.term));
  const chosen = pickRandom(fresh.length > 0 ? fresh : terms);
  data.recentTerms = [...data.recentTerms, chosen.term].slice(-RECENT_TERMS_MEMORY);
  return chosen;
}

/** Si `member` puede adelantar o cancelar la ronda. */
function canManage(round, member) {
  return round.hostId === member.id || member.permissions.has(PermissionFlagsBits.ManageMessages);
}

function assertCanManage(round, member) {
  if (!canManage(round, member)) {
    throw new UserFacingError('Solo quien inició la ronda (o alguien con **Gestionar mensajes**) puede hacer eso.');
  }
}

async function fetchChannel(channelId) {
  if (!client) throw new Error('jergaService.resume(client) has not been called');
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
    logger.warn(`Could not edit jerga message ${messageId}:`, error.message ?? error);
  }
}

// ---- Constructores de mensajes ----

function buildRoundMessage(round, { closed = false, note = null } = {}) {
  const banned = round.banned.map((word) => `~~${word}~~`).join('   ');

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(`Mata la jerga · Ronda ${round.number}`)
    .setDescription(
      `Explica **${round.term}** para alguien que empieza en la jam.\n\n` +
        `Palabras prohibidas: ${banned}\n` +
        '(El propio término tampoco vale.)',
    )
    .addFields(
      { name: 'Explicaciones recibidas', value: String(submissionCount(round)), inline: true },
      { name: 'Envíos', value: closed ? 'Cerrados' : `Se cierran ${discordTimestamp(round.deadline)}`, inline: true },
    )
    .setFooter({ text: 'Las explicaciones se muestran de forma anónima en la votación.' });

  if (note) embed.addFields({ name: '​', value: note });

  const components = closed
    ? []
    : [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(buildCustomId(PREFIX, ACTIONS.SUBMIT, round.id))
            .setLabel('Enviar explicación')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(buildCustomId(PREFIX, ACTIONS.OPEN_VOTE, round.id))
            .setLabel('Cerrar envíos y votar')
            .setStyle(ButtonStyle.Secondary),
        ),
      ];

  return { embeds: [embed], components, allowedMentions: { parse: [] } };
}

function buildModal(round) {
  const input = new TextInputBuilder()
    .setCustomId(MODAL_FIELD)
    .setLabel('Tu explicación')
    .setPlaceholder(truncate(`Sin usar: ${round.banned.join(', ')}`, 100))
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(MIN_EXPLANATION_LENGTH)
    .setMaxLength(MAX_EXPLANATION_LENGTH)
    .setRequired(true);

  return new ModalBuilder()
    .setCustomId(buildCustomId(PREFIX, ACTIONS.MODAL, round.id))
    .setTitle(truncate(`Explica: ${round.term}`, 45))
    .addComponents(new ActionRowBuilder().addComponents(input));
}

function buildVotingMessage(round, { closed = false } = {}) {
  const lines = round.order.map((userId, index) => `**${index + 1}.** ${round.submissions[userId].text}`);
  const voteCount = Object.keys(round.votes).length;

  const [first, ...rest] = chunkLines(lines, 3800);
  const embeds = [
    new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`Mata la jerga · Votación · ${round.term}`)
      .setDescription(`Vota la explicación más clara de **${round.term}**. No puedes votar la tuya.\n\n${first}`),
    ...rest.map((text) => new EmbedBuilder().setColor(COLOR).setDescription(text)),
  ];
  embeds.at(-1).addFields(
    { name: 'Votos', value: String(voteCount), inline: true },
    { name: 'Votación', value: closed ? 'Cerrada' : `Se cierra ${discordTimestamp(round.deadline)}`, inline: true },
  );

  if (closed) return { embeds, components: [], allowedMentions: { parse: [] } };

  const voteButtons = round.order.map((_, index) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(PREFIX, ACTIONS.VOTE, round.id, index))
      .setLabel(String(index + 1))
      .setStyle(ButtonStyle.Secondary),
  );
  const rows = chunk(voteButtons, BUTTONS_PER_ROW).map((group) => new ActionRowBuilder().addComponents(group));
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(PREFIX, ACTIONS.FINISH, round.id))
        .setLabel('Terminar votación')
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return { embeds, components: rows, allowedMentions: { parse: [] } };
}

function buildResultsMessage(round, winners, tally, { byLuck = false } = {}) {
  const winnerLines = winners.map((entry) => `**${entry.votes} voto(s)** · <@${entry.userId}>\n> ${entry.text}`);
  const title =
    winners.length > 1 ? `Mata la jerga · Empate · ${round.term}` : `Mata la jerga · Resultados · ${round.term}`;
  const description = byLuck
    ? `Nadie votó, así que la suerte ha elegido la explicación ganadora:\n\n${winnerLines.join('\n\n')}`
    : winnerLines.join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: 'Explicaciones', value: String(tally.length), inline: true },
      { name: 'Votos', value: String(Object.keys(round.votes).length), inline: true },
      { name: 'Puntos', value: `Ganar +${POINTS.WIN} · Participar +${POINTS.PARTICIPATE}`, inline: true },
    )
    .setFooter({ text: 'La explicación ganadora se guarda en el glosario (/jerga glossary).' });

  return {
    content: winners.map((entry) => `<@${entry.userId}>`).join(' '),
    embeds: [embed],
    allowedMentions: { users: winners.map((entry) => entry.userId) },
  };
}

function buildScoresMessage(guildId) {
  const scores = getScores(guildId).slice(0, 10);
  const lines = scores.length
    ? scores.map((entry, index) => `**${index + 1}.** <@${entry.userId}> · ${entry.points} punto(s)`)
    : ['Todavía nadie tiene puntos. Empieza una ronda con `/jerga start`.'];

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('Mata la jerga · Clasificación')
    .setDescription(lines.join('\n'));
  return { embeds: [embed], allowedMentions: { parse: [] } };
}

function buildGlossaryMessage(guildId) {
  const entries = getGlossary(guildId).slice(0, 8);
  const lines = entries.length
    ? entries.map(
        (entry) => `**${entry.term}** · <@${entry.authorId}> (${entry.votes} voto(s))\n> ${entry.explanation}`,
      )
    : ['El glosario está vacío. Las explicaciones ganadoras aparecerán aquí.'];

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('Mata la jerga · Glosario')
    .setDescription(truncate(lines.join('\n\n'), 4000));
  return { embeds: [embed], allowedMentions: { parse: [] } };
}

/**
 * Embed público con las instrucciones del juego.
 * @param {{ channelId?: string|null, roundsPerDay?: number, submitMinutes: number, voteMinutes: number }} options
 */
function buildTutorialMessage({ channelId = null, roundsPerDay = 0, submitMinutes, voteMinutes }) {
  const where = channelId ? `en <#${channelId}>` : 'en este canal';
  const cadence =
    roundsPerDay > 0
      ? `Las rondas aparecen solas ${roundsPerDay} veces al día, a horas aleatorias, ${where}.`
      : `Cualquiera puede abrir una ronda con \`/jerga start\` ${where}.`;

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('Mata la jerga · Cómo se juega')
    .setDescription(
      'Un juego para entrenar lo que mejor hacemos aquí: explicar cosas de desarrollo de videojuegos ' +
        'sin jerga, como se lo contarías a alguien en su primera jam.',
    )
    .addFields(
      {
        name: '1. Aparece un término',
        value:
          `${cadence}\n` +
          'Cada ronda trae un término (por ejemplo **Raycast**) y cinco palabras prohibidas.',
      },
      {
        name: '2. Explícalo',
        value:
          `Pulsa **Enviar explicación** y escríbela en ${MAX_EXPLANATION_LENGTH} caracteres como máximo, ` +
          'sin usar el término ni las palabras prohibidas. El bot lo comprueba ignorando mayúsculas, acentos y plurales. ' +
          `Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, las explicaciones aparecen de forma anónima y en orden aleatorio. ' +
          'Vota la más clara con los botones numerados. No puedes votar la tuya y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
          'La explicación ganadora se guarda en el glosario del servidor.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${POINTS.WIN}** · Participar: **+${POINTS.PARTICIPATE}**\n` +
          '`/jerga scores` clasificación · `/jerga glossary` explicaciones ganadoras · `/jerga schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Compara con algo cotidiano. Ve al grano: corto y concreto gana más que largo y perfecto. ' +
          'Si te sale una palabra prohibida, suele haber una forma más sencilla de decirlo.',
      },
    )
    .setFooter({
      text: 'Con Gestionar mensajes se puede adelantar o cancelar una ronda con /jerga next y /jerga cancel.',
    });

  return { embeds: [embed], allowedMentions: { parse: [] } };
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
    setTimeout(() => onDeadline(round.guildId, round.id), delay),
  );
}

async function onDeadline(guildId, roundId) {
  timers.delete(roundId);
  const round = getRound(guildId, roundId);
  if (!round) return;
  try {
    if (round.phase === PHASE.SUBMITTING) await openVoting(round);
    else if (round.phase === PHASE.VOTING) await finishRound(round);
  } catch (error) {
    logger.error(`Jerga round ${roundId} failed to advance on deadline:`, error);
  }
}

/** Vincula el cliente y vuelve a armar los temporizadores de las rondas que sobrevivieron a un reinicio. */
function resume(discordClient) {
  client = discordClient;
  let resumed = 0;
  for (const data of Object.values(store.section('jerga'))) {
    const round = data.activeRoundId ? data.rounds[data.activeRoundId] : null;
    if (!round) continue;
    armTimer(round);
    resumed += 1;
  }
  if (resumed > 0) logger.info(`Resumed ${resumed} jerga round(s).`);
}

// ---- Ciclo de vida de la ronda ----

async function startRound({ guild, channel, hostId, submitMinutes, voteMinutes }) {
  const data = guildData(guild.id);
  const active = getActiveRound(guild.id);
  if (active) {
    throw new UserFacingError(`Ya hay una ronda en marcha: ${messageLink(active)}`);
  }

  const { term, banned } = pickTerm(data);
  const submitMs = submitMinutes * 60 * 1000;
  const voteMs = voteMinutes * 60 * 1000;
  data.roundCounter += 1;

  const round = {
    id: Date.now().toString(36),
    number: data.roundCounter,
    guildId: guild.id,
    channelId: channel.id,
    messageId: null,
    voteMessageId: null,
    hostId,
    term,
    banned,
    phase: PHASE.SUBMITTING,
    submitMs,
    voteMs,
    deadline: Date.now() + submitMs,
    submissions: {},
    order: [],
    votes: {},
  };

  const message = await channel.send(buildRoundMessage(round));
  round.messageId = message.id;

  data.rounds[round.id] = round;
  data.activeRoundId = round.id;
  store.save();
  armTimer(round);

  logger.info(`Jerga round ${round.number} started in ${guild.name}: ${term}`);
  return round;
}

/** Valida y guarda la explicación de un miembro. */
async function submit(round, userId, text) {
  if (round.phase !== PHASE.SUBMITTING) {
    throw new UserFacingError('Los envíos de esta ronda ya están cerrados.');
  }

  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length < MIN_EXPLANATION_LENGTH) {
    throw new UserFacingError('Escribe una explicación un poco más larga.');
  }
  if (clean.length > MAX_EXPLANATION_LENGTH) {
    throw new UserFacingError(`Máximo ${MAX_EXPLANATION_LENGTH} caracteres. La gracia es explicarlo corto.`);
  }

  const forbidden = findForbiddenWords(clean, [...termWords(round.term), ...round.banned]);
  if (forbidden.length > 0) {
    const list = forbidden.map((word) => `**${word}**`).join(', ');
    throw new UserFacingError(`Tu explicación usa palabras prohibidas: ${list}. Inténtalo de nuevo.`);
  }

  const replaced = Boolean(round.submissions[userId]);
  if (!replaced && submissionCount(round) >= MAX_SUBMISSIONS) {
    throw new UserFacingError(`Esta ronda ya tiene el máximo de ${MAX_SUBMISSIONS} explicaciones.`);
  }

  round.submissions[userId] = { text: clean, at: Date.now() };
  store.save();
  await editMessage(round, round.messageId, buildRoundMessage(round));

  return { replaced };
}

/** Cierra los envíos. Cancela si nadie participó y termina directamente si solo participó una persona. */
async function openVoting(round) {
  if (round.phase !== PHASE.SUBMITTING) return { outcome: round.phase };
  clearTimer(round.id);

  const count = submissionCount(round);
  if (count === 0) {
    await cancelRound(round, 'Nadie envió una explicación, así que la ronda queda cancelada.');
    return { outcome: 'cancelled' };
  }

  round.order = shuffle(Object.keys(round.submissions));
  round.phase = PHASE.VOTING;
  // `durationMs` es el nombre del campo en rondas guardadas antes de separar las ventanas de envío y votación.
  round.deadline = Date.now() + (round.voteMs ?? round.submitMs ?? round.durationMs);
  store.save();

  await editMessage(round, round.messageId, buildRoundMessage(round, { closed: true }));

  if (count === 1) {
    await finishRound(round);
    return { outcome: 'finished' };
  }

  const channel = await fetchChannel(round.channelId);
  const voteMessage = await channel.send(buildVotingMessage(round));
  round.voteMessageId = voteMessage.id;
  store.save();
  armTimer(round);

  return { outcome: 'voting' };
}

/** Registra (o cambia) el voto de un miembro. */
async function vote(round, userId, index) {
  if (round.phase !== PHASE.VOTING) {
    throw new UserFacingError('La votación de esta ronda no está abierta.');
  }
  const target = round.order[index];
  if (!target) {
    throw new UserFacingError('Esa opción no existe.');
  }
  if (target === userId) {
    throw new UserFacingError('No puedes votar tu propia explicación.');
  }

  const previous = round.votes[userId];
  round.votes[userId] = index;
  store.save();
  await editMessage(round, round.voteMessageId, buildVotingMessage(round));

  return { changed: previous !== undefined && previous !== index };
}

/** Cuenta los votos, reparte puntos, guarda la ganadora en el glosario y anuncia los resultados. */
async function finishRound(round) {
  if (round.phase === PHASE.FINISHED) return { winners: [] };
  clearTimer(round.id);
  round.phase = PHASE.FINISHED;

  const tally = round.order.map((userId, index) => ({
    userId,
    index,
    text: round.submissions[userId].text,
    votes: Object.values(round.votes).filter((v) => v === index).length,
  }));
  const top = Math.max(...tally.map((entry) => entry.votes));
  // Gana la más votada (los empates se reparten). Si nadie votó, la suerte elige una para que toda ronda tenga ganadora.
  const byLuck = top === 0 && tally.length > 1;
  const winners = byLuck ? [pickRandom(tally)] : tally.filter((entry) => entry.votes === top);

  const data = guildData(round.guildId);
  for (const userId of Object.keys(round.submissions)) {
    data.scores[userId] = (data.scores[userId] ?? 0) + POINTS.PARTICIPATE;
  }
  for (const winner of winners) {
    data.scores[winner.userId] += POINTS.WIN;
    data.glossary.push({
      term: round.term,
      explanation: winner.text,
      authorId: winner.userId,
      votes: winner.votes,
      at: Date.now(),
    });
  }

  delete data.rounds[round.id];
  if (data.activeRoundId === round.id) data.activeRoundId = null;
  store.save();

  await editMessage(round, round.voteMessageId, buildVotingMessage(round, { closed: true }));
  const channel = await fetchChannel(round.channelId);
  await channel.send(buildResultsMessage(round, winners, tally, { byLuck }));

  logger.info(`Jerga round ${round.number} finished: ${round.term} won by ${winners.map((w) => w.userId).join(', ')}`);
  return { winners };
}

/** Descarta la ronda sin repartir puntos. */
async function cancelRound(round, reason = 'Ronda cancelada.') {
  clearTimer(round.id);
  const data = guildData(round.guildId);
  delete data.rounds[round.id];
  if (data.activeRoundId === round.id) data.activeRoundId = null;
  store.save();

  await editMessage(round, round.messageId, buildRoundMessage(round, { closed: true, note: reason }));
  if (round.voteMessageId) {
    await editMessage(round, round.voteMessageId, buildVotingMessage(round, { closed: true }));
  }
  logger.info(`Jerga round ${round.number} cancelled: ${reason}`);
}

module.exports = {
  PREFIX,
  ACTIONS,
  PHASE,
  MODAL_FIELD,
  resume,
  getActiveRound,
  getRound,
  assertCanManage,
  startRound,
  submit,
  openVoting,
  vote,
  finishRound,
  cancelRound,
  buildModal,
  buildScoresMessage,
  buildGlossaryMessage,
  buildTutorialMessage,
  messageLink,
};

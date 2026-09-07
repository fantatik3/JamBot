/**
 * Mensajes y textos del motor de rondas. Todo lo que ve la gente sale de aquí.
 *
 * Cada juego puede cambiar el sustantivo de la respuesta (por ejemplo "explicación") o
 * sobrescribir cualquier texto concreto a través de `game.strings`.
 */
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { buildCustomId } = require('../../handlers/componentHandler');
const { chunk } = require('../../utils/random');
const { chunkLines, truncate } = require('../../utils/text');

const BUTTONS_PER_ROW = 5;
const MAX_PINGED_WINNERS = 40;
const NO_PINGS = { allowedMentions: { parse: [] } };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Los customIds usan estas acciones; se repiten aquí para no crear una dependencia circular con el motor.
const ACTIONS = Object.freeze({ SUBMIT: 'submit', MODAL: 'modal', PICK: 'pick', OPEN_VOTE: 'openvote', VOTE: 'vote', FINISH: 'finish' });

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function timestamp(ms) {
  return `<t:${Math.floor(ms / 1000)}:R>`;
}

function isChoice(game) {
  return game.mode === 'choice';
}

/** Textos por defecto construidos a partir del sustantivo (femenino) que usa el juego. */
function defaultStrings(game) {
  const noun = game.strings?.noun ?? 'respuesta';
  const plural = game.strings?.nounPlural ?? `${noun}s`;
  const closeButton = isChoice(game) || game.pickWinners ? 'Cerrar y corregir' : 'Cerrar envíos y votar';
  return {
    noun,
    nounPlural: plural,
    submitButton: `Enviar ${noun}`,
    closeButton,
    finishButton: 'Terminar votación',
    receivedField: `${capitalize(plural)} recibidas`,
    roundFooter: isChoice(game)
      ? 'Puedes cambiar tu respuesta hasta que se cierre la ronda.'
      : `Las ${plural} se muestran de forma anónima en la votación.`,
    modalLabel: `Tu ${noun}`,
    voteIntro: () => `Vota la ${noun} más clara. No puedes votar la tuya.`,
    luckLine: `Nadie votó, así que la suerte ha elegido la ${noun} ganadora:`,
    resultsFooter: `La ${noun} ganadora se guarda en el glosario (/${game.id} glossary).`,
    revealField: 'Solución',
    winnersField: 'Acertaron',
    nobodyRight: 'Nadie acertó esta vez.',
    glossaryEmpty: `El glosario está vacío. Las ${plural} ganadoras aparecerán aquí.`,
    scoresEmpty: 'Todavía nadie tiene puntos.',
    submitReceived: `${capitalize(noun)} recibida. Se mostrará de forma anónima en la votación.`,
    submitUpdated: `${capitalize(noun)} actualizada.`,
    pickReceived: (letter) => `Respuesta registrada: ${letter}. Puedes cambiarla hasta que se cierre la ronda.`,
    pickChanged: (letter) => `Respuesta cambiada a ${letter}.`,
    closed: 'Los envíos de esta ronda ya están cerrados.',
    tooShort: `Escribe una ${noun} un poco más larga.`,
    tooLong: (max) => `Máximo ${max} caracteres. La gracia es que sea corta.`,
    maxSubmissions: (max) => `Esta ronda ya tiene el máximo de ${max} ${plural}.`,
    notVoting: 'La votación de esta ronda no está abierta.',
    badOption: 'Esa opción no existe.',
    selfVote: `No puedes votar tu propia ${noun}.`,
    noRound: 'Esta ronda ya terminó.',
    manageOnly: 'Solo quien inició la ronda (o alguien con **Gestionar mensajes**) puede hacer eso.',
    cancelledEmpty: `Nadie envió una ${noun}, así que la ronda queda cancelada.`,
    guildOnly: 'Este juego solo funciona dentro de un servidor.',
  };
}

/** Textos efectivos de un juego: los suyos por encima de los predeterminados. */
function strings(game) {
  return { ...defaultStrings(game), ...(game.strings ?? {}) };
}

function round(game, round, { closed = false, note = null } = {}) {
  const s = strings(game);
  const received = Object.keys(round.submissions).length;

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(`${game.name} · Ronda ${round.number}`)
    .setDescription(game.promptBody(round.prompt))
    .addFields(
      { name: s.receivedField, value: String(received), inline: true },
      { name: 'Envíos', value: closed ? 'Cerrados' : `Se cierran ${timestamp(round.deadline)}`, inline: true },
    )
    .setFooter({ text: s.roundFooter });

  if (note) embed.addFields({ name: '​', value: note });
  if (closed) return { embeds: [embed], components: [], ...NO_PINGS };

  const closeButton = new ButtonBuilder()
    .setCustomId(buildCustomId(game.id, ACTIONS.OPEN_VOTE, round.id))
    .setLabel(s.closeButton)
    .setStyle(ButtonStyle.Secondary);

  let rows;
  if (isChoice(game)) {
    const options = round.prompt.options.map((_, index) =>
      new ButtonBuilder()
        .setCustomId(buildCustomId(game.id, ACTIONS.PICK, round.id, index))
        .setLabel(LETTERS[index] ?? String(index + 1))
        .setStyle(ButtonStyle.Primary),
    );
    rows = chunk(options, BUTTONS_PER_ROW).map((group) => new ActionRowBuilder().addComponents(group));
    rows.push(new ActionRowBuilder().addComponents(closeButton));
  } else {
    const submitButton = new ButtonBuilder()
      .setCustomId(buildCustomId(game.id, ACTIONS.SUBMIT, round.id))
      .setLabel(s.submitButton)
      .setStyle(ButtonStyle.Primary);
    rows = [new ActionRowBuilder().addComponents(submitButton, closeButton)];
  }

  return { embeds: [embed], components: rows, ...NO_PINGS };
}

function modal(game, round, fieldId, { min, max }) {
  const s = strings(game);
  const input = new TextInputBuilder()
    .setCustomId(fieldId)
    .setLabel(s.modalLabel)
    .setStyle(max > 100 ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setMinLength(min)
    .setMaxLength(max)
    .setRequired(true);

  const placeholder = game.modalPlaceholder?.(round.prompt);
  if (placeholder) input.setPlaceholder(truncate(placeholder, 100));

  return new ModalBuilder()
    .setCustomId(buildCustomId(game.id, ACTIONS.MODAL, round.id))
    .setTitle(truncate(game.modalTitle(round.prompt), 45))
    .addComponents(new ActionRowBuilder().addComponents(input));
}

function voting(game, round, { closed = false } = {}) {
  const s = strings(game);
  const lines = round.order.map((userId, index) => `**${index + 1}.** ${round.submissions[userId].text}`);
  const voteCount = Object.keys(round.votes).length;

  const [first, ...rest] = chunkLines(lines, 3800);
  const embeds = [
    new EmbedBuilder()
      .setColor(game.color)
      .setTitle(`${game.name} · Votación · ${game.promptLabel(round.prompt)}`)
      .setDescription(`${s.voteIntro(round.prompt)}\n\n${first}`),
    ...rest.map((text) => new EmbedBuilder().setColor(game.color).setDescription(text)),
  ];
  embeds.at(-1).addFields(
    { name: 'Votos', value: String(voteCount), inline: true },
    { name: 'Votación', value: closed ? 'Cerrada' : `Se cierra ${timestamp(round.deadline)}`, inline: true },
  );

  if (closed) return { embeds, components: [], ...NO_PINGS };

  const voteButtons = round.order.map((_, index) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(game.id, ACTIONS.VOTE, round.id, index))
      .setLabel(String(index + 1))
      .setStyle(ButtonStyle.Secondary),
  );
  const rows = chunk(voteButtons, BUTTONS_PER_ROW).map((group) => new ActionRowBuilder().addComponents(group));
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(game.id, ACTIONS.FINISH, round.id))
        .setLabel(s.finishButton)
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return { embeds, components: rows, ...NO_PINGS };
}

function results(game, round, winners, tally, { mode = 'vote', byLuck = false, points, summary = null, reveal = null }) {
  const s = strings(game);
  const label = game.promptLabel(round.prompt);
  const showVotes = mode === 'vote';

  let title = `${game.name} · Resultados · ${label}`;
  if (showVotes && winners.length > 1) title = `${game.name} · Empate · ${label}`;

  const parts = [];
  if (byLuck) parts.push(s.luckLine);
  if (summary) parts.push(summary);
  if (mode === 'choice') {
    parts.push(winners.length ? `**${s.winnersField}:** ${winners.map((e) => `<@${e.userId}>`).join(', ')}` : s.nobodyRight);
  } else if (winners.length) {
    parts.push(
      winners
        .map((e) => (showVotes ? `**${e.votes} voto(s)** · <@${e.userId}>\n> ${e.text}` : `<@${e.userId}> · ${e.text}`))
        .join('\n\n'),
    );
  } else {
    parts.push(s.nobodyRight);
  }

  const fields = [{ name: capitalize(s.nounPlural), value: String(tally.length), inline: true }];
  if (showVotes) fields.push({ name: 'Votos', value: String(Object.keys(round.votes).length), inline: true });
  fields.push({ name: 'Puntos', value: `Ganar +${points.win} · Participar +${points.participate}`, inline: true });
  if (reveal) fields.push({ name: s.revealField, value: truncate(reveal, 1024) });

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(title)
    .setDescription(truncate(parts.join('\n\n'), 4000))
    .addFields(...fields)
    .setFooter({ text: s.resultsFooter });

  // El contenido tiene un límite de 2000 caracteres: con muchas personas acertando (trivia) se mencionan solo las primeras.
  const mentions = winners.map((entry) => entry.userId).slice(0, MAX_PINGED_WINNERS);
  return {
    content: mentions.map((id) => `<@${id}>`).join(' '),
    embeds: [embed],
    allowedMentions: { users: mentions },
  };
}

function scores(title, entries, color) {
  const lines = entries.length
    ? entries.slice(0, 10).map((entry, index) => `**${index + 1}.** <@${entry.userId}> · ${entry.points} punto(s)`)
    : ['Todavía nadie tiene puntos.'];

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(lines.join('\n'));
  return { embeds: [embed], ...NO_PINGS };
}

function glossary(game, entries) {
  const s = strings(game);
  const lines = entries.length
    ? entries.slice(0, 8).map((entry) => {
        const who = entry.authorId ? ` · <@${entry.authorId}> (${entry.votes} voto(s))` : '';
        return `**${entry.label}**${who}\n> ${entry.answer}`;
      })
    : [s.glossaryEmpty];

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(`${game.name} · Glosario`)
    .setDescription(truncate(lines.join('\n\n'), 4000));
  return { embeds: [embed], ...NO_PINGS };
}

/** Embed público con las instrucciones. El juego aporta la descripción y los pasos. */
function tutorial(game, settings) {
  const { description, fields } = game.tutorial(settings);
  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(`${game.name} · Cómo se juega`)
    .setDescription(description)
    .addFields(...fields)
    .setFooter({
      text: `Con Gestionar mensajes se puede adelantar o cancelar una ronda con /${game.id} next y /${game.id} cancel.`,
    });
  return { embeds: [embed], ...NO_PINGS };
}

module.exports = { LETTERS, strings, round, modal, voting, results, scores, glossary, tutorial };

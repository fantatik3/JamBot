/**
 * Mensajes y textos del motor de rondas. Todo lo que ve la gente sale de aquí, en el idioma
 * configurado (src/locales): los textos comunes están en `engine` y los de cada juego en `games.<id>`.
 *
 * Cada juego puede cambiar el sustantivo de la respuesta (por ejemplo "explicación") o
 * sobrescribir cualquier texto concreto desde `games.<id>.strings` de su idioma.
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
const { t, get } = require('../../i18n');

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

/**
 * Textos efectivos de un juego: los del motor (engine.strings, construidos con el sustantivo del
 * juego) por debajo de los propios del juego (games.<id>.strings) y de los que defina en código.
 */
function strings(game) {
  const own = get(`games.${game.id}.strings`) ?? {};
  const defaults = t('engine.strings', {
    noun: own.noun,
    nounPlural: own.nounPlural,
    gameId: game.id,
    choice: isChoice(game),
    judged: Boolean(game.pickWinners),
  });
  return { ...defaults, ...own, ...(game.strings ?? {}) };
}

function round(game, round, { closed = false, note = null } = {}) {
  const s = strings(game);
  const received = Object.keys(round.submissions).length;

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(t('engine.round.title', { game: game.name, number: round.number }))
    .setDescription(game.promptBody(round.prompt))
    .addFields(
      { name: s.receivedField, value: String(received), inline: true },
      {
        name: t('engine.round.submissionsField'),
        value: closed ? t('engine.round.closed') : t('engine.round.closesAt', { when: timestamp(round.deadline) }),
        inline: true,
      },
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
      .setTitle(t('engine.voting.title', { game: game.name, label: game.promptLabel(round.prompt) }))
      .setDescription(`${s.voteIntro(round.prompt)}\n\n${first}`),
    ...rest.map((text) => new EmbedBuilder().setColor(game.color).setDescription(text)),
  ];
  embeds.at(-1).addFields(
    { name: t('engine.voting.votesField'), value: String(voteCount), inline: true },
    {
      name: t('engine.voting.statusField'),
      value: closed ? t('engine.voting.closed') : t('engine.voting.closesAt', { when: timestamp(round.deadline) }),
      inline: true,
    },
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
  const titleKey = showVotes && winners.length > 1 ? 'engine.results.tieTitle' : 'engine.results.title';
  const title = t(titleKey, { game: game.name, label });

  const parts = [];
  if (byLuck) parts.push(s.luckLine);
  if (summary) parts.push(summary);
  if (mode === 'choice') {
    parts.push(winners.length ? `**${s.winnersField}:** ${winners.map((e) => `<@${e.userId}>`).join(', ')}` : s.nobodyRight);
  } else if (winners.length) {
    parts.push(
      winners
        .map((e) => {
          const user = `<@${e.userId}>`;
          return showVotes
            ? t('engine.results.voteLine', { votes: e.votes, user, text: e.text })
            : t('engine.results.plainLine', { user, text: e.text });
        })
        .join('\n\n'),
    );
  } else {
    parts.push(s.nobodyRight);
  }

  const fields = [{ name: capitalize(s.nounPlural), value: String(tally.length), inline: true }];
  if (showVotes) fields.push({ name: t('engine.results.votesField'), value: String(Object.keys(round.votes).length), inline: true });
  fields.push({
    name: t('engine.results.pointsField'),
    value: t('engine.results.pointsValue', { win: points.win, participate: points.participate }),
    inline: true,
  });
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
    ? entries.slice(0, 10).map((entry, index) => t('engine.scores.line', { rank: index + 1, user: `<@${entry.userId}>`, points: entry.points }))
    : [t('engine.scores.empty')];

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(lines.join('\n'));
  return { embeds: [embed], ...NO_PINGS };
}

function glossary(game, entries) {
  const s = strings(game);
  const lines = entries.length
    ? entries.slice(0, 8).map((entry) => {
        const who = entry.authorId ? t('engine.glossary.byLine', { user: `<@${entry.authorId}>`, votes: entry.votes }) : '';
        return `**${entry.label}**${who}\n> ${entry.answer}`;
      })
    : [s.glossaryEmpty];

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(t('engine.glossary.title', { game: game.name }))
    .setDescription(truncate(lines.join('\n\n'), 4000));
  return { embeds: [embed], ...NO_PINGS };
}

/** Embed público con las instrucciones. La descripción y los pasos salen del idioma (games.<id>.tutorial). */
function tutorial(game, settings) {
  const { description, fields } = game.tutorial?.(settings) ?? t(`games.${game.id}.tutorial`, settings);
  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(t('engine.tutorial.title', { game: game.name }))
    .setDescription(description)
    .addFields(...fields)
    .setFooter({ text: t('engine.tutorial.footer', { gameId: game.id }) });
  return { embeds: [embed], ...NO_PINGS };
}

module.exports = { LETTERS, strings, round, modal, voting, results, scores, glossary, tutorial };

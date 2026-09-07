/**
 * Crea el comando de barra de un juego. Todos los juegos comparten los mismos subcomandos:
 *   /<juego> start [duration]  -> empieza una ronda ahora (en el canal de juegos)
 *   /<juego> next              -> cierra la fase actual (envíos -> votación -> resultados)
 *   /<juego> cancel            -> cancela la ronda activa sin repartir puntos
 *   /<juego> scores            -> clasificación (puntos de todos los juegos)
 *   /<juego> glossary          -> últimas respuestas ganadoras de este juego
 *   /<juego> schedule          -> rondas automáticas previstas para hoy
 *   /<juego> tutorial          -> publica las instrucciones para todo el mundo (solo el rol de pruebas)
 *   /<juego> test [duration]   -> ronda rápida de prueba en este canal (solo el rol de pruebas)
 *
 * Cada juego responde solo en su canal (<ID>_CHANNEL_ID), salvo `tutorial` y `test`, que están
 * reservados al rol de pruebas y funcionan en cualquier canal. Los textos salen de engine.command
 * del idioma configurado.
 */
const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const config = require('../../config');
const engine = require('./roundEngine');
const messages = require('./messages');
const scheduler = require('../../services/gameScheduler');
const { UserFacingError } = require('../../utils/errors');
const { t, get } = require('../../i18n');

const TEST_MINUTES = 2;

/** Texto de engine.command.<clave>. */
function c(key, params) {
  return t(`engine.command.${key}`, params);
}

/** Minutos de cada fase para un juego: los suyos si los define, si no los de la configuración. */
function durationsOf(game, override = null) {
  return {
    submitMinutes: override ?? game.submitMinutes ?? config.games.submitMinutes,
    voteMinutes: override ?? game.voteMinutes ?? config.games.voteMinutes,
  };
}

function createGameCommand(game) {
  const data = new SlashCommandBuilder()
    .setName(game.id)
    .setDescription(game.description)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription(c('start.description'))
        .addIntegerOption((opt) => opt.setName('duration').setDescription(c('start.duration')).setMinValue(1).setMaxValue(720)),
    )
    .addSubcommand((sub) => sub.setName('next').setDescription(c('next')))
    .addSubcommand((sub) => sub.setName('cancel').setDescription(c('cancel')))
    .addSubcommand((sub) => sub.setName('scores').setDescription(c('scores')))
    .addSubcommand((sub) => sub.setName('glossary').setDescription(c('glossary')))
    .addSubcommand((sub) => sub.setName('schedule').setDescription(c('schedule')))
    .addSubcommand((sub) => sub.setName('tutorial').setDescription(c('tutorial')))
    .addSubcommand((sub) =>
      sub
        .setName('test')
        .setDescription(c('test.description'))
        .addIntegerOption((opt) =>
          opt.setName('duration').setDescription(c('test.duration', { minutes: TEST_MINUTES })).setMinValue(1).setMaxValue(60),
        ),
    );

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async function execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'test') {
      requireTesterRole(interaction);
      return handleTest(game, interaction);
    }
    if (sub === 'tutorial') {
      requireTesterRole(interaction);
      return interaction.reply(messages.tutorial(game, tutorialSettings(game)));
    }

    const channelId = config.gameChannelId(game.id);
    if (channelId && interaction.channelId !== channelId) {
      throw new UserFacingError(c('wrongChannel', { game: game.name, channelId }));
    }

    switch (sub) {
      case 'start':
        return handleStart(game, interaction);
      case 'next':
        return handleNext(game, interaction);
      case 'cancel':
        return handleCancel(game, interaction);
      case 'scores':
        return interaction.reply(messages.scores(t('engine.scores.title'), engine.getScores(interaction.guildId), game.color));
      case 'glossary':
        return interaction.reply(messages.glossary(game, engine.getGlossary(game, interaction.guildId)));
      case 'schedule':
        return handleSchedule(game, interaction);
      default:
        throw new UserFacingError(c('unknownSubcommand'));
    }
  }

  return { data, execute };
}

/** Datos que reciben las instrucciones de un juego, incluida la frase de cadencia ya resuelta. */
function tutorialSettings(game) {
  const { points, answer } = engine.settingsOf(game);
  const { submitMinutes, voteMinutes } = durationsOf(game);
  const channelId = config.gameChannelId(game.id);
  const roundsPerDay = config.games.roundsPerDay;
  const where = channelId ? t('engine.tutorial.whereChannel', { channelId }) : t('engine.tutorial.whereHere');
  const cadence =
    roundsPerDay > 0 ? t('engine.tutorial.cadenceAuto', { where }) : t('engine.tutorial.cadenceManual', { gameId: game.id, where });

  return {
    gameId: game.id,
    channelId,
    roundsPerDay,
    cadence,
    submitMinutes,
    voteMinutes,
    answerMax: answer.max,
    points,
  };
}

async function launchRound(game, interaction, durations) {
  if (!interaction.channel) throw new UserFacingError(c('cannotSeeChannel'));
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  return engine.startRound({
    game,
    guild: interaction.guild,
    channel: interaction.channel,
    hostId: interaction.user.id,
    ...durations,
  });
}

async function handleStart(game, interaction) {
  const duration = interaction.options.getInteger('duration');
  const round = await launchRound(game, interaction, durationsOf(game, duration));
  await interaction.editReply(c('started', { number: round.number, link: engine.messageLink(round) }));
}

/** Lanza un error si quien ejecuta el comando no tiene el rol de pruebas. */
function requireTesterRole(interaction) {
  const roleId = config.testerRoleId;
  if (!roleId) throw new UserFacingError(t('common.envMissing', { name: 'PREVIEW_ROLE_ID' }));
  if (!interaction.member.roles.cache.has(roleId)) {
    throw new UserFacingError(t('common.testerRoleOnly', { roleId }));
  }
}

async function handleTest(game, interaction) {
  const minutes = interaction.options.getInteger('duration') ?? TEST_MINUTES;
  const round = await launchRound(game, interaction, { submitMinutes: minutes, voteMinutes: minutes });
  const bank = game.bankSize ? c('bankNote', { size: game.bankSize }) : '';
  await interaction.editReply(
    c('testStarted', { game: game.name, gameId: game.id, minutes, link: engine.messageLink(round), bank }),
  );
}

function requireActiveRound(game, interaction) {
  const round = engine.getActiveRound(game, interaction.guildId);
  if (!round) {
    throw new UserFacingError(c('noActiveRound', { game: game.name, gameId: game.id }));
  }
  engine.assertCanManage(round, interaction.member);
  return round;
}

async function handleNext(game, interaction) {
  const round = requireActiveRound(game, interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (round.phase === engine.PHASE.SUBMITTING) {
    const { outcome } = await engine.closeSubmissions(round);
    const text = get(`engine.command.nextOutcome.${outcome}`) ?? c('nextOutcome.done');
    await interaction.editReply(text);
    return;
  }

  await engine.finishRound(round);
  await interaction.editReply(c('nextOutcome.votingClosed'));
}

async function handleCancel(game, interaction) {
  const round = requireActiveRound(game, interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await engine.cancelRound(round, t('engine.cancelledBy', { user: `<@${interaction.user.id}>` }));
  await interaction.editReply(c('cancelled'));
}

async function handleSchedule(game, interaction) {
  const { roundsPerDay, activeHours, submitMinutes, voteMinutes } = config.games;
  if (!config.gameChannelId(game.id) || roundsPerDay <= 0) {
    throw new UserFacingError(c('scheduleDisabled', { game: game.name, gameId: game.id }));
  }

  const upcoming = scheduler.upcoming();
  const lines = upcoming.length
    ? upcoming.map(({ time, game: g }) => {
        const seconds = Math.floor(time / 1000);
        return c('scheduleLine', { time: `<t:${seconds}:t>`, relative: `<t:${seconds}:R>`, game: g.name });
      })
    : [c('scheduleNone')];

  const active = engine.getActiveRound(game, interaction.guildId);
  const summary =
    c('scheduleSummary', {
      lines: lines.join('\n'),
      roundsPerDay,
      start: activeHours.start,
      end: activeHours.end,
      submitMinutes,
      voteMinutes,
    }) + (active ? c('scheduleActive', { game: game.name, link: engine.messageLink(active) }) : '');

  await interaction.reply({ content: summary, flags: MessageFlags.Ephemeral });
}

module.exports = { createGameCommand, durationsOf };

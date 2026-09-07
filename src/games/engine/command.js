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
 * reservados al rol de pruebas y funcionan en cualquier canal.
 */
const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const config = require('../../config');
const engine = require('./roundEngine');
const messages = require('./messages');
const scheduler = require('../../services/gameScheduler');
const { UserFacingError } = require('../../utils/errors');

const TEST_MINUTES = 2;

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
        .setDescription('Empieza una ronda ahora mismo.')
        .addIntegerOption((opt) =>
          opt
            .setName('duration')
            .setDescription('Minutos para enviar y para votar (por defecto, los de la configuración)')
            .setMinValue(1)
            .setMaxValue(720),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('next').setDescription('Cierra la fase actual: pasa a votación o publica los resultados.'),
    )
    .addSubcommand((sub) => sub.setName('cancel').setDescription('Cancela la ronda en marcha sin repartir puntos.'))
    .addSubcommand((sub) => sub.setName('scores').setDescription('Muestra la clasificación.'))
    .addSubcommand((sub) => sub.setName('glossary').setDescription('Muestra las últimas respuestas ganadoras.'))
    .addSubcommand((sub) => sub.setName('schedule').setDescription('Muestra las rondas automáticas previstas para hoy.'))
    .addSubcommand((sub) =>
      sub.setName('tutorial').setDescription('Publica las instrucciones del juego en este canal (solo el rol de pruebas).'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('test')
        .setDescription('Ronda rápida de prueba en este canal (solo el rol de pruebas).')
        .addIntegerOption((opt) =>
          opt
            .setName('duration')
            .setDescription(`Minutos por fase (por defecto ${TEST_MINUTES})`)
            .setMinValue(1)
            .setMaxValue(60),
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
      throw new UserFacingError(`${game.name} solo funciona en <#${channelId}>.`);
    }

    switch (sub) {
      case 'start':
        return handleStart(game, interaction);
      case 'next':
        return handleNext(game, interaction);
      case 'cancel':
        return handleCancel(game, interaction);
      case 'scores':
        return interaction.reply(messages.scores('Clasificación', engine.getScores(interaction.guildId), game.color));
      case 'glossary':
        return interaction.reply(messages.glossary(game, engine.getGlossary(game, interaction.guildId)));
      case 'schedule':
        return handleSchedule(game, interaction);
      default:
        throw new UserFacingError('Subcomando desconocido.');
    }
  }

  return { data, execute };
}

function tutorialSettings(game) {
  const { points, answer } = engine.settingsOf(game);
  const { submitMinutes, voteMinutes } = durationsOf(game);
  return {
    channelId: config.gameChannelId(game.id),
    roundsPerDay: config.games.roundsPerDay,
    submitMinutes,
    voteMinutes,
    answerMax: answer.max,
    points,
  };
}

async function launchRound(game, interaction, durations) {
  if (!interaction.channel) throw new UserFacingError('No puedo ver este canal.');
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
  await interaction.editReply(`Ronda ${round.number} iniciada: ${engine.messageLink(round)}`);
}

/** Lanza un error si quien ejecuta el comando no tiene el rol de pruebas. */
function requireTesterRole(interaction) {
  const roleId = config.testerRoleId;
  if (!roleId) throw new UserFacingError('PREVIEW_ROLE_ID no está definido en el archivo .env.');
  if (!interaction.member.roles.cache.has(roleId)) {
    throw new UserFacingError(`Este comando solo está disponible para el rol <@&${roleId}>.`);
  }
}

async function handleTest(game, interaction) {
  const minutes = interaction.options.getInteger('duration') ?? TEST_MINUTES;
  const round = await launchRound(game, interaction, { submitMinutes: minutes, voteMinutes: minutes });
  const bank = game.bankSize ? ` · ${game.bankSize} consignas en el banco` : '';
  await interaction.editReply(
    `Ronda de prueba de ${game.name} iniciada (${minutes} min por fase): ${engine.messageLink(round)}${bank}\n` +
      `Usa \`/${game.id} next\` para adelantar fases o \`/${game.id} cancel\` para descartarla.`,
  );
}

function requireActiveRound(game, interaction) {
  const round = engine.getActiveRound(game, interaction.guildId);
  if (!round) {
    throw new UserFacingError(`No hay ninguna ronda de ${game.name} en marcha. Empieza una con \`/${game.id} start\`.`);
  }
  engine.assertCanManage(round, interaction.member);
  return round;
}

async function handleNext(game, interaction) {
  const round = requireActiveRound(game, interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (round.phase === engine.PHASE.SUBMITTING) {
    const { outcome } = await engine.closeSubmissions(round);
    const text = {
      voting: 'Envíos cerrados. La votación está abierta.',
      finished: 'Envíos cerrados. Resultados publicados.',
      cancelled: 'Nadie envió nada, la ronda queda cancelada.',
    }[outcome];
    await interaction.editReply(text ?? 'Hecho.');
    return;
  }

  await engine.finishRound(round);
  await interaction.editReply('Votación cerrada. Resultados publicados.');
}

async function handleCancel(game, interaction) {
  const round = requireActiveRound(game, interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await engine.cancelRound(round, `Ronda cancelada por <@${interaction.user.id}>.`);
  await interaction.editReply('Ronda cancelada.');
}

async function handleSchedule(game, interaction) {
  const { roundsPerDay, activeHours, submitMinutes, voteMinutes } = config.games;
  if (!config.gameChannelId(game.id) || roundsPerDay <= 0) {
    throw new UserFacingError(
      `Las rondas automáticas de ${game.name} están desactivadas (revisa ${game.id.toUpperCase()}_CHANNEL_ID y GAMES_ROUNDS_PER_DAY en .env).`,
    );
  }

  const upcoming = scheduler.upcoming();
  const lines = upcoming.length
    ? upcoming.map(({ time, game: g }) => `• <t:${Math.floor(time / 1000)}:t> (<t:${Math.floor(time / 1000)}:R>) · ${g.name}`)
    : ['• Ninguna más por hoy. Mañana se sortean de nuevo.'];

  const active = engine.getActiveRound(game, interaction.guildId);
  const summary =
    `**Rondas automáticas de hoy (todos los juegos)**\n${lines.join('\n')}\n\n` +
    `Configuración: ${roundsPerDay} ronda(s) al día en total, rotando entre juegos, entre las ${activeHours.start}:00 y las ${activeHours.end}:00, ` +
    `${submitMinutes} min para enviar y ${voteMinutes} min para votar.` +
    (active ? `\nRonda de ${game.name} en marcha: ${engine.messageLink(active)}` : '');

  await interaction.reply({ content: summary, flags: MessageFlags.Ephemeral });
}

module.exports = { createGameCommand, durationsOf };

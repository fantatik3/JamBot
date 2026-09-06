/**
 * /jerga start [duration]  -> empieza una ronda ahora (en el canal del juego)
 * /jerga next              -> cierra la fase actual (envíos -> votación -> resultados)
 * /jerga cancel            -> cancela la ronda activa sin repartir puntos
 * /jerga scores            -> clasificación
 * /jerga glossary          -> últimas explicaciones ganadoras
 * /jerga schedule          -> rondas automáticas de hoy
 * /jerga tutorial          -> publica las instrucciones para todo el mundo
 *
 * Si JERGA_CHANNEL_ID está definido, todos los subcomandos funcionan solo en ese canal.
 */
const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const config = require('../config');
const jerga = require('../services/jergaService');
const scheduler = require('../services/jergaScheduler');
const { UserFacingError } = require('../utils/errors');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jerga')
    .setDescription('Mata la jerga: explica términos de desarrollo sin usar las palabras prohibidas.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Empieza una ronda ahora mismo.')
        .addIntegerOption((opt) =>
          opt
            .setName('duration')
            .setDescription('Minutos para enviar explicaciones y para votar (por defecto, los de la configuración)')
            .setMinValue(1)
            .setMaxValue(720),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('next').setDescription('Cierra la fase actual: pasa a votación o publica los resultados.'),
    )
    .addSubcommand((sub) => sub.setName('cancel').setDescription('Cancela la ronda en marcha sin repartir puntos.'))
    .addSubcommand((sub) => sub.setName('scores').setDescription('Muestra la clasificación.'))
    .addSubcommand((sub) => sub.setName('glossary').setDescription('Muestra las últimas explicaciones ganadoras.'))
    .addSubcommand((sub) => sub.setName('schedule').setDescription('Muestra las rondas automáticas previstas para hoy.'))
    .addSubcommand((sub) => sub.setName('tutorial').setDescription('Publica las instrucciones del juego para todo el mundo.')),

  /** @param {import('discord.js').ChatInputCommandInteraction<'cached'>} interaction */
  async execute(interaction) {
    if (config.jergaChannelId && interaction.channelId !== config.jergaChannelId) {
      throw new UserFacingError(`Mata la jerga solo funciona en <#${config.jergaChannelId}>.`);
    }

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'start':
        return handleStart(interaction);
      case 'next':
        return handleNext(interaction);
      case 'cancel':
        return handleCancel(interaction);
      case 'scores':
        return interaction.reply(jerga.buildScoresMessage(interaction.guildId));
      case 'glossary':
        return interaction.reply(jerga.buildGlossaryMessage(interaction.guildId));
      case 'schedule':
        return handleSchedule(interaction);
      case 'tutorial':
        return interaction.reply(
          jerga.buildTutorialMessage({
            channelId: config.jergaChannelId,
            roundsPerDay: config.jergaRoundsPerDay,
            submitMinutes: config.jergaSubmitMinutes,
            voteMinutes: config.jergaVoteMinutes,
          }),
        );
      default:
        throw new UserFacingError('Subcomando desconocido.');
    }
  },
};

async function handleStart(interaction) {
  if (!interaction.channel) {
    throw new UserFacingError('No puedo ver este canal.');
  }

  const duration = interaction.options.getInteger('duration');
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const round = await jerga.startRound({
    guild: interaction.guild,
    channel: interaction.channel,
    hostId: interaction.user.id,
    submitMinutes: duration ?? config.jergaSubmitMinutes,
    voteMinutes: duration ?? config.jergaVoteMinutes,
  });
  await interaction.editReply(`Ronda ${round.number} iniciada: ${jerga.messageLink(round)}`);
}

function requireActiveRound(interaction) {
  const round = jerga.getActiveRound(interaction.guildId);
  if (!round) {
    throw new UserFacingError('No hay ninguna ronda en marcha. Empieza una con `/jerga start`.');
  }
  jerga.assertCanManage(round, interaction.member);
  return round;
}

async function handleNext(interaction) {
  const round = requireActiveRound(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (round.phase === jerga.PHASE.SUBMITTING) {
    const { outcome } = await jerga.openVoting(round);
    const text = {
      voting: 'Envíos cerrados. La votación está abierta.',
      finished: 'Solo había una explicación, así que gana directamente.',
      cancelled: 'Nadie envió nada, la ronda queda cancelada.',
    }[outcome];
    await interaction.editReply(text ?? 'Hecho.');
    return;
  }

  await jerga.finishRound(round);
  await interaction.editReply('Votación cerrada. Resultados publicados.');
}

async function handleCancel(interaction) {
  const round = requireActiveRound(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await jerga.cancelRound(round, `Ronda cancelada por <@${interaction.user.id}>.`);
  await interaction.editReply('Ronda cancelada.');
}

async function handleSchedule(interaction) {
  if (!config.jergaChannelId || config.jergaRoundsPerDay <= 0) {
    throw new UserFacingError('Las rondas automáticas están desactivadas (revisa JERGA_CHANNEL_ID y JERGA_ROUNDS_PER_DAY en .env).');
  }

  const { start, end } = config.jergaActiveHours;
  const times = scheduler.upcoming();
  const lines = times.length
    ? times.map((t) => `• <t:${Math.floor(t / 1000)}:t> (<t:${Math.floor(t / 1000)}:R>)`)
    : ['• Ninguna más por hoy. Mañana se sortean de nuevo.'];

  const active = jerga.getActiveRound(interaction.guildId);
  const summary =
    `**Rondas automáticas de hoy**\n${lines.join('\n')}\n\n` +
    `Configuración: ${config.jergaRoundsPerDay} ronda(s) al día entre las ${start}:00 y las ${end}:00, ` +
    `${config.jergaSubmitMinutes} min para enviar y ${config.jergaVoteMinutes} min para votar.` +
    (active ? `\nRonda en marcha: ${jerga.messageLink(active)}` : '');

  await interaction.reply({ content: summary, flags: MessageFlags.Ephemeral });
}

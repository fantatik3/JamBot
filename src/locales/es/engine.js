/**
 * Motor de rondas: textos comunes a todos los juegos (embeds, botones, avisos y subcomandos).
 * Cada juego puede sobrescribir cualquiera de las entradas de `strings` desde games/<id>.js.
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
  /**
   * Textos por defecto construidos a partir del sustantivo (femenino) que usa el juego para la respuesta.
   *   noun, nounPlural -> "explicación", "explicaciones"
   *   gameId           -> para citar /<juego> glossary
   *   choice           -> el juego se responde pulsando una letra
   *   judged           -> el juego decide quién gana sin votación
   */
  strings: ({ noun = 'respuesta', nounPlural, gameId, choice, judged }) => {
    const plural = nounPlural ?? `${noun}s`;
    return {
      noun,
      nounPlural: plural,
      submitButton: `Enviar ${noun}`,
      closeButton: choice || judged ? 'Cerrar y corregir' : 'Cerrar envíos y votar',
      finishButton: 'Terminar votación',
      receivedField: `${capitalize(plural)} recibidas`,
      roundFooter: choice
        ? 'Puedes cambiar tu respuesta hasta que se cierre la ronda.'
        : `Las ${plural} se muestran de forma anónima en la votación.`,
      modalLabel: `Tu ${noun}`,
      voteIntro: () => `Vota la ${noun} más clara. No puedes votar la tuya.`,
      luckLine: `Nadie votó, así que la suerte ha elegido la ${noun} ganadora:`,
      resultsFooter: `La ${noun} ganadora se guarda en el glosario (/${gameId} glossary).`,
      revealField: 'Solución',
      winnersField: 'Acertaron',
      nobodyRight: 'Nadie acertó esta vez.',
      glossaryEmpty: `El glosario está vacío. Las ${plural} ganadoras aparecerán aquí.`,
      submitReceived: `${capitalize(noun)} recibida. Se mostrará de forma anónima en la votación.`,
      submitUpdated: `${capitalize(noun)} actualizada.`,
      pickReceived: (letter) => `Respuesta registrada: ${letter}. Puedes cambiarla hasta que se cierre la ronda.`,
      pickChanged: (letter) => `Respuesta cambiada a ${letter}.`,
      voteReceived: (option) => `Voto registrado: opción ${option}.`,
      voteChanged: (option) => `Voto cambiado a la opción ${option}.`,
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
  },

  round: {
    title: ({ game, number }) => `${game} · Ronda ${number}`,
    submissionsField: 'Envíos',
    closed: 'Cerrados',
    closesAt: ({ when }) => `Se cierran ${when}`,
  },

  voting: {
    title: ({ game, label }) => `${game} · Votación · ${label}`,
    votesField: 'Votos',
    statusField: 'Votación',
    closed: 'Cerrada',
    closesAt: ({ when }) => `Se cierra ${when}`,
  },

  results: {
    title: ({ game, label }) => `${game} · Resultados · ${label}`,
    tieTitle: ({ game, label }) => `${game} · Empate · ${label}`,
    voteLine: ({ votes, user, text }) => `**${votes} voto(s)** · ${user}\n> ${text}`,
    plainLine: ({ user, text }) => `${user} · ${text}`,
    votesField: 'Votos',
    pointsField: 'Puntos',
    pointsValue: ({ win, participate }) => `Ganar +${win} · Participar +${participate}`,
  },

  scores: {
    title: 'Clasificación',
    line: ({ rank, user, points }) => `**${rank}.** ${user} · ${points} punto(s)`,
    empty: 'Todavía nadie tiene puntos.',
  },

  glossary: {
    title: ({ game }) => `${game} · Glosario`,
    byLine: ({ user, votes }) => ` · ${user} (${votes} voto(s))`,
  },

  tutorial: {
    title: ({ game }) => `${game} · Cómo se juega`,
    footer: ({ gameId }) =>
      `Con Gestionar mensajes se puede adelantar o cancelar una ronda con /${gameId} next y /${gameId} cancel.`,
    whereChannel: ({ channelId }) => `en <#${channelId}>`,
    whereHere: 'en este canal',
    cadenceAuto: ({ where }) => `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`,
    cadenceManual: ({ gameId, where }) => `Cualquiera puede abrir una ronda con \`/${gameId} start\` ${where}.`,
  },

  channelGone: 'El canal de la ronda ya no existe.',
  roundInProgress: ({ link }) => `Ya hay una ronda en marcha: ${link}`,
  cancelledDefault: 'Ronda cancelada.',
  cancelledBy: ({ user }) => `Ronda cancelada por ${user}.`,

  /** Subcomandos de /<juego> y sus respuestas. */
  command: {
    start: {
      description: 'Empieza una ronda ahora mismo.',
      duration: 'Minutos para enviar y para votar (por defecto, los de la configuración)',
    },
    next: 'Cierra la fase actual: pasa a votación o publica los resultados.',
    cancel: 'Cancela la ronda en marcha sin repartir puntos.',
    scores: 'Muestra la clasificación.',
    glossary: 'Muestra las últimas respuestas ganadoras.',
    schedule: 'Muestra las rondas automáticas previstas para hoy.',
    tutorial: 'Publica las instrucciones del juego en este canal (solo el rol de pruebas).',
    test: {
      description: 'Ronda rápida de prueba en este canal (solo el rol de pruebas).',
      duration: ({ minutes }) => `Minutos por fase (por defecto ${minutes})`,
    },
    wrongChannel: ({ game, channelId }) => `${game} solo funciona en <#${channelId}>.`,
    unknownSubcommand: 'Subcomando desconocido.',
    cannotSeeChannel: 'No puedo ver este canal.',
    started: ({ number, link }) => `Ronda ${number} iniciada: ${link}`,
    testStarted: ({ game, gameId, minutes, link, bank }) =>
      `Ronda de prueba de ${game} iniciada (${minutes} min por fase): ${link}${bank}\n` +
      `Usa \`/${gameId} next\` para adelantar fases o \`/${gameId} cancel\` para descartarla.`,
    bankNote: ({ size }) => ` · ${size} consignas en el banco`,
    noActiveRound: ({ game, gameId }) =>
      `No hay ninguna ronda de ${game} en marcha. Empieza una con \`/${gameId} start\`.`,
    nextOutcome: {
      voting: 'Envíos cerrados. La votación está abierta.',
      finished: 'Envíos cerrados. Resultados publicados.',
      cancelled: 'Nadie envió nada, la ronda queda cancelada.',
      done: 'Hecho.',
      votingClosed: 'Votación cerrada. Resultados publicados.',
    },
    cancelled: 'Ronda cancelada.',
    scheduleDisabled: ({ game, gameId }) =>
      `Las rondas automáticas de ${game} están desactivadas (revisa ${gameId.toUpperCase()}_CHANNEL_ID y GAMES_ROUNDS_PER_DAY en .env).`,
    scheduleLine: ({ time, relative, game }) => `• ${time} (${relative}) · ${game}`,
    scheduleNone: '• Ninguna más por hoy. Mañana se sortean de nuevo.',
    scheduleSummary: ({ lines, roundsPerDay, start, end, submitMinutes, voteMinutes }) =>
      `**Rondas automáticas de hoy (todos los juegos)**\n${lines}\n\n` +
      `Configuración: ${roundsPerDay} ronda(s) al día en total, rotando entre juegos, entre las ${start}:00 y las ${end}:00, ` +
      `${submitMinutes} min para enviar y ${voteMinutes} min para votar.`,
    scheduleActive: ({ game, link }) => `\nRonda de ${game} en marcha: ${link}`,
  },
};

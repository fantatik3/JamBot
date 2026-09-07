/** Triaje: textos propios del juego. */
module.exports = {
  name: 'Triaje',
  description: 'Triaje: ante alguien atascado, ¿qué tres preguntas harías primero para dar con el problema?',

  strings: {
    noun: 'lista',
    nounPlural: 'listas',
    submitButton: 'Enviar mis preguntas',
    modalLabel: 'Tus tres preguntas',
    receivedField: 'Listas de preguntas recibidas',
    roundFooter: 'Las preguntas se muestran de forma anónima en la votación.',
    voteIntro: () => 'Vota la lista que mejor acorrala el problema con menos preguntas. No puedes votar la tuya.',
    submitReceived: 'Preguntas recibidas. Se mostrarán de forma anónima en la votación.',
    submitUpdated: 'Preguntas actualizadas.',
    tooShort: 'Escribe al menos un par de preguntas.',
    tooLong: (max) => `Máximo ${max} caracteres. Tres preguntas cortas bastan.`,
    selfVote: 'No puedes votar tus propias preguntas.',
    cancelledEmpty: 'Nadie envió preguntas, así que la ronda queda cancelada.',
    glossaryEmpty: 'El glosario está vacío. Las listas de preguntas ganadoras aparecerán aquí.',
  },

  promptBody: ({ discipline, text }) =>
    `Alguien escribe en el canal de ayuda (**${discipline}**):\n\n` +
    `> ${text}\n\n` +
    'No des la solución. Escribe las **tres preguntas** que harías primero para localizar el problema.',
  modalTitle: ({ title }) => `Triaje: ${title}`,
  modalPlaceholder: '1) ¿...? 2) ¿...? 3) ¿...?',
  needQuestions: ({ min }) => `Escribe preguntas, no respuestas: necesito al menos ${min} signos de interrogación.`,

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'Un juego para entrenar lo primero que hace un buen mentor: preguntar bien antes de responder. ' +
      'Llega el mensaje de alguien atascado, vago y sin detalles, y tú decides qué tres preguntas harías primero.',
    fields: [
      {
        name: '1. Aparece un caso',
        value: `${cadence}\nCada ronda trae un mensaje tal como lo escribiría alguien en el canal de ayuda.`,
      },
      {
        name: '2. Haz triaje',
        value:
          'No des la solución. Pulsa **Enviar mis preguntas** y escribe las tres preguntas que harías primero ' +
          `para localizar el problema, en ${answerMax} caracteres como máximo. El bot exige al menos dos signos de interrogación. ` +
          `Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, las listas aparecen de forma anónima y en orden aleatorio. ' +
          'Vota la que mejor acorrala el problema con menos preguntas. No puedes votar la tuya y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
          'La lista ganadora se guarda en el glosario como chuleta de diagnóstico.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/triaje scores` clasificación · `/triaje glossary` listas ganadoras · `/triaje schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Pregunta por lo que se puede comprobar en un minuto: motor y versión, qué cambió desde que funcionaba, ' +
          'si pasa siempre o a veces, qué dice la consola. Una buena pregunta descarta la mitad de las causas.',
      },
    ],
  }),
};

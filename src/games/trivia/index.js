/**
 * Trivia por disciplina: una pregunta con cuatro opciones sobre programación, arte, audio,
 * diseño, narrativa o producción.
 *
 * Funciona en modo "choice": se responde pulsando una letra y gana quien acierta. Con los
 * resultados se revela la respuesta y una explicación corta, que va al glosario como chuleta.
 */
const questions = require('./questions');
const { pickRandom, shuffle } = require('../../utils/random');
const { truncate } = require('../../utils/text');

const LETTERS = ['A', 'B', 'C', 'D'];

module.exports = {
  id: 'trivia',
  name: 'Trivia por disciplina',
  description: 'Trivia por disciplina: una pregunta de programación, arte, audio, diseño, narrativa o producción.',
  color: 0x9b59b6,
  mode: 'choice',
  points: { win: 2, participate: 1 },
  maxSubmissions: 100,
  submitMinutes: 60,
  voteMinutes: 1,
  bankSize: questions.length,

  strings: {
    noun: 'respuesta',
    nounPlural: 'respuestas',
    revealField: 'Respuesta correcta',
    resultsFooter: 'La respuesta y su explicación se guardan en el glosario (/trivia glossary).',
    glossaryEmpty: 'El glosario está vacío. Las preguntas ya respondidas aparecerán aquí.',
    cancelledEmpty: 'Nadie respondió, así que la ronda queda cancelada.',
  },

  /** Elige una pregunta evitando las recientes y mezcla el orden de las opciones. */
  pickPrompt(recentKeys) {
    const fresh = questions.filter((entry) => !recentKeys.includes(entry.key));
    const chosen = pickRandom(fresh.length > 0 ? fresh : questions);
    const options = shuffle([chosen.answer, ...chosen.wrong]);
    return {
      key: chosen.key,
      discipline: chosen.discipline,
      question: chosen.question,
      options,
      correct: options.indexOf(chosen.answer),
      explanation: chosen.explanation,
    };
  },

  promptLabel: (prompt) => truncate(prompt.question, 70),

  promptBody(prompt) {
    const options = prompt.options.map((text, index) => `**${LETTERS[index]})** ${text}`).join('\n');
    return `**${prompt.discipline}**\n\n${prompt.question}\n\n${options}\n\nPulsa la letra que creas correcta.`;
  },

  modalTitle: (prompt) => truncate(prompt.question, 45),

  revealText: (prompt) => `**${LETTERS[prompt.correct]}) ${prompt.options[prompt.correct]}**\n${prompt.explanation}`,

  resultsSummary: (tally, winners) => `Acertaron ${winners.length} de ${tally.length}.`,

  glossaryAnswer: (prompt) => `${LETTERS[prompt.correct]}) ${prompt.options[prompt.correct]}. ${prompt.explanation}`,

  tutorial({ channelId, roundsPerDay, submitMinutes, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/trivia start\` ${where}.`;

    return {
      description:
        'Preguntas cortas de todas las disciplinas de la jam. La gracia está en las que no son la tuya: ' +
        'quien programa aprende algo de audio y quien dibuja algo de diseño.',
      fields: [
        {
          name: '1. Aparece una pregunta',
          value: `${cadence}\nCada ronda trae una pregunta de programación, arte, audio, diseño, narrativa o producción con cuatro opciones.`,
        },
        {
          name: '2. Responde',
          value:
            'Pulsa la letra que creas correcta. Nadie ve tu respuesta y puedes cambiarla hasta que se cierre la ronda. ' +
            `Hay ${submitMinutes} minutos para responder.`,
        },
        {
          name: '3. Resultados',
          value:
            'No hay votación. Al cerrar, se revela la respuesta correcta con una explicación corta y se dice quién ha acertado. ' +
            'La respuesta y su explicación se guardan en el glosario.',
        },
        {
          name: 'Puntos y comandos',
          value:
            `Acertar: **+${points.win}** · Participar: **+${points.participate}**\n` +
            '`/trivia scores` clasificación · `/trivia glossary` respuestas pasadas · `/trivia schedule` rondas de hoy',
        },
        {
          name: 'Consejos',
          value:
            'Si dudas, descarta primero las opciones que suenan bien pero no dicen nada. Y si fallas, lee la explicación: ' +
            'esa es la parte que se queda.',
        },
      ],
    };
  },
};

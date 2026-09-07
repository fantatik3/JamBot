/** Trivia por disciplina: textos propios del juego. */
module.exports = {
  name: 'Trivia por disciplina',
  description: 'Trivia por disciplina: una pregunta de programación, arte, audio, diseño, narrativa o producción.',

  strings: {
    noun: 'respuesta',
    nounPlural: 'respuestas',
    revealField: 'Respuesta correcta',
    resultsFooter: 'La respuesta y su explicación se guardan en el glosario (/trivia glossary).',
    glossaryEmpty: 'El glosario está vacío. Las preguntas ya respondidas aparecerán aquí.',
    cancelledEmpty: 'Nadie respondió, así que la ronda queda cancelada.',
  },

  promptBody: ({ discipline, question, options }) =>
    `**${discipline}**\n\n${question}\n\n${options}\n\nPulsa la letra que creas correcta.`,
  results: ({ right, total }) => `Acertaron ${right} de ${total}.`,

  tutorial: ({ cadence, submitMinutes, points }) => ({
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
  }),
};

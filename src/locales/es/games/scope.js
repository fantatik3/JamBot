/** Scope it: textos propios del juego. */
module.exports = {
  name: 'Scope it',
  description: 'Scope it: estima las horas que lleva una tarea en una jam. Gana quien más se acerque a la mediana.',

  strings: {
    noun: 'estimación',
    nounPlural: 'estimaciones',
    modalLabel: 'Horas que estimas',
    roundFooter: 'Las estimaciones se revelan todas a la vez al cerrar la ronda.',
    submitReceived: 'Estimación recibida. Se revela al cerrar la ronda.',
    submitUpdated: 'Estimación actualizada.',
    tooShort: 'Escribe un número de horas, por ejemplo 6 o 2.5.',
    tooLong: () => 'Escribe solo el número de horas, por ejemplo 6 o 2.5.',
    resultsFooter: 'La estimación ganadora y la mediana se guardan en el glosario (/scope glossary).',
    glossaryEmpty: 'El glosario está vacío. Las estimaciones ganadoras aparecerán aquí.',
  },

  promptBody: ({ text }) =>
    'Estima cuántas horas de trabajo lleva esto en una jam, con un equipo pequeño y arte provisional:\n\n' +
    `> ${text}\n\n` +
    'Escribe solo el número de horas (por ejemplo 6 o 2.5). Gana quien más se acerque a la mediana del grupo.',
  modalTitle: ({ title }) => `Scope it: ${title}`,
  modalPlaceholder: '6',
  badHours: ({ min, max }) => `Escribe solo un número de horas entre ${min} y ${max}, por ejemplo 6 o 2.5.`,
  results: ({ median, list }) => `Mediana del grupo: **${median} h** · Estimaciones: ${list} h`,
  glossaryAnswer: ({ text, median }) => `${text} (mediana del grupo: ${median} h)`,

  tutorial: ({ cadence, submitMinutes, points }) => ({
    description:
      'Un juego para afinar el ojo con el alcance, que es lo que más jams hunde. Se describe una tarea y ' +
      'cada cual dice cuántas horas cree que lleva. No hay respuesta correcta: gana quien más se acerque a lo que opina el grupo.',
    fields: [
      {
        name: '1. Aparece una tarea',
        value: `${cadence}\nCada ronda describe una tarea típica de jam: un menú, un jefe, una build para web...`,
      },
      {
        name: '2. Estima',
        value:
          'Pulsa **Enviar estimación** y escribe solo el número de horas de trabajo, por ejemplo 6 o 2.5, ' +
          `pensando en un equipo pequeño y arte provisional. Puedes cambiarla hasta que se cierre. Hay ${submitMinutes} minutos.`,
      },
      {
        name: '3. Resultados',
        value:
          'No hay votación. Al cerrar, se revelan todas las estimaciones y la mediana del grupo, y gana quien más ' +
          'se acerque a ella (los empates se reparten). La ganadora se guarda en el glosario con la mediana.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Acertar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/scope scores` clasificación · `/scope glossary` estimaciones pasadas · `/scope schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Cuenta también probar, arreglar y pulir, no solo programar. Si dudas entre dos números, el mayor suele ' +
          'acertar más. Y compara con la última vez que hiciste algo parecido.',
      },
    ],
  }),
};

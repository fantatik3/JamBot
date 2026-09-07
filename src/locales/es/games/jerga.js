/** Mata la jerga: textos propios del juego. */
module.exports = {
  name: 'Mata la jerga',
  description: 'Mata la jerga: explica términos de desarrollo sin usar las palabras prohibidas.',

  /** Sobrescribe entradas de engine.strings. `voteIntro(prompt)` y `tooLong(max)` reciben los mismos datos que allí. */
  strings: {
    noun: 'explicación',
    nounPlural: 'explicaciones',
    voteIntro: (prompt) => `Vota la explicación más clara de **${prompt.term}**. No puedes votar la tuya.`,
    tooLong: (max) => `Máximo ${max} caracteres. La gracia es explicarlo corto.`,
  },

  promptBody: ({ term, banned }) =>
    `Explica **${term}** para alguien que empieza en la jam.\n\n` +
    `Palabras prohibidas: ${banned}\n` +
    '(El propio término tampoco vale.)',
  modalTitle: ({ term }) => `Explica: ${term}`,
  modalPlaceholder: ({ banned }) => `Sin usar: ${banned}`,
  forbiddenWords: ({ list }) => `Tu explicación usa palabras prohibidas: ${list}. Inténtalo de nuevo.`,

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'Un juego para entrenar lo que mejor hacemos aquí: explicar cosas de desarrollo de videojuegos ' +
      'sin jerga, como se lo contarías a alguien en su primera jam.',
    fields: [
      {
        name: '1. Aparece un término',
        value: `${cadence}\nCada ronda trae un término (por ejemplo **Raycast**) y cinco palabras prohibidas.`,
      },
      {
        name: '2. Explícalo',
        value:
          `Pulsa **Enviar explicación** y escríbela en ${answerMax} caracteres como máximo, ` +
          'sin usar el término ni las palabras prohibidas. El bot lo comprueba ignorando mayúsculas, acentos y plurales. ' +
          `Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, las explicaciones aparecen de forma anónima y en orden aleatorio. ' +
          'Vota la más clara con los botones numerados. No puedes votar la tuya y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
          'La explicación ganadora se guarda en el glosario del servidor.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/jerga scores` clasificación · `/jerga glossary` explicaciones ganadoras · `/jerga schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Compara con algo cotidiano. Ve al grano: corto y concreto gana más que largo y perfecto. ' +
          'Si te sale una palabra prohibida, suele haber una forma más sencilla de decirlo.',
      },
    ],
  }),
};

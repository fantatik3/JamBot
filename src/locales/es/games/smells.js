/** Huele mal: textos propios del juego. */
module.exports = {
  name: 'Huele mal',
  description: 'Huele mal: el código funciona, pero está mal escrito. Di qué cambiarías y por qué.',

  strings: {
    noun: 'sugerencia',
    nounPlural: 'sugerencias',
    submitButton: 'Enviar sugerencia',
    modalLabel: 'Qué cambiarías y por qué',
    receivedField: 'Sugerencias recibidas',
    roundFooter: 'Las sugerencias se muestran de forma anónima en la votación.',
    voteIntro: () => 'Vota la sugerencia que más mejora el código sin cambiar lo que hace. No puedes votar la tuya.',
    luckLine: 'Nadie votó, así que la suerte ha elegido la sugerencia ganadora:',
    resultsFooter: 'La sugerencia ganadora se guarda en el glosario (/smells glossary).',
    revealField: 'Qué cambiaría',
    submitReceived: 'Sugerencia recibida. Se mostrará de forma anónima en la votación.',
    submitUpdated: 'Sugerencia actualizada.',
    tooShort: 'Escribe una sugerencia un poco más larga.',
    tooLong: (max) => `Máximo ${max} caracteres. Qué cambiarías y por qué, sin novela.`,
    maxSubmissions: (max) => `Esta ronda ya tiene el máximo de ${max} sugerencias.`,
    selfVote: 'No puedes votar tu propia sugerencia.',
    cancelledEmpty: 'Nadie envió una sugerencia, así que la ronda queda cancelada.',
    glossaryEmpty: 'El glosario está vacío. Las sugerencias ganadoras aparecerán aquí.',
  },

  promptBody: ({ language, fence, code }) =>
    `**${language}**\n` + '```' + fence + '\n' + code + '\n```\n' + 'Funciona y no tiene ningún bug, pero huele mal. Di qué cambiarías y por qué.',
  modalTitle: ({ title }) => `Huele mal: ${title}`,
  modalPlaceholder: 'Qué cambiarías y por qué',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'Un juego para entrenar la parte de la revisión de código que no va de bugs: el fragmento funciona, pero algo ' +
      'en cómo está escrito va a dar problemas en cuanto el proyecto crezca o alguien más lo toque. Hay que decir qué cambiarías y por qué.',
    fields: [
      {
        name: '1. Aparece un fragmento',
        value: `${cadence}\nCada ronda muestra unas pocas líneas de C#, GDScript, JavaScript, C++, un shader o Python que funcionan pero huelen mal.`,
      },
      {
        name: '2. Sugiere',
        value:
          `Pulsa **Enviar sugerencia** y di qué cambiarías y por qué, en ${answerMax} caracteres como máximo. ` +
          `No hace falta reescribir el código. Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, las sugerencias aparecen de forma anónima y en orden aleatorio. ' +
          'Vota la que más mejora el código sin cambiar lo que hace. No puedes votar la tuya y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
          'Con los resultados se muestra qué cambiaría el bot, y la sugerencia ganadora va al glosario.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/smells scores` clasificación · `/smells glossary` sugerencias ganadoras · `/smells schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Pregúntate qué pasará cuando el proyecto tenga el doble de código o cuando otra persona lo lea. Los sospechosos ' +
          'habituales: números sueltos, cadenas como estados, funciones que hacen de todo, copiar y pegar, y buscar cosas cada frame.',
      },
    ],
  }),
};

/** Caza el bug: textos propios del juego. */
module.exports = {
  name: 'Caza el bug',
  description: 'Caza el bug: hay un fallo escondido en el código. Di qué falla y por qué.',

  strings: {
    noun: 'diagnóstico',
    nounPlural: 'diagnósticos',
    submitButton: 'Enviar diagnóstico',
    modalLabel: 'Qué falla y por qué',
    receivedField: 'Diagnósticos recibidos',
    roundFooter: 'Los diagnósticos se muestran de forma anónima en la votación.',
    voteIntro: () => 'Vota el diagnóstico más certero: qué falla y por qué. No puedes votar el tuyo.',
    luckLine: 'Nadie votó, así que la suerte ha elegido el diagnóstico ganador:',
    resultsFooter: 'El diagnóstico ganador se guarda en el glosario (/bugs glossary).',
    submitReceived: 'Diagnóstico recibido. Se mostrará de forma anónima en la votación.',
    submitUpdated: 'Diagnóstico actualizado.',
    tooShort: 'Escribe un diagnóstico un poco más largo.',
    tooLong: (max) => `Máximo ${max} caracteres. Qué falla y por qué, sin novela.`,
    maxSubmissions: (max) => `Esta ronda ya tiene el máximo de ${max} diagnósticos.`,
    selfVote: 'No puedes votar tu propio diagnóstico.',
    cancelledEmpty: 'Nadie envió un diagnóstico, así que la ronda queda cancelada.',
    glossaryEmpty: 'El glosario está vacío. Los diagnósticos ganadores aparecerán aquí.',
  },

  promptBody: ({ language, fence, code }) =>
    `**${language}**\n` + '```' + fence + '\n' + code + '\n```\n' + 'Algo falla. Explica qué y por qué, en pocas palabras.',
  modalTitle: ({ title }) => `Caza el bug: ${title}`,
  modalPlaceholder: 'Qué falla y por qué',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'Un juego para entrenar el ojo de revisar código ajeno, que es lo que hacemos cuando alguien pega un ' +
      'fragmento en el canal de ayuda. Hay un fallo escondido y hay que encontrarlo.',
    fields: [
      {
        name: '1. Aparece un fragmento',
        value: `${cadence}\nCada ronda muestra unas pocas líneas de C#, GDScript, JavaScript, C++, un shader o Python con un fallo.`,
      },
      {
        name: '2. Diagnostica',
        value:
          `Pulsa **Enviar diagnóstico** y explica qué falla y por qué, en ${answerMax} caracteres como máximo. ` +
          `No hace falta pegar código corregido. Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, los diagnósticos aparecen de forma anónima y en orden aleatorio. ' +
          'Vota el más certero. No puedes votar el tuyo y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana el más votado (los empates se reparten). Si nadie vota, la suerte elige uno. ' +
          'Con los resultados se revela la solución, y el diagnóstico ganador va al glosario.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/bugs scores` clasificación · `/bugs glossary` diagnósticos ganadores · `/bugs schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Lee el fragmento como si fueras el ordenador, línea a línea. Los sospechosos habituales: comparar ' +
          'floats, olvidar delta, índices que se pasan uno, cosas que se llaman cada fotograma y no deberían.',
      },
    ],
  }),
};

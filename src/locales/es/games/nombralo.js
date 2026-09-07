/** Nómbralo: textos propios del juego. */
module.exports = {
  name: 'Nómbralo',
  description: 'Nómbralo: propón el nombre más claro para una variable, función, clase o asset.',

  strings: {
    noun: 'propuesta',
    nounPlural: 'propuestas',
    modalLabel: 'Tu nombre para esto',
    voteIntro: () => 'Vota el nombre que entenderías al primer vistazo, sin abrir el archivo. No puedes votar el tuyo.',
    tooShort: 'Un nombre necesita al menos dos caracteres.',
    tooLong: (max) => `Máximo ${max} caracteres. Un nombre largo es un nombre malo.`,
  },

  promptBody: ({ kind, what, context }) =>
    `Necesitas un nombre para **${kind}**: ${what}.${context ? `\n\nContexto: ${context}` : ''}\n\n` +
    'Escribe solo el nombre, tal como iría en el proyecto (camelCase, PascalCase o snake_case, lo que uses).',
  modalTitle: ({ kind }) => `Nómbralo: ${kind}`,
  modalPlaceholder: 'porEjemploAsi',
  noSpaces: 'Un nombre no lleva espacios: usa camelCase, PascalCase o snake_case.',
  badChars: 'Usa solo letras, números, guiones bajos o puntos.',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'Un juego rápido sobre lo que más se repite en cualquier revisión de código: poner nombres que se ' +
      'entiendan sin explicación. Se describe algo y tú propones cómo lo llamarías.',
    fields: [
      {
        name: '1. Aparece algo sin nombre',
        value: `${cadence}\nCada ronda describe una variable, función, clase, escena o asset y para qué sirve.`,
      },
      {
        name: '2. Nómbralo',
        value:
          `Pulsa **Enviar propuesta** y escribe solo el nombre, de ${answerMax} caracteres como máximo, sin espacios, ` +
          `tal como iría en el proyecto. Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
      },
      {
        name: '3. Vota',
        value:
          'Al cerrarse los envíos, las propuestas aparecen de forma anónima y en orden aleatorio. ' +
          'Vota la que entenderías al primer vistazo. No puedes votar la tuya y puedes cambiar el voto. ' +
          `La votación dura ${voteMinutes} minutos.`,
      },
      {
        name: '4. Resultados',
        value:
          'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
          'La propuesta ganadora se guarda en el glosario como referencia de estilo.',
      },
      {
        name: 'Puntos y comandos',
        value:
          `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
          '`/nombralo scores` clasificación · `/nombralo glossary` nombres ganadores · `/nombralo schedule` rondas de hoy',
      },
      {
        name: 'Consejos',
        value:
          'Di qué es, no cómo se calcula. Los booleanos preguntan (puedeSaltar, estaEnSuelo). Las funciones ' +
          'empiezan por un verbo. Evita abreviaturas que solo entiendas tú.',
      },
    ],
  }),
};

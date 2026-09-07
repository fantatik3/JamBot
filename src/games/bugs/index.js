/**
 * Caza el bug: hay un fallo escondido en un fragmento de código y hay que decir qué falla y por qué.
 *
 * Cada ronda muestra un fragmento de snippets.js. Se vota el diagnóstico más certero y, con los
 * resultados, se revela la solución. El motor de rondas (games/engine) se ocupa del resto.
 */
const snippets = require('./snippets');
const { pickRandom } = require('../../utils/random');

module.exports = {
  id: 'bugs',
  name: 'Caza el bug',
  description: 'Caza el bug: hay un fallo escondido en el código. Di qué falla y por qué.',
  color: 0xe74c3c,
  answer: { min: 10, max: 280 },
  submitMinutes: 90,
  voteMinutes: 45,
  bankSize: snippets.length,

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

  /** Elige un fragmento evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = snippets.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : snippets) };
  },

  promptLabel: (prompt) => prompt.title,

  promptBody(prompt) {
    return (
      `**${prompt.language}**\n` +
      '```' + prompt.fence + '\n' + prompt.code + '\n```\n' +
      'Algo falla. Explica qué y por qué, en pocas palabras.'
    );
  },

  modalTitle: (prompt) => `Caza el bug: ${prompt.title}`,
  modalPlaceholder: () => 'Qué falla y por qué',

  revealText: (prompt) => prompt.solution,

  tutorial({ channelId, roundsPerDay, submitMinutes, voteMinutes, answerMax, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/bugs start\` ${where}.`;

    return {
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
    };
  },
};

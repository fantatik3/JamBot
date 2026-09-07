/**
 * Triaje: ante el mensaje de alguien atascado, ¿qué tres preguntas harías primero?
 *
 * No se busca la solución sino las preguntas que mejor acorralan el problema. Cada ronda
 * plantea un caso de scenarios.js; el motor de rondas (games/engine) se ocupa del resto.
 */
const scenarios = require('./scenarios');
const { pickRandom } = require('../../utils/random');

const MIN_QUESTION_MARKS = 2;

module.exports = {
  id: 'triaje',
  name: 'Triaje',
  description: 'Triaje: ante alguien atascado, ¿qué tres preguntas harías primero para dar con el problema?',
  color: 0xf39c12,
  answer: { min: 20, max: 300 },
  maxSubmissions: 12,
  bankSize: scenarios.length,

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

  /** Elige un caso evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = scenarios.filter((entry) => !recentKeys.includes(entry.key));
    const chosen = pickRandom(fresh.length > 0 ? fresh : scenarios);
    return { ...chosen };
  },

  promptLabel: (prompt) => prompt.title,

  promptBody(prompt) {
    return (
      `Alguien escribe en el canal de ayuda (**${prompt.discipline}**):\n\n` +
      `> ${prompt.text}\n\n` +
      'No des la solución. Escribe las **tres preguntas** que harías primero para localizar el problema.'
    );
  },

  modalTitle: (prompt) => `Triaje: ${prompt.title}`,
  modalPlaceholder: () => '1) ¿...? 2) ¿...? 3) ¿...?',

  /** Devuelve un mensaje de error si el texto no parece una lista de preguntas. */
  validateAnswer(prompt, text) {
    const marks = (text.match(/\?/g) ?? []).length;
    if (marks >= MIN_QUESTION_MARKS) return null;
    return `Escribe preguntas, no respuestas: necesito al menos ${MIN_QUESTION_MARKS} signos de interrogación.`;
  },

  tutorial({ channelId, roundsPerDay, submitMinutes, voteMinutes, answerMax, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/triaje start\` ${where}.`;

    return {
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
    };
  },
};

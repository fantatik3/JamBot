/**
 * Mata la jerga: explica un término de desarrollo de videojuegos sin usar las palabras prohibidas.
 *
 * Cada ronda plantea un término de terms.js con cinco palabras prohibidas. El motor de rondas
 * (games/engine) se ocupa de envíos, votación, puntos y glosario; aquí solo va lo propio del juego.
 */
const terms = require('./terms');
const { pickRandom } = require('../../utils/random');
const { findForbiddenWords } = require('../../utils/text');

function termWords(term) {
  return term.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1);
}

module.exports = {
  id: 'jerga',
  name: 'Mata la jerga',
  description: 'Mata la jerga: explica términos de desarrollo sin usar las palabras prohibidas.',
  color: 0xeb459e,
  answer: { min: 10, max: 280 },
  bankSize: terms.length,

  strings: {
    noun: 'explicación',
    nounPlural: 'explicaciones',
    voteIntro: (prompt) => `Vota la explicación más clara de **${prompt.term}**. No puedes votar la tuya.`,
    tooLong: (max) => `Máximo ${max} caracteres. La gracia es explicarlo corto.`,
  },

  /** Elige un término evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = terms.filter((entry) => !recentKeys.includes(entry.term));
    const chosen = pickRandom(fresh.length > 0 ? fresh : terms);
    return { key: chosen.term, term: chosen.term, banned: chosen.banned };
  },

  promptLabel: (prompt) => prompt.term,

  promptBody(prompt) {
    const banned = prompt.banned.map((word) => `~~${word}~~`).join('   ');
    return (
      `Explica **${prompt.term}** para alguien que empieza en la jam.\n\n` +
      `Palabras prohibidas: ${banned}\n` +
      '(El propio término tampoco vale.)'
    );
  },

  modalTitle: (prompt) => `Explica: ${prompt.term}`,
  modalPlaceholder: (prompt) => `Sin usar: ${prompt.banned.join(', ')}`,

  /** Devuelve un mensaje de error si la explicación usa el término o una palabra prohibida. */
  validateAnswer(prompt, text) {
    const forbidden = findForbiddenWords(text, [...termWords(prompt.term), ...prompt.banned]);
    if (forbidden.length === 0) return null;
    const list = forbidden.map((word) => `**${word}**`).join(', ');
    return `Tu explicación usa palabras prohibidas: ${list}. Inténtalo de nuevo.`;
  },

  tutorial({ channelId, roundsPerDay, submitMinutes, voteMinutes, answerMax, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/jerga start\` ${where}.`;

    return {
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
    };
  },
};

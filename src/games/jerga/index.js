/**
 * Mata la jerga: explica un término de desarrollo de videojuegos sin usar las palabras prohibidas.
 *
 * Cada ronda plantea un término de terms.js con cinco palabras prohibidas. El motor de rondas
 * (games/engine) se ocupa de envíos, votación, puntos y glosario; aquí solo va la lógica propia
 * del juego. Sus textos viven en src/locales/<idioma>/games/jerga.js.
 */
const terms = require('./terms');
const { pickRandom } = require('../../utils/random');
const { findForbiddenWords } = require('../../utils/text');
const { t } = require('../../i18n');

const ID = 'jerga';
const L = (key, params) => t(`games.${ID}.${key}`, params);

function termWords(term) {
  return term.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1);
}

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0xeb459e,
  answer: { min: 10, max: 280 },
  bankSize: terms.length,

  /** Elige un término evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = terms.filter((entry) => !recentKeys.includes(entry.term));
    const chosen = pickRandom(fresh.length > 0 ? fresh : terms);
    return { key: chosen.term, term: chosen.term, banned: chosen.banned };
  },

  promptLabel: (prompt) => prompt.term,

  promptBody: (prompt) =>
    L('promptBody', { term: prompt.term, banned: prompt.banned.map((word) => `~~${word}~~`).join('   ') }),

  modalTitle: (prompt) => L('modalTitle', { term: prompt.term }),
  modalPlaceholder: (prompt) => L('modalPlaceholder', { banned: prompt.banned.join(', ') }),

  /** Devuelve un mensaje de error si la explicación usa el término o una palabra prohibida. */
  validateAnswer(prompt, answer) {
    const forbidden = findForbiddenWords(answer, [...termWords(prompt.term), ...prompt.banned]);
    if (forbidden.length === 0) return null;
    return L('forbiddenWords', { list: forbidden.map((word) => `**${word}**`).join(', ') });
  },
};

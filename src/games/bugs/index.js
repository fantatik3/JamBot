/**
 * Caza el bug: hay un fallo escondido en un fragmento de código y hay que decir qué falla y por qué.
 *
 * Cada ronda muestra un fragmento de snippets.js. Se vota el diagnóstico más certero y, con los
 * resultados, se revela la solución. El motor de rondas (games/engine) se ocupa del resto.
 * Sus textos viven en src/locales/<idioma>/games/bugs.js.
 */
const snippets = require('./snippets');
const { pickRandom } = require('../../utils/random');
const { t } = require('../../i18n');

const ID = 'bugs';
const L = (key, params) => t(`games.${ID}.${key}`, params);

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0xe74c3c,
  answer: { min: 10, max: 280 },
  submitMinutes: 90,
  voteMinutes: 45,
  bankSize: snippets.length,

  /** Elige un fragmento evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = snippets.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : snippets) };
  },

  promptLabel: (prompt) => prompt.title,
  promptBody: (prompt) => L('promptBody', { language: prompt.language, fence: prompt.fence, code: prompt.code }),
  modalTitle: (prompt) => L('modalTitle', { title: prompt.title }),
  modalPlaceholder: () => L('modalPlaceholder'),

  revealText: (prompt) => prompt.solution,
};

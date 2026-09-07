/**
 * Nómbralo: propón el nombre más claro para una variable, función, clase o asset.
 *
 * Cada ronda describe algo que necesita nombre (items.js) y se vota la propuesta que se
 * entiende al primer vistazo. El motor de rondas (games/engine) se ocupa del resto.
 * Sus textos viven en src/locales/<idioma>/games/nombralo.js.
 */
const items = require('./items');
const { pickRandom } = require('../../utils/random');
const { truncate } = require('../../utils/text');
const { t } = require('../../i18n');

const ID = 'nombralo';
const L = (key, params) => t(`games.${ID}.${key}`, params);

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0x3498db,
  answer: { min: 2, max: 40 },
  maxSubmissions: 15,
  submitMinutes: 60,
  voteMinutes: 30,
  bankSize: items.length,

  /** Elige un caso evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = items.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : items) };
  },

  promptLabel: (prompt) => `${prompt.kind}: ${truncate(prompt.what, 60)}`,
  promptBody: (prompt) => L('promptBody', { kind: prompt.kind, what: prompt.what, context: prompt.context ?? '' }),
  modalTitle: (prompt) => L('modalTitle', { kind: prompt.kind }),
  modalPlaceholder: () => L('modalPlaceholder'),

  /** Devuelve un mensaje de error si el texto no tiene pinta de nombre. */
  validateAnswer(prompt, answer) {
    if (/\s/.test(answer)) return L('noSpaces');
    if (!/^[\p{L}\p{N}_$.-]+$/u.test(answer)) return L('badChars');
    return null;
  },
};

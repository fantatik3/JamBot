/**
 * Triaje: ante el mensaje de alguien atascado, ¿qué tres preguntas harías primero?
 *
 * No se busca la solución sino las preguntas que mejor acorralan el problema. Cada ronda
 * plantea un caso de scenarios.js; el motor de rondas (games/engine) se ocupa del resto.
 * Sus textos viven en src/locales/<idioma>/games/triaje.js.
 */
const scenarios = require('./scenarios');
const { pickRandom } = require('../../utils/random');
const { t } = require('../../i18n');

const ID = 'triaje';
const L = (key, params) => t(`games.${ID}.${key}`, params);
const MIN_QUESTION_MARKS = 2;

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0xf39c12,
  answer: { min: 20, max: 300 },
  maxSubmissions: 12,
  bankSize: scenarios.length,

  /** Elige un caso evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = scenarios.filter((entry) => !recentKeys.includes(entry.key));
    const chosen = pickRandom(fresh.length > 0 ? fresh : scenarios);
    return { ...chosen };
  },

  promptLabel: (prompt) => prompt.title,
  promptBody: (prompt) => L('promptBody', { discipline: prompt.discipline, text: prompt.text }),
  modalTitle: (prompt) => L('modalTitle', { title: prompt.title }),
  modalPlaceholder: () => L('modalPlaceholder'),

  /** Devuelve un mensaje de error si el texto no parece una lista de preguntas. */
  validateAnswer(prompt, answer) {
    const marks = (answer.match(/\?/g) ?? []).length;
    if (marks >= MIN_QUESTION_MARKS) return null;
    return L('needQuestions', { min: MIN_QUESTION_MARKS });
  },
};

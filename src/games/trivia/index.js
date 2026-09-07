/**
 * Trivia por disciplina: una pregunta con cuatro opciones sobre programación, arte, audio,
 * diseño, narrativa o producción.
 *
 * Funciona en modo "choice": se responde pulsando una letra y gana quien acierta. Con los
 * resultados se revela la respuesta y una explicación corta, que va al glosario como chuleta.
 * Sus textos viven en src/locales/<idioma>/games/trivia.js.
 */
const questions = require('./questions');
const { pickRandom, shuffle } = require('../../utils/random');
const { truncate } = require('../../utils/text');
const { t } = require('../../i18n');

const ID = 'trivia';
const L = (key, params) => t(`games.${ID}.${key}`, params);
const LETTERS = ['A', 'B', 'C', 'D'];

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0x9b59b6,
  mode: 'choice',
  points: { win: 2, participate: 1 },
  maxSubmissions: 100,
  submitMinutes: 60,
  voteMinutes: 1,
  bankSize: questions.length,

  /** Elige una pregunta evitando las recientes y mezcla el orden de las opciones. */
  pickPrompt(recentKeys) {
    const fresh = questions.filter((entry) => !recentKeys.includes(entry.key));
    const chosen = pickRandom(fresh.length > 0 ? fresh : questions);
    const options = shuffle([chosen.answer, ...chosen.wrong]);
    return {
      key: chosen.key,
      discipline: chosen.discipline,
      question: chosen.question,
      options,
      correct: options.indexOf(chosen.answer),
      explanation: chosen.explanation,
    };
  },

  promptLabel: (prompt) => truncate(prompt.question, 70),

  promptBody: (prompt) =>
    L('promptBody', {
      discipline: prompt.discipline,
      question: prompt.question,
      options: prompt.options.map((text, index) => `**${LETTERS[index]})** ${text}`).join('\n'),
    }),

  modalTitle: (prompt) => truncate(prompt.question, 45),

  revealText: (prompt) => `**${LETTERS[prompt.correct]}) ${prompt.options[prompt.correct]}**\n${prompt.explanation}`,

  resultsSummary: (tally, winners) => L('results', { right: winners.length, total: tally.length }),

  glossaryAnswer: (prompt) => `${LETTERS[prompt.correct]}) ${prompt.options[prompt.correct]}. ${prompt.explanation}`,
};

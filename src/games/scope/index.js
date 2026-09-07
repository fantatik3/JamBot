/**
 * Scope it: estima cuántas horas lleva una tarea en una jam.
 *
 * No hay votación: al cerrar los envíos se calcula la mediana de todas las estimaciones y
 * gana quien más se acerque. Entrena el ojo para el alcance, que es lo que más jams hunde.
 * El motor de rondas (games/engine) se ocupa del resto en modo "judge".
 * Sus textos viven en src/locales/<idioma>/games/scope.js.
 */
const features = require('./features');
const { pickRandom } = require('../../utils/random');
const { t } = require('../../i18n');

const ID = 'scope';
const L = (key, params) => t(`games.${ID}.${key}`, params);
const MIN_HOURS = 0.5;
const MAX_HOURS = 500;

/** Convierte "6", "6h", "6,5", "2.5 horas" o "3 hours" en un número, o null si no es una estimación. */
function parseHours(text) {
  const match = /^\s*(\d+(?:[.,]\d+)?)\s*(?:h|hours?|horas?)?\s*$/i.exec(text);
  if (!match) return null;
  return Number(match[1].replace(',', '.'));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function hoursOf(tally) {
  return tally.map((entry) => parseHours(entry.text));
}

module.exports = {
  id: ID,
  name: L('name'),
  description: L('description'),
  color: 0x2ecc71,
  mode: 'judge',
  answer: { min: 1, max: 12 },
  maxSubmissions: 30,
  submitMinutes: 120,
  voteMinutes: 1,
  bankSize: features.length,

  /** Elige una tarea evitando las usadas hace poco. */
  pickPrompt(recentKeys) {
    const fresh = features.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : features) };
  },

  promptLabel: (prompt) => prompt.title,
  promptBody: (prompt) => L('promptBody', { text: prompt.text }),
  modalTitle: (prompt) => L('modalTitle', { title: prompt.title }),
  modalPlaceholder: () => L('modalPlaceholder'),

  validateAnswer(prompt, answer) {
    const hours = parseHours(answer);
    if (hours === null || hours < MIN_HOURS || hours > MAX_HOURS) {
      return L('badHours', { min: MIN_HOURS, max: MAX_HOURS });
    }
    return null;
  },

  normalizeAnswer: (prompt, answer) => `${parseHours(answer)} h`,

  /** Gana quien más se acerca a la mediana; los empates se reparten. */
  pickWinners(tally) {
    const hours = hoursOf(tally);
    const target = median(hours);
    const distances = hours.map((h) => Math.abs(h - target));
    const best = Math.min(...distances);
    return tally.filter((_, index) => distances[index] === best);
  },

  resultsSummary(tally) {
    const hours = hoursOf(tally).sort((a, b) => a - b);
    return L('results', { median: median(hours), list: hours.join(', ') });
  },

  glossaryAnswer(prompt, winner, tally) {
    return L('glossaryAnswer', { text: winner.text, median: median(hoursOf(tally)) });
  },
};

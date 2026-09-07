/**
 * Scope it: estima cuántas horas lleva una tarea en una jam.
 *
 * No hay votación: al cerrar los envíos se calcula la mediana de todas las estimaciones y
 * gana quien más se acerque. Entrena el ojo para el alcance, que es lo que más jams hunde.
 * El motor de rondas (games/engine) se ocupa del resto en modo "judge".
 */
const features = require('./features');
const { pickRandom } = require('../../utils/random');

const MIN_HOURS = 0.5;
const MAX_HOURS = 500;

/** Convierte "6", "6h", "6,5" o "2.5 horas" en un número, o null si no es una estimación. */
function parseHours(text) {
  const match = /^\s*(\d+(?:[.,]\d+)?)\s*(?:h|horas?)?\s*$/i.exec(text);
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
  id: 'scope',
  name: 'Scope it',
  description: 'Scope it: estima las horas que lleva una tarea en una jam. Gana quien más se acerque a la mediana.',
  color: 0x2ecc71,
  mode: 'judge',
  answer: { min: 1, max: 12 },
  maxSubmissions: 30,
  submitMinutes: 120,
  voteMinutes: 1,
  bankSize: features.length,

  strings: {
    noun: 'estimación',
    nounPlural: 'estimaciones',
    modalLabel: 'Horas que estimas',
    roundFooter: 'Las estimaciones se revelan todas a la vez al cerrar la ronda.',
    submitReceived: 'Estimación recibida. Se revela al cerrar la ronda.',
    submitUpdated: 'Estimación actualizada.',
    tooShort: 'Escribe un número de horas, por ejemplo 6 o 2.5.',
    tooLong: () => 'Escribe solo el número de horas, por ejemplo 6 o 2.5.',
    resultsFooter: 'La estimación ganadora y la mediana se guardan en el glosario (/scope glossary).',
    glossaryEmpty: 'El glosario está vacío. Las estimaciones ganadoras aparecerán aquí.',
  },

  /** Elige una tarea evitando las usadas hace poco. */
  pickPrompt(recentKeys) {
    const fresh = features.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : features) };
  },

  promptLabel: (prompt) => prompt.title,

  promptBody(prompt) {
    return (
      'Estima cuántas horas de trabajo lleva esto en una jam, con un equipo pequeño y arte provisional:\n\n' +
      `> ${prompt.text}\n\n` +
      'Escribe solo el número de horas (por ejemplo 6 o 2.5). Gana quien más se acerque a la mediana del grupo.'
    );
  },

  modalTitle: (prompt) => `Scope it: ${prompt.title}`,
  modalPlaceholder: () => '6',

  validateAnswer(prompt, text) {
    const hours = parseHours(text);
    if (hours === null || hours < MIN_HOURS || hours > MAX_HOURS) {
      return `Escribe solo un número de horas entre ${MIN_HOURS} y ${MAX_HOURS}, por ejemplo 6 o 2.5.`;
    }
    return null;
  },

  normalizeAnswer: (prompt, text) => `${parseHours(text)} h`,

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
    return `Mediana del grupo: **${median(hours)} h** · Estimaciones: ${hours.join(', ')} h`;
  },

  glossaryAnswer(prompt, winner, tally) {
    return `${winner.text} (mediana del grupo: ${median(hoursOf(tally))} h)`;
  },

  tutorial({ channelId, roundsPerDay, submitMinutes, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/scope start\` ${where}.`;

    return {
      description:
        'Un juego para afinar el ojo con el alcance, que es lo que más jams hunde. Se describe una tarea y ' +
        'cada cual dice cuántas horas cree que lleva. No hay respuesta correcta: gana quien más se acerque a lo que opina el grupo.',
      fields: [
        {
          name: '1. Aparece una tarea',
          value: `${cadence}\nCada ronda describe una tarea típica de jam: un menú, un jefe, una build para web...`,
        },
        {
          name: '2. Estima',
          value:
            'Pulsa **Enviar estimación** y escribe solo el número de horas de trabajo, por ejemplo 6 o 2.5, ' +
            `pensando en un equipo pequeño y arte provisional. Puedes cambiarla hasta que se cierre. Hay ${submitMinutes} minutos.`,
        },
        {
          name: '3. Resultados',
          value:
            'No hay votación. Al cerrar, se revelan todas las estimaciones y la mediana del grupo, y gana quien más ' +
            'se acerque a ella (los empates se reparten). La ganadora se guarda en el glosario con la mediana.',
        },
        {
          name: 'Puntos y comandos',
          value:
            `Acertar: **+${points.win}** · Participar: **+${points.participate}**\n` +
            '`/scope scores` clasificación · `/scope glossary` estimaciones pasadas · `/scope schedule` rondas de hoy',
        },
        {
          name: 'Consejos',
          value:
            'Cuenta también probar, arreglar y pulir, no solo programar. Si dudas entre dos números, el mayor suele ' +
            'acertar más. Y compara con la última vez que hiciste algo parecido.',
        },
      ],
    };
  },
};

/**
 * Nómbralo: propón el nombre más claro para una variable, función, clase o asset.
 *
 * Cada ronda describe algo que necesita nombre (items.js) y se vota la propuesta que se
 * entiende al primer vistazo. El motor de rondas (games/engine) se ocupa del resto.
 */
const items = require('./items');
const { pickRandom } = require('../../utils/random');
const { truncate } = require('../../utils/text');

module.exports = {
  id: 'nombralo',
  name: 'Nómbralo',
  description: 'Nómbralo: propón el nombre más claro para una variable, función, clase o asset.',
  color: 0x3498db,
  answer: { min: 2, max: 40 },
  maxSubmissions: 15,
  submitMinutes: 60,
  voteMinutes: 30,
  bankSize: items.length,

  strings: {
    noun: 'propuesta',
    nounPlural: 'propuestas',
    modalLabel: 'Tu nombre para esto',
    voteIntro: () => 'Vota el nombre que entenderías al primer vistazo, sin abrir el archivo. No puedes votar el tuyo.',
    tooShort: 'Un nombre necesita al menos dos caracteres.',
    tooLong: (max) => `Máximo ${max} caracteres. Un nombre largo es un nombre malo.`,
  },

  /** Elige un caso evitando los usados hace poco. */
  pickPrompt(recentKeys) {
    const fresh = items.filter((entry) => !recentKeys.includes(entry.key));
    return { ...pickRandom(fresh.length > 0 ? fresh : items) };
  },

  promptLabel: (prompt) => `${prompt.kind}: ${truncate(prompt.what, 60)}`,

  promptBody(prompt) {
    const context = prompt.context ? `\n\nContexto: ${prompt.context}` : '';
    return (
      `Necesitas un nombre para **${prompt.kind}**: ${prompt.what}.${context}\n\n` +
      'Escribe solo el nombre, tal como iría en el proyecto (camelCase, PascalCase o snake_case, lo que uses).'
    );
  },

  modalTitle: (prompt) => `Nómbralo: ${prompt.kind}`,
  modalPlaceholder: () => 'porEjemploAsi',

  /** Devuelve un mensaje de error si el texto no tiene pinta de nombre. */
  validateAnswer(prompt, text) {
    if (/\s/.test(text)) return 'Un nombre no lleva espacios: usa camelCase, PascalCase o snake_case.';
    if (!/^[\p{L}\p{N}_$.-]+$/u.test(text)) return 'Usa solo letras, números, guiones bajos o puntos.';
    return null;
  },

  tutorial({ channelId, roundsPerDay, submitMinutes, voteMinutes, answerMax, points }) {
    const where = channelId ? `en <#${channelId}>` : 'en este canal';
    const cadence =
      roundsPerDay > 0
        ? `Las rondas aparecen solas a lo largo del día, a horas aleatorias, ${where}.`
        : `Cualquiera puede abrir una ronda con \`/nombralo start\` ${where}.`;

    return {
      description:
        'Un juego rápido sobre lo que más se repite en cualquier revisión de código: poner nombres que se ' +
        'entiendan sin explicación. Se describe algo y tú propones cómo lo llamarías.',
      fields: [
        {
          name: '1. Aparece algo sin nombre',
          value: `${cadence}\nCada ronda describe una variable, función, clase, escena o asset y para qué sirve.`,
        },
        {
          name: '2. Nómbralo',
          value:
            `Pulsa **Enviar propuesta** y escribe solo el nombre, de ${answerMax} caracteres como máximo, sin espacios, ` +
            `tal como iría en el proyecto. Puedes volver a enviar para corregir. Hay ${submitMinutes} minutos para participar.`,
        },
        {
          name: '3. Vota',
          value:
            'Al cerrarse los envíos, las propuestas aparecen de forma anónima y en orden aleatorio. ' +
            'Vota la que entenderías al primer vistazo. No puedes votar la tuya y puedes cambiar el voto. ' +
            `La votación dura ${voteMinutes} minutos.`,
        },
        {
          name: '4. Resultados',
          value:
            'Gana la más votada (los empates se reparten). Si nadie vota, la suerte elige una. ' +
            'La propuesta ganadora se guarda en el glosario como referencia de estilo.',
        },
        {
          name: 'Puntos y comandos',
          value:
            `Ganar: **+${points.win}** · Participar: **+${points.participate}**\n` +
            '`/nombralo scores` clasificación · `/nombralo glossary` nombres ganadores · `/nombralo schedule` rondas de hoy',
        },
        {
          name: 'Consejos',
          value:
            'Di qué es, no cómo se calcula. Los booleanos preguntan (puedeSaltar, estaEnSuelo). Las funciones ' +
            'empiezan por un verbo. Evita abreviaturas que solo entiendas tú.',
        },
      ],
    };
  },
};

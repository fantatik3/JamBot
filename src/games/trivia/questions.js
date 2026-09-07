/**
 * Preguntas de Trivia por disciplina, repartidas en un archivo por disciplina dentro de questions/.
 *
 * Cada entrada:
 *   key         - identificador estable (se usa para no repetir preguntas recientes)
 *   discipline  - disciplina a la que pertenece
 *   question    - la pregunta
 *   answer      - la respuesta correcta
 *   wrong       - tres respuestas incorrectas (se mezclan con la correcta en cada ronda)
 *   explanation - una o dos frases que expliquen la respuesta
 */
module.exports = [
  ...require('./questions/programacion'),
  ...require('./questions/arte'),
  ...require('./questions/audio'),
  ...require('./questions/diseno'),
  ...require('./questions/narrativa'),
  ...require('./questions/produccion'),
];

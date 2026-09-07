/**
 * Fragmentos de código con un fallo escondido, para Caza el bug, repartidos por lenguaje en snippets/.
 *
 * Cada entrada:
 *   key      - identificador estable (se usa para no repetir casos recientes)
 *   language - nombre del lenguaje o motor, para mostrarlo
 *   fence    - etiqueta del bloque de código en Discord (csharp, gdscript, js, cpp, glsl, python)
 *   title    - etiqueta corta para títulos y glosario
 *   code     - el fragmento, corto y sin líneas de más
 *   solution - qué falla y por qué; se revela con los resultados
 */
module.exports = [
  ...require('./snippets/csharp'),
  ...require('./snippets/gdscript'),
  ...require('./snippets/javascript'),
  ...require('./snippets/cpp'),
  ...require('./snippets/shaders'),
  ...require('./snippets/python'),
];

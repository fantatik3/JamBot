/**
 * Fragmentos de código que funcionan pero huelen mal, para Huele mal, repartidos por lenguaje en snippets/.
 * Ninguno tiene un bug: el problema está en cómo está escrito (repetición, números sueltos, acoplamiento,
 * trabajo innecesario cada frame, nombres que no dicen nada...).
 *
 * Cada entrada:
 *   key      - identificador estable (se usa para no repetir casos recientes)
 *   language - nombre del lenguaje o motor, para mostrarlo
 *   fence    - etiqueta del bloque de código en Discord (csharp, gdscript, js, cpp, glsl, python)
 *   title    - etiqueta corta para títulos y glosario
 *   code     - el fragmento, corto y sin líneas de más
 *   solution - qué cambiaría el bot y por qué; se revela con los resultados
 */
module.exports = [
  ...require('./snippets/csharp'),
  ...require('./snippets/gdscript'),
  ...require('./snippets/javascript'),
  ...require('./snippets/cpp'),
  ...require('./snippets/shaders'),
  ...require('./snippets/python'),
];

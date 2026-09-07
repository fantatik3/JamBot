/**
 * Idiomas disponibles para todo lo que dice el bot. Se elige con BOT_LANGUAGE en .env.
 *
 * Para añadir uno: copia la carpeta `es` con el código del idioma nuevo (por ejemplo `fr`),
 * traduce sus archivos y regístralo aquí. Cualquier clave que falte se toma del español.
 * Los bancos de los juegos (términos, casos, preguntas...) son contenido y no cambian con el idioma.
 */
module.exports = {
  es: require('./es'),
  en: require('./en'),
};

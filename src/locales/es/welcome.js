/** Bienvenida: comandos /welcome y /phrases, y las frases que se sortean para cada miembro nuevo. */
module.exports = {
  command: {
    description: 'Prueba el mensaje de bienvenida.',
    preview: 'Muestra un mensaje de bienvenida de ejemplo (solo tú lo ves).',
    send: 'Publica un mensaje de bienvenida en el canal de bienvenida.',
    user: 'Miembro al que dar la bienvenida (por defecto, tú)',
    channelMissing: 'No se encontró el canal de bienvenida configurado o no es un canal de texto.',
    sent: ({ url }) => `Mensaje de bienvenida enviado: ${url}`,
  },

  phrasesCommand: {
    description: 'Muestra todas las frases de bienvenida en este canal.',
    header: ({ count }) => `**Frases de bienvenida (${count}):**`,
  },

  /**
   * Frases de bienvenida. Se elige una al azar para cada miembro nuevo.
   *   {user}   -> mención del miembro nuevo (esto es lo que le notifica)
   *   {server} -> nombre del servidor
   */
  phrases: [
    '{user} ha aparecido en el punto de spawn. Una mente más para desatascar a la gente.',
    'Logro desbloqueado: {user} se unió al escuadrón de apoyo. La jam está un poco más a salvo.',
    '¡Hola {user}! Aquí nos juntamos quienes respondemos preguntas a las 3 de la mañana. Ya eres de la casa.',
    '{user} se une a {server}. Un par de manos más para arreglar shaders morados ajenos.',
    'Te damos la bienvenida, {user}. Aquí "en mi máquina funciona" es una pista para empezar a ayudar, no una excusa.',
    '{user} se unió a {server}. No hace falta insertar moneda: aquí la ayuda se regala.',
    '¡Ojo, {server}! {user} acaba de spawnear con ganas de responder preguntas.',
    'Nueva partida en modo cooperativo: {user} ya está en el equipo. Objetivo: que nadie se quede atascado.',
    '{user} ha llegado justo a tiempo: la jam nunca duerme y las dudas tampoco.',
    '{user} acaba de unirse. Ni el NullReferenceException más rebelde se resistirá a este equipo.',
    '¡Hola {user}! Trae tus trucos, tus atajos y tus "yo eso lo arreglé una vez". Aquí se destilan las mejores respuestas.',
    '{user} entra a {server}. Recuerda: aquí un bug ajeno es una oportunidad de enseñar.',
    '{user} se unió a la party. Ahora sí podemos con la mazmorra de preguntas de la jam.',
    'Guardado automático: {user} ya forma parte del equipo de {server}. No cierres sin guardar.',
    '¡Hola {user}! Aquí el jefe final es el "no sé por dónde empezar" de otras personas, y lo derrotamos en equipo.',
    '{user} ha entrado al lobby. Si alguna vez arreglaste un sprite al revés a las 4 de la mañana, ya estás en casa.',
    'Ha aparecido {user}. Aquí se destilan las mejores respuestas de la jam, así que trae tu alambique.',
    '{user} acaba de conectarse. El crunch es opcional, echar una mano es lo nuestro.',
    '{user}, has entrado a la base de operaciones. Desde aquí se coordinan los rescates de la jam.',
    '¡Nuevo NPC de ayuda... perdón, mentor! {user}, te damos la bienvenida a {server}.',
    '{user} ha aparecido en el mapa. Misión secundaria disponible: elegir tus roles y contar en qué eres crack.',
    'Se ha unido {user}. Si el juego de alguien crashea, ahora hay una persona más para evitarlo.',
    '{user}, la jam empieza cuando quieras: aquí siempre hay alguien despierto con una respuesta o un merge conflict.',
    '{user} acaba de unirse a {server}. Vida extra concedida a la jam entera.',
    'Cargando a {user}... 100%. Ya puedes responder, opinar y presumir de soluciones.',
    '¡{user} está aquí! Que alguien le pase la lista de preguntas frecuentes... ah, cierto, la estamos escribiendo entre todos.',
    '{user} ha entrado. Aquí las dudas de la jam no se quedan en el backlog: se resuelven y se documentan.',
    'Nueva conexión: {user}. Sea Unity, Godot, Unreal o un motor custom, ahora hay alguien más que ya lo sufrió antes.',
    '¡Player ready! {user}, pulsa Start, elige tus roles y únete al equipo de apoyo de {server}.',
    '{user}, en {server} un "no sé cómo hacerlo" ajeno siempre termina en un "ya me sale". Ese es el trabajo.',
    '{user} acaba de entrar. Menos crunch, más comunidad. Así ayudamos desde {server}.',
    '{user} ha aparecido en el punto de spawn. Sin daño por caída, lo prometemos.',
    '{user} acaba de cargar la partida. Checkpoint guardado, ya no hay vuelta atrás.',
    'Te damos la bienvenida, {user}. Aquí "en mi máquina funciona" no es una excusa, es el comienzo de una buena charla.',
  ],
};

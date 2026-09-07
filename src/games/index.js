/**
 * Registro de juegos. Para añadir uno nuevo, crea una carpeta en src/games/<id>/ con un
 * index.js que siga la misma forma que games/jerga/index.js y añádelo a esta lista.
 * El comando /<id>, los botones y las rondas automáticas se generan solos.
 */
const games = [
  require('./jerga'),
  require('./triaje'),
  require('./nombralo'),
  require('./scope'),
  require('./bugs'),
  require('./smells'),
  require('./trivia'),
];

const byId = new Map(games.map((game) => [game.id, game]));

function getGame(id) {
  return byId.get(id) ?? null;
}

module.exports = { games, getGame };

/**
 * Un comando de barra por juego registrado (/jerga, ...), todos con los mismos subcomandos.
 * Ver games/engine/command.js para la lista y games/index.js para añadir juegos.
 */
const { games } = require('../games');
const { createGameCommand } = require('../games/engine/command');

module.exports = games.map(createGameCommand);

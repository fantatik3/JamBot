/**
 * Un manejador de botones y modal por juego registrado, con el id del juego como prefijo.
 * Ver games/engine/interaction.js.
 */
const { games } = require('../games');
const { createGameHandler } = require('../games/engine/interaction');

module.exports = games.map(createGameHandler);

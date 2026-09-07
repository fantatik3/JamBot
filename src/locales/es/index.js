/** Español. Todo lo que dice el bot, por áreas. */
module.exports = {
  common: require('./common'),
  roles: require('./roles'),
  welcome: require('./welcome'),
  engine: require('./engine'),
  games: {
    jerga: require('./games/jerga'),
    triaje: require('./games/triaje'),
    nombralo: require('./games/nombralo'),
    scope: require('./games/scope'),
    bugs: require('./games/bugs'),
    trivia: require('./games/trivia'),
  },
};

/** English. Everything the bot says, by area. Keys mirror src/locales/es. */
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

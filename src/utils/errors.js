/**
 * Error cuyo mensaje se puede mostrar tal cual al usuario de Discord.
 * Cualquier otro error se comunica de forma genérica y se registra completo en el log.
 */
class UserFacingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserFacingError';
  }
}

module.exports = { UserFacingError };

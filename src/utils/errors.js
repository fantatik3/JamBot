/**
 * Error whose message is safe to show to the Discord user as-is.
 * Anything else is reported generically and logged in full.
 */
class UserFacingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserFacingError';
  }
}

module.exports = { UserFacingError };

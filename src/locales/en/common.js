/** General texts: bot status, common errors and /ping. */
module.exports = {
  presence: 'Welcoming new members',
  somethingWentWrong: 'Something went wrong. Please try again later.',
  unknownCommand: 'Unknown command. The bot commands may need to be registered again.',
  notAMember: 'That user is not a member of this server.',
  envMissing: ({ name }) => `${name} is not set in the .env file.`,
  testerRoleOnly: ({ roleId }) => `This command is only available to the <@&${roleId}> role.`,

  ping: {
    description: 'Checks that the bot is online.',
    measuring: 'Measuring...',
    result: ({ roundtrip, gateway }) => `Pong! Round trip: **${roundtrip} ms** · Gateway: **${gateway} ms**`,
  },
};

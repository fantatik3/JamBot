/** Name it: game-specific texts. The slash command stays /nombralo. */
module.exports = {
  name: 'Name it',
  description: 'Name it: propose the clearest name for a variable, function, class or asset.',

  strings: {
    noun: 'proposal',
    nounPlural: 'proposals',
    modalLabel: 'Your name for this',
    voteIntro: () => 'Vote for the name you would understand at first glance, without opening the file. You cannot vote for your own.',
    tooShort: 'A name needs at least two characters.',
    tooLong: (max) => `Maximum ${max} characters. A long name is a bad name.`,
  },

  promptBody: ({ kind, what, context }) =>
    `You need a name for **${kind}**: ${what}.${context ? `\n\nContext: ${context}` : ''}\n\n` +
    'Write only the name, as it would go in the project (camelCase, PascalCase or snake_case, whatever you use).',
  modalTitle: ({ kind }) => `Name it: ${kind}`,
  modalPlaceholder: 'likeThisForExample',
  noSpaces: 'A name has no spaces: use camelCase, PascalCase or snake_case.',
  badChars: 'Use only letters, digits, underscores or dots.',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'A quick game about what comes up most in any code review: choosing names that need no explanation. ' +
      'Something is described and you propose what you would call it.',
    fields: [
      {
        name: '1. Something nameless shows up',
        value: `${cadence}\nEach round describes a variable, function, class, scene or asset and what it is for.`,
      },
      {
        name: '2. Name it',
        value:
          `Press **Send proposal** and write only the name, ${answerMax} characters at most, no spaces, ` +
          `as it would go in the project. You can send again to fix it. There are ${submitMinutes} minutes to take part.`,
      },
      {
        name: '3. Vote',
        value:
          'When submissions close, the proposals are shown anonymously and in random order. ' +
          'Vote for the one you would understand at first glance. You cannot vote for your own and you can change your vote. ' +
          `Voting lasts ${voteMinutes} minutes.`,
      },
      {
        name: '4. Results',
        value:
          'The most voted wins (ties are shared). If nobody votes, luck picks one. ' +
          'The winning proposal is saved to the glossary as a style reference.',
      },
      {
        name: 'Points and commands',
        value:
          `Win: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/nombralo scores` leaderboard · `/nombralo glossary` winning names · `/nombralo schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Say what it is, not how it is computed. Booleans ask a question (canJump, isGrounded). Functions ' +
          'start with a verb. Avoid abbreviations only you understand.',
      },
    ],
  }),
};

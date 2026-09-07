/** Code smells: game-specific texts. The slash command stays /smells. */
module.exports = {
  name: 'Code smells',
  description: 'Code smells: the code works, but it is badly written. Say what you would change and why.',

  strings: {
    noun: 'suggestion',
    nounPlural: 'suggestions',
    submitButton: 'Send suggestion',
    modalLabel: 'What you would change and why',
    receivedField: 'Suggestions received',
    roundFooter: 'Suggestions are shown anonymously in the vote.',
    voteIntro: () => 'Vote for the suggestion that improves the code most without changing what it does. You cannot vote for your own.',
    luckLine: 'Nobody voted, so luck picked the winning suggestion:',
    resultsFooter: 'The winning suggestion is saved to the glossary (/smells glossary).',
    revealField: 'What I would change',
    submitReceived: 'Suggestion received. It will be shown anonymously in the vote.',
    submitUpdated: 'Suggestion updated.',
    tooShort: 'Write a slightly longer suggestion.',
    tooLong: (max) => `Maximum ${max} characters. What you would change and why, no novel.`,
    maxSubmissions: (max) => `This round already has the maximum of ${max} suggestions.`,
    selfVote: 'You cannot vote for your own suggestion.',
    cancelledEmpty: 'Nobody sent a suggestion, so the round is cancelled.',
    glossaryEmpty: 'The glossary is empty. Winning suggestions will show up here.',
  },

  promptBody: ({ language, fence, code }) =>
    `**${language}**\n` + '```' + fence + '\n' + code + '\n```\n' + 'It works and has no bug, but it smells. Say what you would change and why.',
  modalTitle: ({ title }) => `Code smells: ${title}`,
  modalPlaceholder: 'What you would change and why',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'A game to train the part of code review that is not about bugs: the snippet works, but something in how it is ' +
      'written will cause trouble as soon as the project grows or someone else touches it. Say what you would change and why.',
    fields: [
      {
        name: '1. A snippet shows up',
        value: `${cadence}\nEach round shows a few lines of C#, GDScript, JavaScript, C++, a shader or Python that work but smell.`,
      },
      {
        name: '2. Suggest',
        value:
          `Press **Send suggestion** and say what you would change and why, in ${answerMax} characters at most. ` +
          `No need to rewrite the code. You can send again to fix it. There are ${submitMinutes} minutes to take part.`,
      },
      {
        name: '3. Vote',
        value:
          'When submissions close, the suggestions are shown anonymously and in random order. ' +
          'Vote for the one that improves the code most without changing what it does. You cannot vote for your own and you can change your vote. ' +
          `Voting lasts ${voteMinutes} minutes.`,
      },
      {
        name: '4. Results',
        value:
          'The most voted wins (ties are shared). If nobody votes, luck picks one. ' +
          "The results show what the bot would change, and the winning suggestion goes to the glossary.",
      },
      {
        name: 'Points and commands',
        value:
          `Win: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/smells scores` leaderboard · `/smells glossary` winning suggestions · `/smells schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Ask yourself what happens when the project has twice the code or when someone else reads it. The usual suspects: ' +
          'loose numbers, strings as states, functions that do everything, copy and paste, and looking things up every frame.',
      },
    ],
  }),
};

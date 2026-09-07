/** Kill the jargon: game-specific texts. The slash command stays /jerga. */
module.exports = {
  name: 'Kill the jargon',
  description: 'Kill the jargon: explain game development terms without using the banned words.',

  /** Overrides entries of engine.strings. `voteIntro(prompt)` and `tooLong(max)` get the same data as there. */
  strings: {
    noun: 'explanation',
    nounPlural: 'explanations',
    voteIntro: (prompt) => `Vote for the clearest explanation of **${prompt.term}**. You cannot vote for your own.`,
    tooLong: (max) => `Maximum ${max} characters. Explaining it short is the whole point.`,
  },

  promptBody: ({ term, banned }) =>
    `Explain **${term}** to someone in their first jam.\n\n` +
    `Banned words: ${banned}\n` +
    '(The term itself does not count either.)',
  modalTitle: ({ term }) => `Explain: ${term}`,
  modalPlaceholder: ({ banned }) => `Without using: ${banned}`,
  forbiddenWords: ({ list }) => `Your explanation uses banned words: ${list}. Try again.`,

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'A game to train what we do best here: explaining game development things without jargon, ' +
      'the way you would tell someone in their first jam.',
    fields: [
      {
        name: '1. A term shows up',
        value: `${cadence}\nEach round brings a term (for example **Raycast**) and five banned words.`,
      },
      {
        name: '2. Explain it',
        value:
          `Press **Send explanation** and write it in ${answerMax} characters at most, ` +
          'without using the term or the banned words. The bot checks it ignoring case, accents and simple plurals. ' +
          `You can send again to fix it. There are ${submitMinutes} minutes to take part.`,
      },
      {
        name: '3. Vote',
        value:
          'When submissions close, the explanations are shown anonymously and in random order. ' +
          'Vote for the clearest one with the numbered buttons. You cannot vote for your own and you can change your vote. ' +
          `Voting lasts ${voteMinutes} minutes.`,
      },
      {
        name: '4. Results',
        value:
          'The most voted wins (ties are shared). If nobody votes, luck picks one. ' +
          'The winning explanation is saved to the server glossary.',
      },
      {
        name: 'Points and commands',
        value:
          `Win: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/jerga scores` leaderboard · `/jerga glossary` winning explanations · `/jerga schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Compare it with something everyday. Get to the point: short and concrete beats long and perfect. ' +
          'If a banned word slips out, there is usually a simpler way to say it.',
      },
    ],
  }),
};

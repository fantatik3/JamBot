/** Trivia by discipline: game-specific texts. The slash command stays /trivia. */
module.exports = {
  name: 'Trivia by discipline',
  description: 'Trivia by discipline: a programming, art, audio, design, narrative or production question.',

  strings: {
    noun: 'answer',
    nounPlural: 'answers',
    revealField: 'Correct answer',
    resultsFooter: 'The answer and its explanation are saved to the glossary (/trivia glossary).',
    glossaryEmpty: 'The glossary is empty. Answered questions will show up here.',
    cancelledEmpty: 'Nobody answered, so the round is cancelled.',
  },

  promptBody: ({ discipline, question, options }) =>
    `**${discipline}**\n\n${question}\n\n${options}\n\nPress the letter you think is correct.`,
  results: ({ right, total }) => `${right} of ${total} got it right.`,

  tutorial: ({ cadence, submitMinutes, points }) => ({
    description:
      'Short questions from every jam discipline. The fun is in the ones outside your own: ' +
      'programmers learn some audio and artists learn some design.',
    fields: [
      {
        name: '1. A question shows up',
        value: `${cadence}\nEach round brings a programming, art, audio, design, narrative or production question with four options.`,
      },
      {
        name: '2. Answer',
        value:
          'Press the letter you think is correct. Nobody sees your answer and you can change it until the round closes. ' +
          `There are ${submitMinutes} minutes to answer.`,
      },
      {
        name: '3. Results',
        value:
          'There is no vote. On close, the correct answer is revealed with a short explanation and the bot says who got it right. ' +
          'The answer and its explanation are saved to the glossary.',
      },
      {
        name: 'Points and commands',
        value:
          `Correct: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/trivia scores` leaderboard · `/trivia glossary` past answers · `/trivia schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'If in doubt, first rule out the options that sound good but say nothing. And if you miss, read the explanation: ' +
          'that is the part that sticks.',
      },
    ],
  }),
};

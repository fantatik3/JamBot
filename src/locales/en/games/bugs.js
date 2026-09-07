/** Bug hunt: game-specific texts. The slash command stays /bugs. */
module.exports = {
  name: 'Bug hunt',
  description: 'Bug hunt: there is a bug hidden in the code. Say what fails and why.',

  strings: {
    noun: 'diagnosis',
    nounPlural: 'diagnoses',
    submitButton: 'Send diagnosis',
    modalLabel: 'What fails and why',
    receivedField: 'Diagnoses received',
    roundFooter: 'Diagnoses are shown anonymously in the vote.',
    voteIntro: () => 'Vote for the most accurate diagnosis: what fails and why. You cannot vote for your own.',
    luckLine: 'Nobody voted, so luck picked the winning diagnosis:',
    resultsFooter: 'The winning diagnosis is saved to the glossary (/bugs glossary).',
    submitReceived: 'Diagnosis received. It will be shown anonymously in the vote.',
    submitUpdated: 'Diagnosis updated.',
    tooShort: 'Write a slightly longer diagnosis.',
    tooLong: (max) => `Maximum ${max} characters. What fails and why, no novel.`,
    maxSubmissions: (max) => `This round already has the maximum of ${max} diagnoses.`,
    selfVote: 'You cannot vote for your own diagnosis.',
    cancelledEmpty: 'Nobody sent a diagnosis, so the round is cancelled.',
    glossaryEmpty: 'The glossary is empty. Winning diagnoses will show up here.',
  },

  promptBody: ({ language, fence, code }) =>
    `**${language}**\n` + '```' + fence + '\n' + code + '\n```\n' + 'Something fails. Explain what and why, in a few words.',
  modalTitle: ({ title }) => `Bug hunt: ${title}`,
  modalPlaceholder: 'What fails and why',

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      "A game to train the eye for reviewing other people's code, which is what we do when someone pastes a " +
      'snippet in the help channel. There is a hidden bug and you have to find it.',
    fields: [
      {
        name: '1. A snippet shows up',
        value: `${cadence}\nEach round shows a few lines of C#, GDScript, JavaScript, C++, a shader or Python with a bug.`,
      },
      {
        name: '2. Diagnose',
        value:
          `Press **Send diagnosis** and explain what fails and why, in ${answerMax} characters at most. ` +
          `No need to paste fixed code. You can send again to fix it. There are ${submitMinutes} minutes to take part.`,
      },
      {
        name: '3. Vote',
        value:
          'When submissions close, the diagnoses are shown anonymously and in random order. ' +
          'Vote for the most accurate one. You cannot vote for your own and you can change your vote. ' +
          `Voting lasts ${voteMinutes} minutes.`,
      },
      {
        name: '4. Results',
        value:
          'The most voted wins (ties are shared). If nobody votes, luck picks one. ' +
          'The results reveal the solution, and the winning diagnosis goes to the glossary.',
      },
      {
        name: 'Points and commands',
        value:
          `Win: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/bugs scores` leaderboard · `/bugs glossary` winning diagnoses · `/bugs schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Read the snippet as if you were the computer, line by line. The usual suspects: comparing ' +
          'floats, forgetting delta, off-by-one indices, things called every frame that should not be.',
      },
    ],
  }),
};

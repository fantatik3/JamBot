/** Triage: game-specific texts. The slash command stays /triaje. */
module.exports = {
  name: 'Triage',
  description: 'Triage: someone is stuck. Which three questions would you ask first to find the problem?',

  strings: {
    noun: 'list',
    nounPlural: 'lists',
    submitButton: 'Send my questions',
    modalLabel: 'Your three questions',
    receivedField: 'Question lists received',
    roundFooter: 'The questions are shown anonymously in the vote.',
    voteIntro: () => 'Vote for the list that corners the problem with the fewest questions. You cannot vote for your own.',
    submitReceived: 'Questions received. They will be shown anonymously in the vote.',
    submitUpdated: 'Questions updated.',
    tooShort: 'Write at least a couple of questions.',
    tooLong: (max) => `Maximum ${max} characters. Three short questions are enough.`,
    selfVote: 'You cannot vote for your own questions.',
    cancelledEmpty: 'Nobody sent questions, so the round is cancelled.',
    glossaryEmpty: 'The glossary is empty. Winning question lists will show up here.',
  },

  promptBody: ({ discipline, text }) =>
    `Someone writes in the help channel (**${discipline}**):\n\n` +
    `> ${text}\n\n` +
    "Don't give the solution. Write the **three questions** you would ask first to pin down the problem.",
  modalTitle: ({ title }) => `Triage: ${title}`,
  modalPlaceholder: '1) ...? 2) ...? 3) ...?',
  needQuestions: ({ min }) => `Write questions, not answers: I need at least ${min} question marks.`,

  tutorial: ({ cadence, answerMax, submitMinutes, voteMinutes, points }) => ({
    description:
      'A game to train the first thing a good mentor does: ask well before answering. ' +
      'A message from someone stuck arrives, vague and short on details, and you decide which three questions you would ask first.',
    fields: [
      {
        name: '1. A case shows up',
        value: `${cadence}\nEach round brings a message just as someone would write it in the help channel.`,
      },
      {
        name: '2. Triage it',
        value:
          "Don't give the solution. Press **Send my questions** and write the three questions you would ask first " +
          `to pin down the problem, in ${answerMax} characters at most. The bot requires at least two question marks. ` +
          `You can send again to fix it. There are ${submitMinutes} minutes to take part.`,
      },
      {
        name: '3. Vote',
        value:
          'When submissions close, the lists are shown anonymously and in random order. ' +
          'Vote for the one that corners the problem with the fewest questions. You cannot vote for your own and you can change your vote. ' +
          `Voting lasts ${voteMinutes} minutes.`,
      },
      {
        name: '4. Results',
        value:
          'The most voted wins (ties are shared). If nobody votes, luck picks one. ' +
          'The winning list is saved to the glossary as a diagnosis cheat sheet.',
      },
      {
        name: 'Points and commands',
        value:
          `Win: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/triaje scores` leaderboard · `/triaje glossary` winning lists · `/triaje schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Ask about what can be checked in a minute: engine and version, what changed since it worked, ' +
          'whether it happens always or sometimes, what the console says. A good question rules out half the causes.',
      },
    ],
  }),
};

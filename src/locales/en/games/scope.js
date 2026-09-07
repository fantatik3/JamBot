/** Scope it: game-specific texts. */
module.exports = {
  name: 'Scope it',
  description: 'Scope it: estimate the hours a task takes in a jam. Whoever gets closest to the median wins.',

  strings: {
    noun: 'estimate',
    nounPlural: 'estimates',
    modalLabel: 'Hours you estimate',
    roundFooter: 'All estimates are revealed at once when the round closes.',
    submitReceived: 'Estimate received. It is revealed when the round closes.',
    submitUpdated: 'Estimate updated.',
    tooShort: 'Write a number of hours, for example 6 or 2.5.',
    tooLong: () => 'Write only the number of hours, for example 6 or 2.5.',
    resultsFooter: 'The winning estimate and the median are saved to the glossary (/scope glossary).',
    glossaryEmpty: 'The glossary is empty. Winning estimates will show up here.',
  },

  promptBody: ({ text }) =>
    'Estimate how many hours of work this takes in a jam, with a small team and placeholder art:\n\n' +
    `> ${text}\n\n` +
    'Write only the number of hours (for example 6 or 2.5). Whoever gets closest to the group median wins.',
  modalTitle: ({ title }) => `Scope it: ${title}`,
  modalPlaceholder: '6',
  badHours: ({ min, max }) => `Write only a number of hours between ${min} and ${max}, for example 6 or 2.5.`,
  results: ({ median, list }) => `Group median: **${median} h** · Estimates: ${list} h`,
  glossaryAnswer: ({ text, median }) => `${text} (group median: ${median} h)`,

  tutorial: ({ cadence, submitMinutes, points }) => ({
    description:
      'A game to sharpen your eye for scope, the thing that sinks the most jams. A task is described and ' +
      "everyone says how many hours they think it takes. There is no right answer: whoever gets closest to the group's opinion wins.",
    fields: [
      {
        name: '1. A task shows up',
        value: `${cadence}\nEach round describes a typical jam task: a menu, a boss, a web build...`,
      },
      {
        name: '2. Estimate',
        value:
          'Press **Send estimate** and write only the number of hours of work, for example 6 or 2.5, ' +
          `thinking of a small team and placeholder art. You can change it until it closes. There are ${submitMinutes} minutes.`,
      },
      {
        name: '3. Results',
        value:
          'There is no vote. On close, all estimates and the group median are revealed, and whoever is closest ' +
          'wins (ties are shared). The winner is saved to the glossary with the median.',
      },
      {
        name: 'Points and commands',
        value:
          `Closest: **+${points.win}** · Take part: **+${points.participate}**\n` +
          "`/scope scores` leaderboard · `/scope glossary` past estimates · `/scope schedule` today's rounds",
      },
      {
        name: 'Tips',
        value:
          'Count testing, fixing and polishing too, not just programming. If you hesitate between two numbers, ' +
          'the bigger one is usually right. And compare with the last time you did something similar.',
      },
    ],
  }),
};

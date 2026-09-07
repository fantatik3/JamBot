/**
 * Round engine: texts shared by every game (embeds, buttons, notices and subcommands).
 * Each game can override any entry of `strings` from games/<id>.js.
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
  /**
   * Default texts built from the noun the game uses for an answer.
   *   noun, nounPlural -> "explanation", "explanations"
   *   gameId           -> to mention /<game> glossary
   *   choice           -> the game is answered by pressing a letter
   *   judged           -> the game decides the winners without a vote
   */
  strings: ({ noun = 'answer', nounPlural, gameId, choice, judged }) => {
    const plural = nounPlural ?? `${noun}s`;
    return {
      noun,
      nounPlural: plural,
      submitButton: `Send ${noun}`,
      closeButton: choice || judged ? 'Close and grade' : 'Close submissions and vote',
      finishButton: 'End voting',
      receivedField: `${capitalize(plural)} received`,
      roundFooter: choice
        ? 'You can change your answer until the round closes.'
        : `${capitalize(plural)} are shown anonymously in the vote.`,
      modalLabel: `Your ${noun}`,
      voteIntro: () => `Vote for the clearest ${noun}. You cannot vote for your own.`,
      luckLine: `Nobody voted, so luck picked the winning ${noun}:`,
      resultsFooter: `The winning ${noun} is saved to the glossary (/${gameId} glossary).`,
      revealField: 'Solution',
      winnersField: 'Got it right',
      nobodyRight: 'Nobody got it right this time.',
      glossaryEmpty: `The glossary is empty. Winning ${plural} will show up here.`,
      submitReceived: `${capitalize(noun)} received. It will be shown anonymously in the vote.`,
      submitUpdated: `${capitalize(noun)} updated.`,
      pickReceived: (letter) => `Answer recorded: ${letter}. You can change it until the round closes.`,
      pickChanged: (letter) => `Answer changed to ${letter}.`,
      voteReceived: (option) => `Vote recorded: option ${option}.`,
      voteChanged: (option) => `Vote changed to option ${option}.`,
      closed: 'Submissions for this round are closed.',
      tooShort: `Write a slightly longer ${noun}.`,
      tooLong: (max) => `Maximum ${max} characters. Short is the whole point.`,
      maxSubmissions: (max) => `This round already has the maximum of ${max} ${plural}.`,
      notVoting: 'Voting is not open for this round.',
      badOption: 'That option does not exist.',
      selfVote: `You cannot vote for your own ${noun}.`,
      noRound: 'This round is already over.',
      manageOnly: 'Only whoever started the round (or someone with **Manage Messages**) can do that.',
      cancelledEmpty: `Nobody sent a ${noun}, so the round is cancelled.`,
      guildOnly: 'This game only works inside a server.',
    };
  },

  round: {
    title: ({ game, number }) => `${game} · Round ${number}`,
    submissionsField: 'Submissions',
    closed: 'Closed',
    closesAt: ({ when }) => `Close ${when}`,
  },

  voting: {
    title: ({ game, label }) => `${game} · Vote · ${label}`,
    votesField: 'Votes',
    statusField: 'Voting',
    closed: 'Closed',
    closesAt: ({ when }) => `Closes ${when}`,
  },

  results: {
    title: ({ game, label }) => `${game} · Results · ${label}`,
    tieTitle: ({ game, label }) => `${game} · Tie · ${label}`,
    voteLine: ({ votes, user, text }) => `**${votes} vote(s)** · ${user}\n> ${text}`,
    plainLine: ({ user, text }) => `${user} · ${text}`,
    votesField: 'Votes',
    pointsField: 'Points',
    pointsValue: ({ win, participate }) => `Win +${win} · Take part +${participate}`,
  },

  scores: {
    title: 'Leaderboard',
    line: ({ rank, user, points }) => `**${rank}.** ${user} · ${points} point(s)`,
    empty: 'Nobody has points yet.',
  },

  glossary: {
    title: ({ game }) => `${game} · Glossary`,
    byLine: ({ user, votes }) => ` · ${user} (${votes} vote(s))`,
  },

  tutorial: {
    title: ({ game }) => `${game} · How to play`,
    footer: ({ gameId }) =>
      `With Manage Messages you can advance or cancel a round with /${gameId} next and /${gameId} cancel.`,
    whereChannel: ({ channelId }) => `in <#${channelId}>`,
    whereHere: 'in this channel',
    cadenceAuto: ({ where }) => `Rounds appear on their own during the day, at random times, ${where}.`,
    cadenceManual: ({ gameId, where }) => `Anyone can open a round with \`/${gameId} start\` ${where}.`,
  },

  channelGone: "The round's channel no longer exists.",
  roundInProgress: ({ link }) => `A round is already running: ${link}`,
  cancelledDefault: 'Round cancelled.',
  cancelledBy: ({ user }) => `Round cancelled by ${user}.`,

  /** Subcommands of /<game> and their replies. */
  command: {
    start: {
      description: 'Starts a round right now.',
      duration: 'Minutes to submit and to vote (default: the configured values)',
    },
    next: 'Closes the current phase: moves to voting or posts the results.',
    cancel: 'Cancels the running round without awarding points.',
    scores: 'Shows the leaderboard.',
    glossary: 'Shows the latest winning answers.',
    schedule: "Shows today's planned automatic rounds.",
    tutorial: 'Posts the game instructions in this channel (tester role only).',
    test: {
      description: 'Quick test round in this channel (tester role only).',
      duration: ({ minutes }) => `Minutes per phase (default ${minutes})`,
    },
    wrongChannel: ({ game, channelId }) => `${game} only works in <#${channelId}>.`,
    unknownSubcommand: 'Unknown subcommand.',
    cannotSeeChannel: 'I cannot see this channel.',
    started: ({ number, link }) => `Round ${number} started: ${link}`,
    testStarted: ({ game, gameId, minutes, link, bank }) =>
      `${game} test round started (${minutes} min per phase): ${link}${bank}\n` +
      `Use \`/${gameId} next\` to advance phases or \`/${gameId} cancel\` to drop it.`,
    bankNote: ({ size }) => ` · ${size} prompts in the bank`,
    noActiveRound: ({ game, gameId }) => `There is no ${game} round running. Start one with \`/${gameId} start\`.`,
    nextOutcome: {
      voting: 'Submissions closed. Voting is open.',
      finished: 'Submissions closed. Results posted.',
      cancelled: 'Nobody sent anything, the round is cancelled.',
      done: 'Done.',
      votingClosed: 'Voting closed. Results posted.',
    },
    cancelled: 'Round cancelled.',
    scheduleDisabled: ({ game, gameId }) =>
      `Automatic ${game} rounds are disabled (check ${gameId.toUpperCase()}_CHANNEL_ID and GAMES_ROUNDS_PER_DAY in .env).`,
    scheduleLine: ({ time, relative, game }) => `• ${time} (${relative}) · ${game}`,
    scheduleNone: '• None left today. Tomorrow they are drawn again.',
    scheduleSummary: ({ lines, roundsPerDay, start, end, submitMinutes, voteMinutes }) =>
      `**Today's automatic rounds (all games)**\n${lines}\n\n` +
      `Settings: ${roundsPerDay} round(s) a day in total, rotating between games, between ${start}:00 and ${end}:00, ` +
      `${submitMinutes} min to submit and ${voteMinutes} min to vote.`,
    scheduleActive: ({ game, link }) => `\n${game} round in progress: ${link}`,
  },
};

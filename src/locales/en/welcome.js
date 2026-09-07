/** Welcome: the /welcome and /phrases commands, and the phrases drawn for each new member. */
module.exports = {
  command: {
    description: 'Tries out the welcome message.',
    preview: 'Shows a sample welcome message (only you see it).',
    send: 'Posts a welcome message in the welcome channel.',
    user: 'Member to welcome (default: you)',
    channelMissing: 'The configured welcome channel was not found or is not a text channel.',
    sent: ({ url }) => `Welcome message sent: ${url}`,
  },

  phrasesCommand: {
    description: 'Shows every welcome phrase in this channel.',
    header: ({ count }) => `**Welcome phrases (${count}):**`,
  },

  /**
   * Welcome phrases. One is picked at random for each new member.
   *   {user}   -> mention of the new member (this is what notifies them)
   *   {server} -> server name
   */
  phrases: [
    '{user} has appeared at the spawn point. One more mind to unstick people.',
    'Achievement unlocked: {user} joined the support squad. The jam is a little safer now.',
    "Hi {user}! This is where the people who answer questions at 3 a.m. hang out. You're one of us now.",
    "{user} joins {server}. Another pair of hands for other people's purple shaders.",
    'Welcome, {user}. Here "it works on my machine" is a clue to start helping, not an excuse.',
    '{user} joined {server}. No coin needed: help is free here.',
    'Heads up, {server}! {user} just spawned, ready to answer questions.',
    'New co-op session: {user} is on the team. Objective: nobody stays stuck.',
    '{user} arrived just in time: the jam never sleeps and neither do the questions.',
    '{user} just joined. Not even the most stubborn NullReferenceException will resist this team.',
    'Hi {user}! Bring your tricks, your shortcuts and your "I fixed that once". This is where the best answers get distilled.',
    "{user} enters {server}. Remember: someone else's bug is a chance to teach.",
    "{user} joined the party. Now we can clear the jam's dungeon of questions.",
    "Autosave: {user} is now part of the {server} team. Don't quit without saving.",
    'Hi {user}! The final boss here is other people\'s "I don\'t know where to start", and we beat it as a team.',
    "{user} entered the lobby. If you ever fixed a flipped sprite at 4 a.m., you're home.",
    "{user} has appeared. This is where the jam's best answers get distilled, so bring your still.",
    '{user} just connected. Crunch is optional, lending a hand is our thing.',
    "{user}, you've entered the base of operations. Jam rescues are coordinated from here.",
    'New helper NPC... sorry, mentor! {user}, welcome to {server}.',
    "{user} appeared on the map. Side quest available: pick your roles and tell us what you're great at.",
    "{user} has joined. If someone's game crashes, there is now one more person to prevent it.",
    "{user}, the jam starts whenever you want: there's always someone awake here with an answer or a merge conflict.",
    '{user} just joined {server}. Extra life granted to the whole jam.',
    'Loading {user}... 100%. You can now answer, weigh in and show off your solutions.',
    "{user} is here! Someone hand over the FAQ... oh right, we're all writing it together.",
    "{user} has entered. Jam questions don't sit in the backlog here: they get solved and written down.",
    'New connection: {user}. Unity, Godot, Unreal or a custom engine, there is now one more person who suffered it before.',
    'Player ready! {user}, press Start, pick your roles and join the {server} support team.',
    '{user}, in {server} someone else\'s "I can\'t do it" always ends in "I got it". That is the job.',
    '{user} just came in. Less crunch, more community. That is how we help from {server}.',
    '{user} has appeared at the spawn point. No fall damage, we promise.',
    '{user} just loaded the save. Checkpoint reached, no turning back now.',
    'Welcome, {user}. Here "it works on my machine" is not an excuse, it is the start of a good conversation.',
  ],
};

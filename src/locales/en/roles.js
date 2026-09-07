/** Roles: the /role command, the self-assign role menu and the reasons written to the audit log. */
module.exports = {
  command: {
    description: 'Gives a role to a member or takes it away.',
    add: { description: 'Gives a role to a member.', user: 'Who receives the role', role: 'Role to give' },
    remove: { description: 'Takes a role away from a member.', user: 'Who loses the role', role: 'Role to remove' },
    added: ({ role, member }) => `Gave ${role} to ${member}.`,
    alreadyHas: ({ role, member }) => `${member} already has ${role}.`,
    removed: ({ role, member }) => `Removed ${role} from ${member}.`,
    doesNotHave: ({ role, member }) => `${member} does not have ${role}.`,
  },

  /** Reasons shown in the server audit log. */
  reasons: {
    command: ({ action, user }) => `/role ${action} by ${user}`,
    assigned: 'Role given by the bot',
    removed: 'Role removed by the bot',
    toggled: 'Role changed from the role menu',
    autoRole: 'Automatic role on join',
  },

  errors: {
    managed: ({ role }) => `**${role}** is managed by an integration (a bot or a server boost) and cannot be given by hand.`,
    everyone: 'The @everyone role cannot be given.',
    notEditable: ({ role }) =>
      `I cannot manage **${role}**. Make sure I have the **Manage Roles** permission and that ` +
      'my role sits above it in Server Settings > Roles.',
    outranked: ({ role }) => `You can only manage roles below your highest role (**${role}**).`,
  },

  menu: {
    command: {
      description: 'Manages self-assignable role menus.',
      create: {
        description: 'Pick roles from a list and post a menu so members can assign them to themselves.',
        channel: 'Where to post the menu (default: this channel)',
        title: 'Menu title (default: "Pick your roles")',
        text: 'Explanatory text shown under the title',
      },
    },
    defaultTitle: 'Pick your roles',
    defaultDescription: 'Press a button to get a role. Press it again to remove it.',
    cannotSeeChannel: 'I cannot see this channel. Pick one with the `channel` option.',
    missingPermissions: ({ channel }) =>
      `I need the **View Channel**, **Send Messages** and **Embed Links** permissions in ${channel} to post the menu there.`,
    pickerPlaceholder: ({ max }) => `Pick the roles (up to ${max})`,
    pickerIntro: ({ channel }) =>
      `Pick the roles you want in the menu for ${channel}.\n` +
      'Only roles I can manage and that sit below your highest role will be included.',
    guildOnly: 'This menu only works inside a server.',
    setupExpired: 'This setup expired. Run `/rolemenu create` again.',
    channelGone: 'The target channel no longer exists.',
    nothingValid: ({ details }) => `None of the chosen roles can be included:\n${details}`,
    published: ({ channel, url }) => `Role menu posted in ${channel}: ${url}`,
    someSkipped: 'Some roles were left out:',
    invalidButton: 'This button does not belong to a valid role menu.',
    roleGone: 'That role no longer exists. Ask a moderator to create the menu again.',
    nowHave: ({ role }) => `You now have ${role}.`,
    noLongerHave: ({ role }) => `You no longer have ${role}.`,
    problems: {
      everyone: '@everyone cannot be included.',
      managed: ({ role }) => `${role} is managed by an integration and cannot be self-assigned.`,
      aboveBot: ({ role }) => `${role} is above my highest role; move my role above it.`,
      aboveActor: ({ role }) => `${role} is above your highest role, so you cannot offer it.`,
      tooMany: ({ max }) => `Only the first ${max} roles are included (Discord button limit).`,
    },
  },
};

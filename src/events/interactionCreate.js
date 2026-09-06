/**
 * Routes every interaction to the right place:
 *   slash command  -> client.commands
 *   button / menu  -> client.componentHandlers (by customId prefix)
 *   modal submit   -> client.componentHandlers (same prefix convention)
 * and turns errors into a friendly ephemeral reply.
 */
const { Events, MessageFlags } = require('discord.js');
const logger = require('../utils/logger');
const { parseCustomId } = require('../handlers/componentHandler');
const { UserFacingError } = require('../utils/errors');

module.exports = {
  name: Events.InteractionCreate,

  /** @param {import('discord.js').Interaction} interaction */
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        await handleComponent(interaction);
      }
    } catch (error) {
      await reportError(interaction, error);
    }
  },
};

async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`Received unknown command /${interaction.commandName}. Did you run "npm run deploy"?`);
    throw new UserFacingError('Comando desconocido. Puede que haya que volver a registrar los comandos del bot.');
  }
  logger.debug(`/${interaction.commandName} by ${interaction.user.tag}`);
  await command.execute(interaction);
}

async function handleComponent(interaction) {
  const { prefix, args } = parseCustomId(interaction.customId);
  const handler = interaction.client.componentHandlers.get(prefix);
  if (!handler) {
    logger.warn(`No handler for component customId "${interaction.customId}".`);
    return;
  }
  logger.debug(`Component "${interaction.customId}" by ${interaction.user.tag}`);
  await handler.execute(interaction, args);
}

async function reportError(interaction, error) {
  const friendly = error instanceof UserFacingError;
  if (!friendly) logger.error(`Error handling interaction ${interaction.id}:`, error);

  const content = friendly ? error.message : 'Algo salió mal. Inténtalo de nuevo más tarde.';
  const reply = { content, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };

  try {
    if (interaction.deferred || interaction.replied) await interaction.followUp(reply);
    else await interaction.reply(reply);
  } catch (replyError) {
    logger.error('Failed to send error reply:', replyError);
  }
}

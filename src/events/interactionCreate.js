/**
 * Envía cada interacción a su sitio:
 *   comando de barra -> client.commands
 *   botón / menú     -> client.componentHandlers (por el prefijo del customId)
 *   envío de modal   -> client.componentHandlers (misma convención de prefijo)
 * y convierte los errores en una respuesta efímera amable.
 */
const { Events, MessageFlags } = require('discord.js');
const logger = require('../utils/logger');
const { parseCustomId } = require('../handlers/componentHandler');
const { UserFacingError } = require('../utils/errors');

module.exports = {
  name: Events.InteractionCreate,

  /** @param {import('discord.js').Interaction} interaction */
  async execute(interaction) {
    if (isDuplicate(interaction)) return;
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

// Discord entrega cada interacción una sola vez, pero tras una reconexión del gateway puede
// repetir alguna. Se recuerdan los ids recientes para no responder dos veces a la misma.
const SEEN_TTL_MS = 15 * 60 * 1000;
const seen = new Map();

function isDuplicate(interaction) {
  const now = Date.now();
  for (const [id, at] of seen) if (now - at > SEEN_TTL_MS) seen.delete(id);
  if (seen.has(interaction.id)) {
    logger.warn('Interaction ' + interaction.id + ' was delivered twice; ignoring the repeat.');
    return true;
  }
  seen.set(interaction.id, now);
  return false;
}

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
  // 40060: otra copia del bot, conectada con el mismo token, respondió antes a esta interacción.
  if (error?.code === 40060) {
    let detail = '';
    try {
      const original = await interaction.fetchReply();
      const text = original.content || original.embeds?.[0]?.title || '(sin texto)';
      detail = ' That reply says: "' + text.slice(0, 120) + '".';
    } catch { /* no se pudo leer la respuesta ajena */ }
    logger.warn(
      'Another copy of this bot answered interaction ' + interaction.id + ' first (Discord error 40060).' + detail + ' Run a single instance.',
    );
    return;
  }

  const isUserFacing = error instanceof UserFacingError;
  if (!isUserFacing) logger.error(`Error handling interaction ${interaction.id}:`, error);

  const content = isUserFacing ? error.message : 'Algo salió mal. Inténtalo de nuevo más tarde.';
  const reply = { content, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };

  try {
    if (interaction.deferred || interaction.replied) await interaction.followUp(reply);
    else await interaction.reply(reply);
  } catch (replyError) {
    logger.error('Failed to send error reply:', replyError);
  }
}

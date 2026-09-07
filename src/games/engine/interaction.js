/**
 * Crea el manejador de botones y modal de un juego. CustomIds (prefijo = id del juego):
 *   <juego>:submit:<roundId>        botón   -> abre el modal de respuesta
 *   <juego>:modal:<roundId>         modal   -> respuesta enviada
 *   <juego>:pick:<roundId>:<index>  botón   -> elige una opción (modo choice)
 *   <juego>:openvote:<roundId>      botón   -> quien organiza cierra los envíos
 *   <juego>:vote:<roundId>:<index>  botón   -> vota una respuesta
 *   <juego>:finish:<roundId>        botón   -> quien organiza cierra la votación
 */
const { MessageFlags } = require('discord.js');
const engine = require('./roundEngine');
const messages = require('./messages');
const { UserFacingError } = require('../../utils/errors');

const EPHEMERAL = { flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };

function parseIndex(value, s) {
  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0) throw new UserFacingError(s.badOption);
  return index;
}

function createGameHandler(game) {
  /**
   * @param {import('discord.js').MessageComponentInteraction | import('discord.js').ModalSubmitInteraction} interaction
   * @param {string[]} args
   */
  async function execute(interaction, [action, roundId, extra]) {
    const s = messages.strings(game);
    if (!interaction.inCachedGuild()) throw new UserFacingError(s.guildOnly);

    const round = engine.getRound(game, interaction.guildId, roundId);
    if (!round) throw new UserFacingError(s.noRound);

    switch (action) {
      case engine.ACTIONS.SUBMIT:
        if (!interaction.isButton()) return;
        if (round.phase !== engine.PHASE.SUBMITTING) throw new UserFacingError(s.closed);
        await interaction.showModal(messages.modal(game, round, engine.MODAL_FIELD, engine.settingsOf(game).answer));
        return;

      case engine.ACTIONS.MODAL: {
        if (!interaction.isModalSubmit()) return;
        const text = interaction.fields.getTextInputValue(engine.MODAL_FIELD);
        const { replaced } = await engine.submit(round, interaction.user.id, text);
        await interaction.reply({ content: replaced ? s.submitUpdated : s.submitReceived, ...EPHEMERAL });
        return;
      }

      case engine.ACTIONS.PICK: {
        if (!interaction.isButton()) return;
        const index = parseIndex(extra, s);
        const { changed } = await engine.pick(round, interaction.user.id, index);
        const letter = messages.LETTERS[index] ?? String(index + 1);
        await interaction.reply({ content: changed ? s.pickChanged(letter) : s.pickReceived(letter), ...EPHEMERAL });
        return;
      }

      case engine.ACTIONS.OPEN_VOTE:
        if (!interaction.isButton()) return;
        engine.assertCanManage(round, interaction.member);
        await interaction.deferUpdate();
        await engine.closeSubmissions(round);
        return;

      case engine.ACTIONS.VOTE: {
        if (!interaction.isButton()) return;
        const index = parseIndex(extra, s);
        const { changed } = await engine.vote(round, interaction.user.id, index);
        await interaction.reply({
          content: changed ? `Voto cambiado a la opción ${index + 1}.` : `Voto registrado: opción ${index + 1}.`,
          ...EPHEMERAL,
        });
        return;
      }

      case engine.ACTIONS.FINISH:
        if (!interaction.isButton()) return;
        engine.assertCanManage(round, interaction.member);
        await interaction.deferUpdate();
        await engine.finishRound(round);
        return;

      default:
        return;
    }
  }

  return { prefix: game.id, execute };
}

module.exports = { createGameHandler };

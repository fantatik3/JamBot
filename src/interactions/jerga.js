/**
 * Botones y modal de "Mata la jerga". CustomIds:
 *   jerga:submit:<roundId>        botón   -> abre el modal de explicación
 *   jerga:modal:<roundId>         modal   -> explicación enviada
 *   jerga:openvote:<roundId>      botón   -> el anfitrión cierra los envíos
 *   jerga:vote:<roundId>:<index>  botón   -> vota una explicación
 *   jerga:finish:<roundId>        botón   -> el anfitrión cierra la votación
 */
const { MessageFlags } = require('discord.js');
const jerga = require('../services/jergaService');
const { UserFacingError } = require('../utils/errors');

const EPHEMERAL = { flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };

module.exports = {
  prefix: jerga.PREFIX,

  /**
   * @param {import('discord.js').MessageComponentInteraction | import('discord.js').ModalSubmitInteraction} interaction
   * @param {string[]} args
   */
  async execute(interaction, [action, roundId, extra]) {
    if (!interaction.inCachedGuild()) {
      throw new UserFacingError('Este juego solo funciona dentro de un servidor.');
    }

    const round = jerga.getRound(interaction.guildId, roundId);
    if (!round) {
      throw new UserFacingError('Esta ronda ya terminó.');
    }

    switch (action) {
      case jerga.ACTIONS.SUBMIT:
        if (!interaction.isButton()) return;
        if (round.phase !== jerga.PHASE.SUBMITTING) {
          throw new UserFacingError('Los envíos de esta ronda ya están cerrados.');
        }
        await interaction.showModal(jerga.buildModal(round));
        return;

      case jerga.ACTIONS.MODAL: {
        if (!interaction.isModalSubmit()) return;
        const text = interaction.fields.getTextInputValue(jerga.MODAL_FIELD);
        const { replaced } = await jerga.submit(round, interaction.user.id, text);
        await interaction.reply({
          content: replaced ? 'Explicación actualizada.' : 'Explicación recibida. Se mostrará de forma anónima en la votación.',
          ...EPHEMERAL,
        });
        return;
      }

      case jerga.ACTIONS.OPEN_VOTE: {
        if (!interaction.isButton()) return;
        jerga.assertCanManage(round, interaction.member);
        await interaction.deferUpdate();
        await jerga.openVoting(round);
        return;
      }

      case jerga.ACTIONS.VOTE: {
        if (!interaction.isButton()) return;
        const index = Number.parseInt(extra, 10);
        if (Number.isNaN(index)) throw new UserFacingError('Esa opción no existe.');
        const { changed } = await jerga.vote(round, interaction.user.id, index);
        await interaction.reply({
          content: changed ? `Voto cambiado a la explicación ${index + 1}.` : `Voto registrado: explicación ${index + 1}.`,
          ...EPHEMERAL,
        });
        return;
      }

      case jerga.ACTIONS.FINISH: {
        if (!interaction.isButton()) return;
        jerga.assertCanManage(round, interaction.member);
        await interaction.deferUpdate();
        await jerga.finishRound(round);
        return;
      }

      default:
        return;
    }
  },
};

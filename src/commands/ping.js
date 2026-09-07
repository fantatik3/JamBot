const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { t } = require('../i18n');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription(t('common.ping.description')),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: t('common.ping.measuring'),
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });
    const roundtrip = sent.resource.message.createdTimestamp - interaction.createdTimestamp;
    const gateway = Math.round(interaction.client.ws.ping);
    await interaction.editReply(t('common.ping.result', { roundtrip, gateway }));
  },
};

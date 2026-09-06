const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Comprueba que el bot está en línea.'),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Calculando...',
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });
    const roundtrip = sent.resource.message.createdTimestamp - interaction.createdTimestamp;
    const gateway = Math.round(interaction.client.ws.ping);
    await interaction.editReply(`¡Pong! Ida y vuelta: **${roundtrip} ms** · Conexión: **${gateway} ms**`);
  },
};

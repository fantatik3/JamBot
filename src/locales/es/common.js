/** Textos generales: estado del bot, errores comunes y /ping. */
module.exports = {
  presence: 'Dando la bienvenida a los nuevos miembros',
  somethingWentWrong: 'Algo salió mal. Inténtalo de nuevo más tarde.',
  unknownCommand: 'Comando desconocido. Puede que haya que volver a registrar los comandos del bot.',
  notAMember: 'Ese usuario no es miembro de este servidor.',
  envMissing: ({ name }) => `${name} no está definido en el archivo .env.`,
  testerRoleOnly: ({ roleId }) => `Este comando solo está disponible para el rol <@&${roleId}>.`,

  ping: {
    description: 'Comprueba que el bot está en línea.',
    measuring: 'Calculando...',
    result: ({ roundtrip, gateway }) => `¡Pong! Ida y vuelta: **${roundtrip} ms** · Conexión: **${gateway} ms**`,
  },
};

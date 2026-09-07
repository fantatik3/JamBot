/** Roles: comando /role, menú de roles autoasignables y motivos que quedan en el registro de auditoría. */
module.exports = {
  command: {
    description: 'Asigna o quita un rol a un miembro.',
    add: { description: 'Da un rol a un miembro.', user: 'Quién recibe el rol', role: 'Rol a asignar' },
    remove: { description: 'Quita un rol a un miembro.', user: 'Quién pierde el rol', role: 'Rol a quitar' },
    added: ({ role, member }) => `Se asignó ${role} a ${member}.`,
    alreadyHas: ({ role, member }) => `${member} ya tiene ${role}.`,
    removed: ({ role, member }) => `Se quitó ${role} a ${member}.`,
    doesNotHave: ({ role, member }) => `${member} no tiene ${role}.`,
  },

  /** Motivos que aparecen en el registro de auditoría del servidor. */
  reasons: {
    command: ({ action, user }) => `/role ${action} por ${user}`,
    assigned: 'Rol asignado por el bot',
    removed: 'Rol quitado por el bot',
    toggled: 'Rol cambiado desde el menú de roles',
    autoRole: 'Rol automático al unirse',
  },

  errors: {
    managed: ({ role }) => `**${role}** lo gestiona una integración (bot o mejora de servidor) y no se puede asignar a mano.`,
    everyone: 'El rol @everyone no se puede asignar.',
    notEditable: ({ role }) =>
      `No puedo gestionar **${role}**. Asegúrate de que tengo el permiso **Gestionar roles** y de que ` +
      'mi rol está por encima de él en Ajustes del servidor > Roles.',
    outranked: ({ role }) => `Solo puedes gestionar roles por debajo de tu rol más alto (**${role}**).`,
  },

  menu: {
    command: {
      description: 'Gestiona los menús de roles autoasignables.',
      create: {
        description: 'Elige roles de una lista y publica un menú para que los miembros se los asignen.',
        channel: 'Dónde publicar el menú (por defecto, este canal)',
        title: 'Título del menú (por defecto: "Elige tus roles")',
        text: 'Texto explicativo que aparece bajo el título',
      },
    },
    defaultTitle: 'Elige tus roles',
    defaultDescription: 'Pulsa un botón para activar un rol. Vuelve a pulsarlo para quitártelo.',
    cannotSeeChannel: 'No puedo ver este canal. Indica uno con la opción `channel`.',
    missingPermissions: ({ channel }) =>
      `Necesito los permisos **Ver canal**, **Enviar mensajes** e **Insertar enlaces** en ${channel} para publicar el menú ahí.`,
    pickerPlaceholder: ({ max }) => `Elige los roles (hasta ${max})`,
    pickerIntro: ({ channel }) =>
      `Elige los roles que quieres incluir en el menú de ${channel}.\n` +
      'Solo se incluirán los que yo pueda gestionar y que estén por debajo de tu rol más alto.',
    guildOnly: 'Este menú solo funciona dentro de un servidor.',
    setupExpired: 'Esta configuración caducó. Vuelve a ejecutar `/rolemenu create`.',
    channelGone: 'El canal de destino ya no existe.',
    nothingValid: ({ details }) => `Ninguno de los roles elegidos se puede incluir:\n${details}`,
    published: ({ channel, url }) => `Menú de roles publicado en ${channel}: ${url}`,
    someSkipped: 'Algunos roles se omitieron:',
    invalidButton: 'Este botón no pertenece a un menú de roles válido.',
    roleGone: 'Ese rol ya no existe. Pide a un moderador que cree el menú de nuevo.',
    nowHave: ({ role }) => `Ahora tienes ${role}.`,
    noLongerHave: ({ role }) => `Ya no tienes ${role}.`,
    problems: {
      everyone: '@everyone no se puede incluir.',
      managed: ({ role }) => `${role} lo gestiona una integración y no se puede autoasignar.`,
      aboveBot: ({ role }) => `${role} está por encima de mi rol más alto; mueve mi rol por encima de él.`,
      aboveActor: ({ role }) => `${role} está por encima de tu rol más alto, así que no puedes ofrecerlo.`,
      tooMany: ({ max }) => `Solo se incluyen los primeros ${max} roles (límite de botones de Discord).`,
    },
  },
};

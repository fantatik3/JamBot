# JamBot

[English version](README.en.md)

Bot de Discord para el servidor de mentores de Tranki Jam, hecho con [discord.js v14](https://discord.js.org/).

Da la bienvenida a los miembros nuevos con una frase aleatoria, deja que cada cual elija sus roles desde
un menú de botones, ofrece a los moderadores un comando para asignar roles y organiza "Mata la jerga",
un juego al estilo Tabú en el que hay que explicar un término de desarrollo de videojuegos sin usar las
palabras prohibidas.

Todo lo que el bot dice en Discord está en español. Los nombres de los comandos, como `/role` o
`/rolemenu`, se quedan en inglés.

## Estructura del proyecto

```
src/
├── index.js                  # Punto de entrada: conecta todo e inicia sesión
├── client.js                 # Crea el cliente de Discord (intents, partials)
├── deploy-commands.js        # Registra los comandos de barra en Discord (npm run deploy)
├── config/
│   ├── index.js              # Carga y valida .env
│   ├── jergaTerms.js         # Términos y palabras prohibidas de Mata la jerga
│   └── welcomePhrases.js     # Frases de bienvenida
├── commands/                 # Un archivo por comando de barra
│   ├── jerga.js              # /jerga start|next|cancel|scores|glossary|schedule|tutorial
│   ├── phrases.js            # /phrases                         (rol de PREVIEW_ROLE_ID)
│   ├── ping.js               # /ping
│   ├── role.js               # /role add|remove <user> <role>   (Gestionar roles)
│   ├── rolemenu.js           # /rolemenu create                 (Gestionar roles)
│   └── welcome.js            # /welcome preview|send            (Gestionar servidor)
├── events/                   # Un archivo por evento del gateway
│   ├── ready.js
│   ├── guildMemberAdd.js     # Mensaje de bienvenida y rol automático
│   └── interactionCreate.js  # Reparte comandos, botones y modales
├── interactions/             # Manejadores de botones, menús y modales, por prefijo del customId
│   ├── jerga.js              # Botones y modal de Mata la jerga
│   └── roleMenu.js           # rolemenu:setup (selector de roles) y rolemenu:toggle:<roleId>
├── handlers/                 # Cargadores de comandos, eventos y componentes
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── componentHandler.js
├── services/                 # Lógica compartida por comandos y eventos
│   ├── jergaScheduler.js     # Inicia rondas de jerga automáticamente a horas aleatorias
│   ├── jergaService.js       # Rondas, votación, puntos y glosario de Mata la jerga
│   ├── roleMenuService.js    # Valida los roles elegidos y construye el menú
│   ├── roleService.js        # Añade, quita y alterna roles con comprobación de jerarquía
│   └── welcomeService.js     # Construye el mensaje de bienvenida
└── utils/
    ├── errors.js             # UserFacingError, seguro de mostrar a la gente
    ├── logger.js
    ├── random.js
    ├── store.js              # Persistencia JSON (data/store.json)
    └── text.js
```

## Puesta en marcha

### 1. Crea el bot en el Portal de desarrolladores de Discord

1. Entra en <https://discord.com/developers/applications> y pulsa New Application.
2. En General Information, copia el Application ID. Eso es `CLIENT_ID`.
3. En la pestaña Bot, pulsa Reset Token y copia el token. Eso es `DISCORD_TOKEN`. Solo se muestra una vez.
4. En esa misma pestaña, dentro de Privileged Gateway Intents, activa Server Members Intent.
   Sin él, el bot nunca se entera de que alguien entra y no puede darle la bienvenida.
5. En la pestaña Installation (o en OAuth2 > URL Generator), marca los scopes `bot` y
   `applications.commands` y estos permisos: Ver canales, Enviar mensajes, Insertar enlaces,
   Leer el historial de mensajes y Gestionar roles. O usa esta URL con tu propio client id:

   ```
   https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&scope=bot%20applications.commands&permissions=268520448
   ```

6. Abre la URL e invita al bot a tu servidor.

### 2. Jerarquía de roles

Discord solo deja que un bot gestione los roles que están por debajo del suyo. En Ajustes del servidor >
Roles, arrastra el rol del bot por encima de todos los roles que deba repartir: los autoasignables, el
rol automático y cualquiera que los moderadores vayan a asignar con `/role`.

### 3. IDs que necesitas

Activa el Modo desarrollador en Discord (Ajustes de usuario > Avanzado). Luego, con clic derecho, copia
el ID de:

- tu servidor, para `GUILD_ID`
- el canal de bienvenida, para `WELCOME_CHANNEL_ID`
- el canal del juego, para `JERGA_CHANNEL_ID`
- opcionalmente un rol, para `AUTO_ROLE_ID` y `PREVIEW_ROLE_ID`

### 4. Configura

```bash
cp .env.example .env      # y rellena los valores
```

Las frases de bienvenida están en [`src/config/welcomePhrases.js`](src/config/welcomePhrases.js).
`{user}` se convierte en la mención y `{server}` en el nombre del servidor.

### 5. Instala, registra los comandos y arranca

En Windows, ejecuta `install.bat` (instala las dependencias y registra los comandos de barra) y después
`run.bat` (arranca el bot; deja la ventana abierta).

Desde una terminal:

```bash
npm install
npm run deploy    # registra los comandos de barra (al instante si GUILD_ID está definido)
npm start         # o: npm run dev, que se reinicia al cambiar un archivo
```

Vuelve a ejecutar `npm run deploy` cada vez que añadas o cambies la definición de un comando. Ejecuta una
sola instancia del bot: dos copias con el mismo token responden a las mismas interacciones y se pisan.

## Comandos

| Comando | Quién | Qué hace |
|---|---|---|
| `/rolemenu create [channel] [title] [description]` | Gestionar roles | Abre un selector de roles; los que marques se convierten en un menú de botones en el canal. |
| `/role add <user> <role>` | Gestionar roles | Da un rol a alguien. |
| `/role remove <user> <role>` | Gestionar roles | Quita un rol. |
| `/welcome preview` | Gestionar servidor | Te muestra un mensaje de bienvenida de ejemplo (solo lo ves tú). |
| `/welcome send [user]` | Gestionar servidor | Publica un mensaje de bienvenida real en el canal de bienvenida. |
| `/phrases` | Rol de `PREVIEW_ROLE_ID` | Publica todas las frases de bienvenida, numeradas, en el canal actual (sin notificar). |
| `/jerga start [duration]` | Todo el mundo | Empieza una ronda ahora mismo (solo en el canal del juego). |
| `/jerga schedule` | Todo el mundo | Muestra las rondas automáticas de hoy. |
| `/jerga tutorial` | Todo el mundo | Publica las instrucciones del juego para todo el mundo. |
| `/jerga next` / `/jerga cancel` | Anfitrión o Gestionar mensajes | Pasa a votación o resultados, o cancela la ronda. |
| `/jerga scores` / `/jerga glossary` | Todo el mundo | Clasificación y últimas explicaciones ganadoras. |
| `/ping` | Todo el mundo | Comprueba la latencia. |

El menú de roles es un mensaje normal. Se queda en el canal y sigue funcionando tras un reinicio porque
cada botón lleva el id del rol en su `customId`. Para cambiar los roles, ejecuta `/rolemenu create` otra
vez y borra el mensaje antiguo. Puedes publicar varios menús, por ejemplo uno por disciplina. Solo se
pueden ofrecer roles por debajo del bot y de quien crea el menú.

## Mata la jerga

1. Una ronda publica un término y cinco palabras prohibidas. La gente pulsa "Enviar explicación" y
   escribe hasta 280 caracteres. El bot rechaza cualquier texto que use el término o una palabra
   prohibida, ignorando mayúsculas, acentos y plurales.
2. Cuando acaba el tiempo, o quien organiza pulsa "Cerrar envíos y votar", las explicaciones se muestran
   de forma anónima y en orden aleatorio con botones de voto numerados. No puedes votar la tuya.
3. Cuando acaba la votación, se anuncia y se menciona a quien gana. Ganar da 3 puntos y participar 1.
   Los empates se reparten y, si nadie vota, se elige una explicación al azar. La explicación ganadora
   entra en el glosario.

Los términos están en [`src/config/jergaTerms.js`](src/config/jergaTerms.js). Los puntos, el glosario y
las rondas en curso se guardan en `data/store.json`, así que un reinicio los conserva y retoma los
temporizadores.

### Rondas automáticas

Con `JERGA_CHANNEL_ID` definido, el juego solo funciona en ese canal y el bot inicia rondas por su cuenta.

| Variable | Por defecto | Significado |
|---|---|---|
| `JERGA_CHANNEL_ID` | (ninguno) | Canal donde se publican las rondas. Sin definir, no hay rondas automáticas y los comandos funcionan en cualquier canal. |
| `JERGA_ROUNDS_PER_DAY` | 6 | Horas de inicio aleatorias al día. 0 desactiva la automatización. Con rondas de 3 horas, caben como mucho 8 al día. |
| `JERGA_ACTIVE_HOURS` | 0-24 | Las rondas solo empiezan dentro de esta franja, en la hora local de la máquina que ejecuta el bot. |
| `JERGA_SUBMIT_MINUTES` | 120 | Tiempo para enviar explicaciones. |
| `JERGA_VOTE_MINUTES` | 60 | Tiempo que dura la votación. |
| `JERGA_ROUND_ON_START` | false | Publica también una ronda en cuanto el bot inicia sesión. Útil mientras se prueba. |

Cada día el bot sortea las horas de inicio una vez, las reparte para que las rondas no se solapen y
guarda el plan para que un reinicio lo conserve. Las rondas automáticas las organiza el bot; quien tenga
Gestionar mensajes puede usar `/jerga next` o `/jerga cancel` con ellas.

## Ampliar el bot

Para añadir un comando de barra, crea un archivo en `src/commands/` que exporte `{ data, execute }` y
ejecuta `npm run deploy`. Los eventos van en `src/events/` y exportan `{ name, once?, execute }`. Los
botones, menús y modales van en `src/interactions/` y exportan `{ prefix, execute }`, con customIds
construidos como `prefix:arg1:arg2` mediante `buildCustomId()` de `handlers/componentHandler.js`.

Lanza `UserFacingError` para cualquier mensaje que deba leer la gente. Cualquier otro error se registra
en el log y se sustituye por un mensaje genérico.

## Problemas frecuentes

No llegan mensajes de bienvenida: el Server Members Intent está desactivado, `WELCOME_CHANNEL_ID` está
mal o el bot no puede ver ni escribir en ese canal.

"No puedo gestionar <rol>": el rol del bot está por debajo de ese rol o le falta Gestionar roles.

Faltan comandos de barra o responden "Comando desconocido": ejecuta `npm run deploy` y reinicia el bot.
Los comandos globales (sin `GUILD_ID`) pueden tardar hasta una hora en aparecer.

Los botones dicen "Esta interacción falló" o una ronda aparece como terminada nada más publicarse: el
bot está apagado, se ha caído o hay una segunda copia ejecutándose en otro sitio. Revisa la consola y
mantén una sola instancia.

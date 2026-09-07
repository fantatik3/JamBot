# JamBot

[English version](README.en.md)

Bot de Discord para el servidor de mentores de Tranki Jam, hecho con [discord.js v14](https://discord.js.org/).

Da la bienvenida a los miembros nuevos con una frase aleatoria, deja que cada cual elija sus roles desde
un menú de botones, ofrece a los moderadores un comando para asignar roles y organiza seis juegos cortos
para mentores, desde explicar un término sin jerga hasta encontrar un fallo escondido en el código.

Todo lo que el bot dice en Discord está en español. Los nombres de los comandos, como `/role` o
`/rolemenu`, se quedan en inglés.

## Estructura del proyecto

```
src/
├── index.js                  # Punto de entrada: conecta todo e inicia sesión
├── client.js                 # Crea el cliente de Discord (intents, partials)
├── deploy-commands.js        # Registra los comandos de barra en Discord (npm run deploy)
├── i18n.js                   # t(clave) devuelve el texto en el idioma de BOT_LANGUAGE
├── config/
│   └── index.js              # Carga y valida .env
├── locales/                  # Todo lo que dice el bot, una carpeta por idioma
│   ├── index.js              # Idiomas disponibles (es, en)
│   ├── es/                   # common.js, roles.js, welcome.js (con las frases), engine.js, games/<juego>.js
│   └── en/                   # Lo mismo en inglés
├── games/                    # Una carpeta por juego educativo
│   ├── index.js              # Registro: añade aquí un juego y aparecen su comando, botones y rondas
│   ├── engine/               # Motor de rondas compartido
│   │   ├── roundEngine.js    # Envíos, votación, puntos, glosario, temporizadores, almacén
│   │   ├── messages.js       # Embeds, botones y modal; los textos salen de locales/
│   │   ├── command.js        # Construye /<juego> start|next|cancel|scores|glossary|schedule|tutorial
│   │   └── interaction.js    # Construye el manejador de botones y modal de un juego
│   ├── jerga/                # Mata la jerga: index.js + terms.js
│   ├── triaje/               # Triaje: index.js + scenarios.js
│   ├── nombralo/             # Nómbralo: index.js + items.js
│   ├── scope/                # Scope it: index.js + features.js
│   ├── bugs/                 # Caza el bug: index.js + snippets/ (un archivo por lenguaje)
│   ├── smells/               # Huele mal: index.js + snippets/ (un archivo por lenguaje)
│   └── trivia/               # Trivia por disciplina: index.js + questions/ (un archivo por disciplina)
├── commands/                 # Comandos de barra
│   ├── games.js              # Un comando por juego registrado
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
│   ├── games.js              # Un manejador por juego registrado
│   └── roleMenu.js           # rolemenu:setup (selector de roles) y rolemenu:toggle:<roleId>
├── handlers/                 # Cargadores de comandos, eventos y componentes
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── componentHandler.js
├── services/                 # Lógica compartida por comandos y eventos
│   ├── gameScheduler.js      # Inicia rondas automáticamente, rotando entre juegos
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
- un canal por juego, para `JERGA_CHANNEL_ID`, `TRIAJE_CHANNEL_ID`, `NOMBRALO_CHANNEL_ID`, `SCOPE_CHANNEL_ID`,
  `BUGS_CHANNEL_ID` y `TRIVIA_CHANNEL_ID`
- opcionalmente un rol, para `AUTO_ROLE_ID` y `PREVIEW_ROLE_ID`

### 4. Configura

```bash
cp .env.example .env      # y rellena los valores
```

Con `BOT_LANGUAGE` se elige el idioma de todo lo que dice el bot: `es` (por defecto) o `en`. Los textos
viven en `src/locales/<idioma>/`; las frases de bienvenida están en `welcome.js` de cada idioma, donde
`{user}` se convierte en la mención y `{server}` en el nombre del servidor. Tras cambiar el idioma, ejecuta
`npm run deploy` para que las descripciones de los comandos se registren en el idioma nuevo.

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
| `/<juego> start [duration]` | Todo el mundo | Empieza una ronda de ese juego ahora mismo (solo en el canal de ese juego). |
| `/<juego> next` / `/<juego> cancel` | Anfitrión o Gestionar mensajes | Pasa a votación o resultados, o cancela la ronda. |
| `/<juego> scores` / `/<juego> glossary` | Todo el mundo | Clasificación con los puntos de todos los juegos; últimas respuestas ganadoras de ese juego. |
| `/<juego> schedule` | Todo el mundo | Rondas automáticas de hoy. |
| `/<juego> tutorial` | Rol de `PREVIEW_ROLE_ID` | Publica las instrucciones para todo el mundo en el canal actual, sea cual sea. |
| `/<juego> test [duration]` | Rol de `PREVIEW_ROLE_ID` | Ronda corta de prueba en el canal actual, sea cual sea. |
| `/ping` | Todo el mundo | Comprueba la latencia. |

`<juego>` es uno de jerga, triaje, nombralo, scope, bugs o trivia.

El menú de roles es un mensaje normal. Se queda en el canal y sigue funcionando tras un reinicio porque
cada botón lleva el id del rol en su `customId`. Para cambiar los roles, ejecuta `/rolemenu create` otra
vez y borra el mensaje antiguo. Puedes publicar varios menús, por ejemplo uno por disciplina. Solo se
pueden ofrecer roles por debajo del bot y de quien crea el menú.

## Juegos

Todos los juegos usan el mismo motor: se publica una consigna en el canal del juego, la gente responde, quien
gana recibe puntos y la respuesta ganadora va al glosario de ese juego. Las rondas empiezan solas a lo largo del
día, rotando entre juegos, cada una en su canal, con una ronda por canal como máximo. Hay tres tipos de ronda:

- Votación: las respuestas se envían con un formulario, se muestran de forma anónima y en orden aleatorio, y
  se vota la mejor. Los empates se reparten y, si nadie vota, se elige una al azar.
- Juez: las respuestas se envían con un formulario y el juego decide quién gana con una regla, sin votación.
- Opciones: la pregunta trae opciones con letra y se pulsa una. Gana quien acierta.

| Juego | Comando | Ronda | Qué haces |
|---|---|---|---|
| Mata la jerga | `/jerga` | Votación | Explicar un término de desarrollo sin usar cinco palabras prohibidas. 255 términos. |
| Triaje | `/triaje` | Votación | Leer el mensaje vago de alguien atascado y escribir las tres preguntas que harías primero. 130 casos. |
| Nómbralo | `/nombralo` | Votación | Proponer el nombre más claro para una variable, función, clase o asset descrito. 150 casos. |
| Scope it | `/scope` | Juez | Estimar las horas que lleva una tarea de jam; gana quien más se acerca a la mediana del grupo. 120 tareas. |
| Caza el bug | `/bugs` | Votación | Encontrar el fallo escondido en un fragmento corto de C#, GDScript, JavaScript, C++, GLSL o Python. La solución se revela con los resultados. 188 fragmentos, al menos 30 por lenguaje. |
| Huele mal | `/smells` | Votación | Leer un fragmento que funciona pero está mal escrito y decir qué cambiarías y por qué. Lo que cambiaría el bot se revela con los resultados. 180 fragmentos, 30 por lenguaje. |
| Trivia por disciplina | `/trivia` | Opciones | Una pregunta con cuatro opciones de programación, arte, audio, diseño, narrativa o producción, con explicación. 202 preguntas. |

Todos los juegos tienen los mismos subcomandos: `start`, `next`, `cancel`, `scores`, `glossary`, `schedule`,
`tutorial` y `test`. Los puntos se comparten entre juegos, así que `scores` muestra una sola clasificación; los
glosarios son de cada juego. `tutorial` y `test` están reservados al rol de pruebas y funcionan en cualquier canal.

`/<juego> test [duration]` es para el rol de pruebas definido en `PREVIEW_ROLE_ID`. Empieza una ronda corta, de
2 minutos por fase por defecto, en el canal donde se ejecute, para probar un juego fuera de su canal.
`next` y `cancel` funcionan con ella como siempre.

Los bancos de cada juego están en su carpeta, en `src/games/<id>/`. Los puntos, los glosarios y las rondas en
curso de todos los juegos se guardan en `data/store.json`, así que un reinicio los conserva y retoma los
temporizadores.

### Rondas automáticas

Cada juego tiene su propio canal, definido con `<ID>_CHANNEL_ID` (por ejemplo `TRIAJE_CHANNEL_ID`). Un juego solo
responde a sus comandos en su canal y sus rondas automáticas se publican ahí. `GAMES_CHANNEL_ID` es un canal por
defecto opcional para los juegos sin variable propia; un juego sin ninguno de los dos no tiene rondas automáticas
y responde a sus comandos en cualquier canal. Las rondas automáticas rotan entre los juegos que tienen canal.

| Variable | Por defecto | Significado |
|---|---|---|
| `JERGA_CHANNEL_ID`, `TRIAJE_CHANNEL_ID`, ... | (ninguno) | Canal de cada juego: sus comandos solo funcionan ahí y sus rondas se publican ahí. |
| `GAMES_CHANNEL_ID` | (ninguno) | Canal por defecto para los juegos sin variable propia. |
| `GAMES_ROUNDS_PER_DAY` | 6 | Horas de inicio aleatorias al día, repartidas entre todos los juegos en rotación (6 es una ronda de cada juego). 0 desactiva la automatización. |
| `GAMES_ACTIVE_HOURS` | 0-24 | Las rondas solo empiezan dentro de esta franja, en la hora local de la máquina que ejecuta el bot. |
| `GAMES_SUBMIT_MINUTES` | 120 | Tiempo para enviar explicaciones. |
| `GAMES_VOTE_MINUTES` | 60 | Tiempo que dura la votación. |
| `GAMES_ROUND_ON_START` | false | Qué publicar al arrancar el bot: `false` nada, `true` una ronda (el siguiente juego de la rotación), `all` una ronda de cada juego en su canal. Útil para probar. |
| `GAMES_ROUND_ON_START_MINUTES` | (ninguno) | Minutos por fase de esas rondas de arranque. Vacío usa las duraciones normales. |

Cada día el bot sortea las horas de inicio una vez, las reparte para que las rondas no se solapen y
guarda el plan para que un reinicio lo conserve. Las rondas automáticas las organiza el bot; quien tenga
Gestionar mensajes puede usar `/jerga next` o `/jerga cancel` con ellas.

## Ampliar el bot

### Añadir un juego

Cada juego vive en su propia carpeta dentro de `src/games/` y comparte el motor de rondas: se publica
una consigna, la gente responde con un formulario, las respuestas se votan de forma anónima, quien gana
recibe puntos y la respuesta va al glosario. Para añadir uno:

1. Copia `src/games/jerga/` a `src/games/<id>/` y edita `index.js`: el id es el nombre del comando
   (`/<id>`) y el prefijo de los customId; `pickPrompt` elige qué se plantea, `promptBody` lo muestra y
   `validateAnswer` rechaza respuestas no válidas.
2. Crea `src/locales/es/games/<id>.js` (y su equivalente en `en/`) con el nombre, la descripción, los
   textos y el `tutorial` del juego; el sustantivo de la respuesta y cualquier texto del motor se cambian
   en `strings`. Regístralo en el `index.js` de cada idioma.
3. Añádelo a la lista de `src/games/index.js`.
4. Ejecuta `npm run deploy`.

El comando, los botones, la rotación del planificador, los puntos y el glosario salen solos. Con `mode: 'judge'` y
una función `pickWinners` no hay votación y decide una regla; con `mode: 'choice'` y `options` y `correct` en la
consigna, se responde pulsando una letra.

### Añadir un idioma

Todo lo que dice el bot sale de `src/locales/<código>/` y se elige con `BOT_LANGUAGE` en `.env` (`es` por
defecto, `en` disponible). Para añadir uno:

1. Copia `src/locales/es/` a `src/locales/<código>/` y traduce sus archivos: `common.js`, `roles.js`,
   `welcome.js` (incluye las frases de bienvenida), `engine.js` y `games/<juego>.js`.
2. Regístralo en `src/locales/index.js`.
3. Ejecuta `npm run check:locales` para ver qué claves faltan o sobran respecto al español, y
   `npm run deploy` para registrar las descripciones de los comandos en el idioma nuevo.

Cualquier clave que falte se toma del español y se avisa en el log. Los nombres de los comandos (`/jerga`,
`/triaje`...) no cambian con el idioma, y los bancos de los juegos (términos, casos, preguntas, fragmentos
de código) son contenido en español que tampoco se traduce.

### Otras cosas

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

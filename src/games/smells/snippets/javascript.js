// Fragmentos en JavaScript (juegos de navegador). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'JavaScript';
const F = 'js';

module.exports = [
  {
    key: 'sm-js-var', language: L, fence: F, title: 'var por todas partes',
    code: cs(['var score = 0;', 'var lives = 3;', 'for (var i = 0; i < enemies.length; i++) {', '  var e = enemies[i];', '}']),
    solution: 'var tiene ámbito de función y se puede redeclarar, lo que esconde errores. Usa const por defecto y let cuando el valor cambie; el ámbito de bloque hace lo que uno espera.',
  },
  {
    key: 'sm-js-window-globals', language: L, fence: F, title: 'Estado colgado de window',
    code: cs(['window.score = 0;', 'window.player = { x: 0, y: 0 };', 'window.enemies = [];']),
    solution: 'Cualquier script, incluidas librerías ajenas, puede pisar esas variables. Guarda el estado en un módulo o en un objeto de juego que se pase a quien lo necesite.',
  },
  {
    key: 'sm-js-magic-numbers', language: L, fence: F, title: 'Números sueltos',
    code: cs(['if (player.y > 540) die();', 'enemy.speed = 2.75;', 'if (dist < 48) hit();']),
    solution: 'Nadie sabe qué son 540, 2.75 o 48 sin contexto, y ajustar el juego significa buscarlos por todo el archivo. Constantes con nombre (GROUND_Y, ENEMY_SPEED, HIT_RANGE) o un objeto de configuración.',
  },
  {
    key: 'sm-js-string-state', language: L, fence: F, title: 'Estado en texto',
    code: cs(["let state = 'idle';", "if (state === 'jumping') applyGravity();", "else if (state === 'dashing') keepSpeed();"]),
    solution: 'Un "jumpin" mal escrito no da error, solo un estado que nunca entra. Un objeto congelado State = Object.freeze({ IDLE: 0, JUMPING: 1, DASHING: 2 }) autocompleta y falla ruidosamente.',
  },
  {
    key: 'sm-js-callback-pyramid', language: L, fence: F, title: 'Pirámide de callbacks',
    code: cs(["loadImage('hero.png', (hero) => {", "  loadImage('map.png', (map) => {", "    loadAudio('theme.mp3', (music) => {", '      start(hero, map, music);', '    });', '  });', '});']),
    solution: 'Cada recurso añade un nivel y los errores se pierden por el camino. Con promesas y async/await: const [hero, map, music] = await Promise.all([...]) carga todo a la vez y en tres líneas.',
  },
  {
    key: 'sm-js-loose-equality', language: L, fence: F, title: 'Igualdad floja',
    code: cs(["if (lives == '0') gameOver();", 'if (selected == null) selected = 0;']),
    solution: 'Funciona porque == convierte tipos, pero esa conversión sorprende ("" == 0 es true). Usa === y compara con el tipo correcto; para null y undefined a la vez, selected ?? 0.',
  },
  {
    key: 'sm-js-dom-query-loop', language: L, fence: F, title: 'querySelector en el bucle',
    code: cs(['function update() {', "  document.getElementById('score').textContent = score;", "  document.querySelector('.lives').textContent = lives;", '  requestAnimationFrame(update);', '}']),
    solution: 'Busca en el DOM y reescribe el texto sesenta veces por segundo. Guarda los elementos una vez fuera del bucle y actualízalos solo cuando cambien los valores.',
  },
  {
    key: 'sm-js-long-loop', language: L, fence: F, title: 'El bucle que lo hace todo',
    code: cs(['function update() {', '  // entrada (30 líneas)', '  // física (50 líneas)', '  // colisiones (40 líneas)', '  // dibujo (60 líneas)', '  // interfaz (25 líneas)', '}']),
    solution: 'Doscientas líneas en una función no se pueden leer ni probar por partes. Divide en handleInput, updatePhysics, resolveCollisions, draw y drawHud, y deja update como índice.',
  },
  {
    key: 'sm-js-copy-paste-keys', language: L, fence: F, title: 'Un if por tecla',
    code: cs(["if (key === 'ArrowLeft') player.vx = -SPEED;", "if (key === 'ArrowRight') player.vx = SPEED;", "if (key === 'ArrowUp') player.vy = -SPEED;", "if (key === 'ArrowDown') player.vy = SPEED;"]),
    solution: 'Cuatro bloques iguales que crecerán con cada tecla nueva. Un mapa de tecla a dirección ({ ArrowLeft: [-1, 0], ... }) y una sola línea que lo consulte.',
  },
  {
    key: 'sm-js-bool-flags', language: L, fence: F, title: 'Una bandera por estado',
    code: cs(['let isJumping = false, isFalling = false, isDashing = false, isDead = false;']),
    solution: 'Cuatro booleanos permiten combinaciones que no tienen sentido y cada if tiene que negar los demás. Un solo estado evita saltar y estar muerto a la vez.',
  },
  {
    key: 'sm-js-console-log', language: L, fence: F, title: 'console.log olvidado',
    code: cs(['function update() {', "  console.log('update', player.x, player.y);", '  // ...', '}']),
    solution: 'Sesenta líneas por segundo esconden los mensajes que importan y frenan el juego con la consola abierta. Bórralo o ponlo detrás de un flag DEBUG.',
  },
  {
    key: 'sm-js-god-object', language: L, fence: F, title: 'Un objeto con todo',
    code: cs(['const game = {', '  player: {}, enemies: [], score: 0, ui: {}, audio: {},', '  save() {}, draw() {}, update() {}, loadLevel() {}, playSound() {},', '};']),
    solution: 'Todo el juego en un objeto: cualquier función puede tocar cualquier cosa y no hay forma de cambiar el audio sin abrir el archivo de todo. Separa por responsabilidad (player.js, audio.js, ui.js) y pasa lo que cada parte necesite.',
  },
  {
    key: 'sm-js-hardcoded-url', language: L, fence: F, title: 'URL fija',
    code: cs(["fetch('http://localhost:3000/scores')", '  .then((r) => r.json());']),
    solution: 'Funciona en tu máquina y en ninguna otra. Saca la URL a una constante de configuración que cambie según el entorno.',
  },
  {
    key: 'sm-js-setinterval-loop', language: L, fence: F, title: 'setInterval como game loop',
    code: cs(['setInterval(() => {', '  update();', '  draw();', '}, 16);']),
    solution: 'setInterval no se sincroniza con la pantalla ni se pausa al cambiar de pestaña, y 16 ms no son 60 fps exactos. requestAnimationFrame con delta time da un bucle estable y respetuoso con la batería.',
  },
  {
    key: 'sm-js-nested-ternary', language: L, fence: F, title: 'Ternario anidado',
    code: cs(["const color = hp > 70 ? 'green' : hp > 30 ? 'yellow' : hp > 0 ? 'orange' : 'red';"]),
    solution: 'Se puede leer, pero cuesta, y el siguiente umbral lo hará imposible. Una función healthColor con ifs claros o una tabla de umbrales se entiende a la primera.',
  },
  {
    key: 'sm-js-dead-code', language: L, fence: F, title: 'Código comentado',
    code: cs(['// player.x += 4;', '// if (old) drawOld();', 'player.x += SPEED * dt; // mueve al jugador', '// TODO borrar']),
    solution: 'El código comentado no se ejecuta pero se lee y nadie sabe si es historia o pendiente. Bórralo, git lo recuerda. Y el comentario que repite la línea no aporta.',
  },
  {
    key: 'sm-js-inheritance-reuse', language: L, fence: F, title: 'Heredar para reutilizar',
    code: cs(['class Enemy { move() { /* ... */ } }', 'class Coin extends Enemy {} // solo por move()']),
    solution: 'Una moneda no es un enemigo: hereda vida, daño y IA. Saca el movimiento a una función o un componente (Mover) que usen los dos.',
  },
  {
    key: 'sm-js-bool-params', language: L, fence: F, title: 'Booleanos en la llamada',
    code: cs(['setVisible(true, false, true);']),
    solution: 'En la llamada no se sabe qué significa cada valor. Pasa un objeto con nombres ({ body: true, weapon: false, shadow: true }) o usa métodos separados.',
  },
  {
    key: 'sm-js-number-strings', language: L, fence: F, title: 'Números en cadenas',
    code: cs(["let speed = '5';", 'player.x += +speed;', 'const total = Number(score) + Number(bonus);']),
    solution: 'Guardar números como texto obliga a convertir en cada uso y tarde o temprano una suma concatena. Convierte una vez al leer el dato (del input o del JSON) y trabaja con números.',
  },
  {
    key: 'sm-js-json-clone', language: L, fence: F, title: 'Clonar con JSON',
    code: cs(['function update() {', '  const prev = JSON.parse(JSON.stringify(state));', '  // ...', '}']),
    solution: 'Serializa y vuelve a parsear todo el estado cada frame; funciona, pero es lento y pierde fechas, funciones y undefined. structuredClone es más fiable, y guardar solo lo que cambia es más barato aún.',
  },
  {
    key: 'sm-js-empty-catch', language: L, fence: F, title: 'Catch vacío',
    code: cs(['try {', "  localStorage.setItem('save', json);", '} catch (e) {}']),
    solution: 'Si el guardado falla (cuota llena, modo privado), nadie se entera. Registra el error y avisa en pantalla; tragárselo solo cambia un fallo visible por uno misterioso.',
  },
  {
    key: 'sm-js-method-two-things', language: L, fence: F, title: 'takeDamage hace de todo',
    code: cs(['function takeDamage(n) {', '  player.hp -= n;', "  hpBar.style.width = player.hp + '%';", '  hurtSound.play();', '  shakeCamera();', '}']),
    solution: 'La vida sabe de DOM, audio y cámara. Que takeDamage solo cambie la vida y emita un evento (damaged); barra, sonido y cámara se suscriben.',
  },
  {
    key: 'sm-js-inline-styles', language: L, fence: F, title: 'Estilos desde el código',
    code: cs(["hpBar.style.background = 'red';", "hpBar.style.height = '8px';", "hpBar.style.borderRadius = '4px';"]),
    solution: 'El aspecto queda repartido entre JS y CSS y cambiar un color es buscar por el código. Define clases en CSS (hp-low) y desde JS solo cambia classList.',
  },
  {
    key: 'sm-js-includes-loop', language: L, fence: F, title: 'includes dentro del bucle',
    code: cs(['for (const e of enemies) {', '  if (hitIds.includes(e.id)) continue;', '}']),
    solution: 'includes recorre la lista entera por cada enemigo: con muchos, es cuadrático. Un Set de ids hace la comprobación en tiempo constante.',
  },
  {
    key: 'sm-js-monolith', language: L, fence: F, title: 'main.js de dos mil líneas',
    code: cs(['// main.js', '// ... 2000 líneas: jugador, enemigos, menús, audio, guardado']),
    solution: 'Un archivo con todo no se navega ni se revisa. Módulos ES (player.js, enemies.js, audio.js) con import y export; el navegador los carga sin herramientas extra.',
  },
  {
    key: 'sm-js-timeout-sequence', language: L, fence: F, title: 'Secuencia con setTimeout',
    code: cs(['setTimeout(showTitle, 500);', 'setTimeout(showMenu, 1200);', 'setTimeout(playMusic, 1300);']),
    solution: 'Los tiempos están acoplados a mano y cambiar uno obliga a recalcular los demás. Una función async con await wait(500) entre pasos, o una lista de pasos con su retardo, se lee en orden.',
  },
  {
    key: 'sm-js-self-this', language: L, fence: F, title: 'var self = this',
    code: cs(['var self = this;', 'button.onclick = function () {', '  self.start();', '};']),
    solution: 'Es el truco de antes de las funciones flecha. button.onclick = () => this.start() conserva this sin la variable extra.',
  },
  {
    key: 'sm-js-parallel-arrays', language: L, fence: F, title: 'Arrays paralelos',
    code: cs(['const enemyX = [], enemyY = [], enemyHp = [], enemyType = [];', 'enemyHp[i] -= 1;']),
    solution: 'Cuatro arrays que deben ir sincronizados: borrar un enemigo obliga a borrar en los cuatro con el mismo índice. Un array de objetos { x, y, hp, type } mantiene cada enemigo entero.',
  },
  {
    key: 'sm-js-naming-mix', language: L, fence: F, title: 'Tres estilos de nombre',
    code: cs(['let MoveSpeed = 5;', 'let jump_force = 12;', 'let HP = 100;', 'function Draw_Player() {}']),
    solution: 'Elige una convención y úsala en todo: en JavaScript, camelCase para variables y funciones, PascalCase para clases, MAYÚSCULAS para constantes.',
  },
  {
    key: 'sm-js-array-filter-frame', language: L, fence: F, title: 'Filtrar el array cada frame',
    code: cs(['function update() {', '  enemies = enemies.filter((e) => e.alive);', '  bullets = bullets.filter((b) => b.alive);', '}']),
    solution: 'Crea dos arrays nuevos por frame aunque no muera nadie, y el recolector lo nota. Elimina solo cuando algo muere (splice o intercambio con el último), o filtra cada varios frames.',
  },
];

// Fragmentos en JavaScript (juegos web). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'JavaScript';
const F = 'js';

module.exports = [
  {
    key: 'js-var-en-bucle', language: L, fence: F, title: 'Todos los enemigos iguales',
    code: cs(['for (var i = 0; i < 3; i++) {', '  setTimeout(() => spawnEnemy(i), i * 1000);', '}']),
    solution: 'Con var, la i es la misma para los tres temporizadores y vale 3 cuando se ejecutan. Con let, cada vuelta tiene su propia i.',
  },
  {
    key: 'js-fetch-sin-await', language: L, fence: F, title: 'El nivel no carga',
    code: cs(['async function loadLevel(name) {', '  const data = fetch("/levels/" + name + ".json");', '  return data.json();', '}']),
    solution: 'Falta await: fetch devuelve una promesa, y una promesa no tiene el método json. Debe ser const data = await fetch(...).',
  },
  {
    key: 'js-raf-sin-delta', language: L, fence: F, title: 'Más rápido en pantallas de 144 Hz',
    code: cs(['function loop() {', '  player.x += 5;', '  draw();', '  requestAnimationFrame(loop);', '}']),
    solution: 'Se mueve 5 píxeles por fotograma, y requestAnimationFrame corre a la frecuencia de la pantalla: en un monitor de 144 Hz va más del doble de rápido. Calcula el tiempo entre fotogramas y multiplica.',
  },
  {
    key: 'js-listener-en-bucle', language: L, fence: F, title: 'Cada clic dispara cien veces',
    code: cs(['function update() {', '  canvas.addEventListener("click", shoot);', '  draw();', '  requestAnimationFrame(update);', '}']),
    solution: 'Añade un listener nuevo en cada fotograma y nunca lo quita. Al cabo de unos segundos, cada clic dispara cientos de veces. Regístralo una sola vez fuera del bucle.',
  },
  {
    key: 'js-localstorage-string', language: L, fence: F, title: 'El silencio no se recuerda',
    code: cs(['if (localStorage.getItem("muted") == true) {', '  audio.muted = true;', '}']),
    solution: 'localStorage guarda cadenas: getItem devuelve "true", y "true" == true es falso. Compara con la cadena "true", o guarda y lee JSON.',
  },
  {
    key: 'js-canvas-sin-limpiar', language: L, fence: F, title: 'El personaje deja estela',
    code: cs(['function draw() {', '  ctx.drawImage(playerImg, player.x, player.y);', '  requestAnimationFrame(draw);', '}']),
    solution: 'Nunca se borra el canvas, así que cada fotograma se pinta encima del anterior y el personaje deja un rastro. Falta ctx.clearRect(0, 0, canvas.width, canvas.height) al principio.',
  },
  {
    key: 'js-imagen-sin-cargar', language: L, fence: F, title: 'El héroe no aparece',
    code: cs(['const img = new Image();', 'img.src = "hero.png";', 'ctx.drawImage(img, 100, 100);']),
    solution: 'La imagen se dibuja antes de que termine de descargarse, así que no aparece nada. Dibuja dentro de img.onload o espera a que cargue antes de empezar el bucle.',
  },
  {
    key: 'js-keydown-repetido', language: L, fence: F, title: 'Salta mientras mantienes la tecla',
    code: cs(['window.addEventListener("keydown", (e) => {', '  if (e.code === "Space") jump();', '});']),
    solution: 'El sistema repite keydown mientras la tecla sigue pulsada, así que salta sin parar. Ignora los eventos con e.repeat o usa un estado propio de teclas.',
  },
  {
    key: 'js-splice-en-bucle', language: L, fence: F, title: 'Algunas balas no se borran',
    code: cs(['for (let i = 0; i < bullets.length; i++) {', '  if (bullets[i].dead) bullets.splice(i, 1);', '}']),
    solution: 'Al borrar el elemento i, el siguiente pasa a ocupar la posición i y el bucle se lo salta. Recorre al revés o usa filter.',
  },
  {
    key: 'js-this-en-callback', language: L, fence: F, title: 'this no es lo que crees',
    code: cs(['class Player {', '  die() {', '    setTimeout(function () {', '      this.respawn();', '    }, 1000);', '  }', '}']),
    solution: 'Dentro de una función normal, this ya no es el jugador, así que this.respawn no existe. Usa una función flecha, que conserva el this de fuera.',
  },
  {
    key: 'js-json-null', language: L, fence: F, title: 'Explota la primera vez',
    code: cs(['const save = JSON.parse(localStorage.getItem("save"));', 'player.x = save.x;', 'player.y = save.y;']),
    solution: 'La primera vez no hay partida guardada: getItem devuelve null, JSON.parse(null) da null y save.x revienta. Comprueba que exista antes de usarla.',
  },
  {
    key: 'js-random-round', language: L, fence: F, title: 'A veces elige un objeto que no existe',
    code: cs(['const index = Math.round(Math.random() * items.length);', 'const item = items[index];']),
    solution: 'Math.round puede devolver items.length, que está fuera del array. Además reparte mal las probabilidades. Usa Math.floor(Math.random() * items.length).',
  },
  {
    key: 'js-dos-bucles', language: L, fence: F, title: 'Todo va al doble de velocidad',
    code: cs(['function startGame() {', '  loop();', '}', '', 'startButton.onclick = startGame;', 'restartButton.onclick = startGame;']),
    solution: 'Cada llamada a startGame arranca otro bucle con requestAnimationFrame, y los dos siguen vivos. Al reiniciar, todo se actualiza dos veces por fotograma. Cancela el bucle anterior antes de lanzar otro.',
  },
  {
    key: 'js-foreach-async', language: L, fence: F, title: 'Empieza antes de cargar',
    code: cs(['levels.forEach(async (name) => {', '  await loadLevel(name);', '});', 'startGame();']),
    solution: 'forEach no espera a las funciones async: startGame se ejecuta antes de que termine ninguna carga. Usa un bucle for...of con await, o Promise.all.',
  },
  {
    key: 'js-suma-texto', language: L, fence: F, title: 'Puntuación de 105',
    code: cs(['let score = 10;', 'const bonus = document.getElementById("bonus").value;', 'score = score + bonus;']),
    solution: 'El valor de un input es texto, así que 10 + "5" concatena y da "105". Convierte con Number(bonus) antes de sumar.',
  },
  {
    key: 'js-sort-numeros', language: L, fence: F, title: 'Tabla de récords desordenada',
    code: cs(['const scores = [100, 20, 3, 1000];', 'scores.sort();', 'console.log(scores);']),
    solution: 'sort sin función compara como texto: "1000" va antes que "20". Para números hace falta scores.sort((a, b) => b - a).',
  },
  {
    key: 'js-canvas-por-css', language: L, fence: F, title: 'Todo borroso y estirado',
    code: cs(['const canvas = document.getElementById("game");', 'canvas.style.width = "800px";', 'canvas.style.height = "600px";', 'const ctx = canvas.getContext("2d");']),
    solution: 'El CSS estira el canvas pero su tamaño real sigue siendo el de por defecto, 300 por 150. Hay que fijar canvas.width y canvas.height, no solo el estilo.',
  },
  {
    key: 'js-settimeout-segundos', language: L, fence: F, title: 'Los enemigos aparecen al instante',
    code: cs(['function scheduleWave() {', '  setTimeout(spawnWave, 2);', '}']),
    solution: 'setTimeout recibe milisegundos, no segundos: 2 son dos milésimas. Debe ser 2000.',
  },
  {
    key: 'js-parseint-nan', language: L, fence: F, title: 'El enemigo no se mueve nunca',
    code: cs(['const speed = parseInt(config.enemySpeed);', 'if (speed > 0) {', '  enemy.x += speed;', '}']),
    solution: 'Si config.enemySpeed no existe, parseInt devuelve NaN sin quejarse, y NaN > 0 es falso. Comprueba el valor con Number.isNaN o pon un valor por defecto.',
  },
  {
    key: 'js-comparar-objetos', language: L, fence: F, title: 'Nunca es el mismo nivel',
    code: cs(['if (currentLevel === { id: 1, name: "Bosque" }) {', '  playForestMusic();', '}']),
    solution: 'Dos objetos nunca son iguales con ===, aunque tengan el mismo contenido: se comparan por referencia. Compara currentLevel.id === 1.',
  },
  {
    key: 'js-modulo-negativo', language: L, fence: F, title: 'Índice negativo al retroceder',
    code: cs(['function previous() {', '  index = (index - 1) % items.length;', '  return items[index];', '}']),
    solution: 'En JavaScript el módulo de un número negativo es negativo: (0 - 1) % 5 da -1 y items[-1] es undefined. Suma la longitud antes: (index - 1 + items.length) % items.length.',
  },
  {
    key: 'js-dt-milisegundos', language: L, fence: F, title: 'Todo vuela',
    code: cs(['function loop(now) {', '  const dt = now - last;', '  last = now;', '  player.x += speed * dt;', '  requestAnimationFrame(loop);', '}']),
    solution: 'requestAnimationFrame entrega el tiempo en milisegundos, así que dt vale unos 16 y todo se mueve mil veces más rápido de lo pensado. Divide entre 1000 para tener segundos.',
  },
  {
    key: 'js-audio-no-solapa', language: L, fence: F, title: 'El disparo solo suena a veces',
    code: cs(['const shot = new Audio("shot.wav");', 'function shoot() {', '  shot.play();', '}']),
    solution: 'Un mismo elemento Audio no puede sonar dos veces a la vez: si todavía está sonando, play no hace nada. Clona el elemento o usa Web Audio para efectos rápidos.',
  },
  {
    key: 'js-flechas-scroll', language: L, fence: F, title: 'La página se mueve con las flechas',
    code: cs(['window.addEventListener("keydown", (e) => {', '  if (e.code === "ArrowDown") player.moveDown();', '});']),
    solution: 'Las flechas y el espacio también hacen scroll en la página, así que el juego baja mientras el personaje se mueve. Llama a e.preventDefault() para las teclas del juego.',
  },
  {
    key: 'js-suavizado-pixel', language: L, fence: F, title: 'Pixel art borroso al escalar',
    code: cs(['ctx.drawImage(sprite, 0, 0, 16, 16, x, y, 64, 64);']),
    solution: 'Al escalar, el canvas suaviza la imagen por defecto y el pixel art se ve borroso. Pon ctx.imageSmoothingEnabled = false antes de dibujar.',
  },
  {
    key: 'js-last-sin-actualizar', language: L, fence: F, title: 'Cada vez va más rápido',
    code: cs(['let last = performance.now();', 'function loop(now) {', '  const dt = (now - last) / 1000;', '  update(dt);', '  requestAnimationFrame(loop);', '}']),
    solution: 'last nunca se actualiza, así que dt crece en cada fotograma y el juego acelera sin parar. Falta last = now dentro del bucle.',
  },
  {
    key: 'js-fetch-sin-ok', language: L, fence: F, title: 'Error raro al cargar un nivel que no existe',
    code: cs(['const level = await fetch("/levels/9.json").then((r) => r.json());']),
    solution: 'fetch no falla con un 404: devuelve la página de error, y json intenta leer HTML como JSON. Comprueba r.ok antes de parsear.',
  },
  {
    key: 'js-localstorage-objeto', language: L, fence: F, title: 'Se guarda [object Object]',
    code: cs(['localStorage.setItem("save", player);', 'const loaded = localStorage.getItem("save");']),
    solution: 'localStorage solo guarda cadenas, y un objeto se convierte en "[object Object]". Guarda JSON.stringify(player) y lee con JSON.parse.',
  },
  {
    key: 'js-solo-raton', language: L, fence: F, title: 'No funciona en el móvil',
    code: cs(['canvas.addEventListener("mousedown", (e) => {', '  shootAt(e.offsetX, e.offsetY);', '});']),
    solution: 'En pantallas táctiles no siempre llegan eventos de ratón, o llegan con retraso. Escucha también touchstart, o usa pointerdown, que cubre ratón, dedo y lápiz.',
  },
  {
    key: 'js-remove-listener-anonimo', language: L, fence: F, title: 'El listener no se quita',
    code: cs(['window.addEventListener("keydown", (e) => handleKey(e));', '// más tarde, al terminar la partida:', 'window.removeEventListener("keydown", (e) => handleKey(e));']),
    solution: 'removeEventListener necesita la misma función que se registró, y cada flecha es una función nueva. Guarda la función en una variable y usa esa en los dos sitios.',
  },
];

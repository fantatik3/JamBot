// Fragmentos en Python (herramientas y Pygame). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'Python';
const F = 'python';

module.exports = [
  {
    key: 'py-lista-por-defecto', language: L, fence: F, title: 'Inventarios compartidos',
    code: cs(['def add_item(item, inventory=[]):', '    inventory.append(item)', '    return inventory']),
    solution: 'La lista por defecto se crea una sola vez y se comparte entre todas las llamadas, así que todos los inventarios acaban con los mismos objetos. Usa None por defecto y crea la lista dentro.',
  },
  {
    key: 'py-range-desde-uno', language: L, fence: F, title: 'Falta el primer nivel',
    code: cs(['for i in range(1, len(levels)):', '    load(levels[i])']),
    solution: 'range empieza en 1, así que levels[0] nunca se carga. Debe ser range(len(levels)) o recorrer la lista directamente.',
  },
  {
    key: 'py-is-con-cadena', language: L, fence: F, title: 'El jefe nunca aparece',
    code: cs(['def on_level_start(level):', '    if level is "boss":', '        spawn_boss()']),
    solution: 'is compara identidad, no contenido, así que dos cadenas iguales pueden dar falso. Las cadenas se comparan con ==.',
  },
  {
    key: 'py-atributo-de-clase', language: L, fence: F, title: 'Todos los jugadores comparten inventario',
    code: cs(['class Player:', '    items = []', '', '    def pick(self, item):', '        self.items.append(item)']),
    solution: 'items está definido en la clase, no en cada instancia, así que todos los jugadores comparten la misma lista. Crea self.items = [] dentro de __init__.',
  },
  {
    key: 'py-ruta-relativa', language: L, fence: F, title: 'No encuentra el nivel',
    code: cs(['def load_level(name):', '    with open("levels/" + name + ".json") as f:', '        return json.load(f)']),
    solution: 'La ruta es relativa a la carpeta desde la que se ejecuta el programa, no a la del script. Al arrancar desde otro sitio, no encuentra el archivo. Construye la ruta a partir de __file__.',
  },
  {
    key: 'py-lambda-en-bucle', language: L, fence: F, title: 'Todos los botones cargan el último nivel',
    code: cs(['for i in range(3):', '    buttons[i].on_click = lambda: load_level(i)']),
    solution: 'La lambda lee i cuando se pulsa el botón, y para entonces vale 2 en todos. Captura el valor con lambda i=i: load_level(i).',
  },
  {
    key: 'py-lista-referencia', language: L, fence: F, title: 'La copia vacía el original',
    code: cs(['backup = inventory', 'backup.clear()', 'print(len(inventory))']),
    solution: 'backup e inventory son el mismo objeto: clear vacía los dos. Para copiar una lista se usa inventory.copy() o list(inventory).',
  },
  {
    key: 'py-range-decimal', language: L, fence: F, title: 'range no acepta decimales',
    code: cs(['for alpha in range(0, 1, 0.1):', '    fade(alpha)']),
    solution: 'range solo trabaja con enteros: con 0.1 lanza TypeError. Recorre enteros y divide, o usa numpy.arange.',
  },
  {
    key: 'py-texto-mas-entero', language: L, fence: F, title: 'No se puede sumar texto y número',
    code: cs(['lives = 3', 'print("Vidas: " + lives)']),
    solution: 'Python no convierte el entero solo: TypeError. Usa str(lives) o una f-string: f"Vidas: {lives}".',
  },
  {
    key: 'py-pygame-sin-flip', language: 'Python (Pygame)', fence: F, title: 'La ventana se queda negra',
    code: cs(['while running:', '    screen.fill((0, 0, 0))', '    screen.blit(player_img, player_pos)', '    clock.tick(60)']),
    solution: 'Se dibuja en la superficie pero nunca se muestra: falta pygame.display.flip() al final de cada vuelta.',
  },
  {
    key: 'py-pygame-sin-eventos', language: 'Python (Pygame)', fence: F, title: 'La ventana no responde',
    code: cs(['while running:', '    update()', '    draw()', '    pygame.display.flip()']),
    solution: 'Nunca se procesan los eventos, así que el sistema cree que el programa se ha colgado y no se puede cerrar. Hay que recorrer pygame.event.get() en cada vuelta.',
  },
  {
    key: 'py-pygame-rect-entero', language: 'Python (Pygame)', fence: F, title: 'El personaje no se mueve despacio',
    code: cs(['player_rect.x += 0.5 * direction']),
    solution: 'Las coordenadas de un Rect son enteras: sumar 0.5 se redondea y se pierde. Guarda la posición en floats aparte y copia el valor redondeado al Rect al dibujar.',
  },
  {
    key: 'py-pygame-sin-clock', language: 'Python (Pygame)', fence: F, title: 'Velocidad distinta en cada ordenador',
    code: cs(['while running:', '    for event in pygame.event.get():', '        pass', '    player_x += 5', '    draw()']),
    solution: 'Sin clock.tick ni delta time, el bucle corre lo más rápido que puede y la velocidad depende del ordenador. Usa clock.tick(60) y multiplica el movimiento por el tiempo transcurrido.',
  },
  {
    key: 'py-division-entera', language: L, fence: F, title: 'Progreso siempre a cero',
    code: cs(['progress = current // total', 'bar.set_fill(progress)']),
    solution: 'El operador // es división entera: 3 // 10 da 0. Para un porcentaje hace falta la división normal con /.',
  },
  {
    key: 'py-global-sin-declarar', language: L, fence: F, title: 'UnboundLocalError',
    code: cs(['score = 0', '', 'def add_points(amount):', '    score += amount']),
    solution: 'Al asignar dentro de la función, Python trata score como variable local y la lee antes de existir. Hace falta global score, o mejor devolver el valor.',
  },
  {
    key: 'py-remove-en-bucle', language: L, fence: F, title: 'Algunos enemigos muertos siguen ahí',
    code: cs(['for enemy in enemies:', '    if enemy.dead:', '        enemies.remove(enemy)']),
    solution: 'Al borrar mientras se recorre, los siguientes elementos se desplazan y el bucle se salta uno. Usa una comprensión: enemies = [e for e in enemies if not e.dead].',
  },
  {
    key: 'py-randint-inclusivo', language: L, fence: F, title: 'IndexError de vez en cuando',
    code: cs(['index = random.randint(0, len(items))', 'item = items[index]']),
    solution: 'randint incluye los dos extremos, así que a veces devuelve len(items), que está fuera de la lista. Usa randint(0, len(items) - 1) o random.choice(items).',
  },
  {
    key: 'py-keyerror', language: L, fence: F, title: 'KeyError la primera vez',
    code: cs(['def load_stats(data):', '    hp = data["hp"]', '    mana = data["mana"]']),
    solution: 'Si la partida guardada es antigua y no tiene "mana", el acceso lanza KeyError. Usa data.get("mana", 0) con un valor por defecto.',
  },
  {
    key: 'py-copia-superficial', language: L, fence: F, title: 'El mapa original se modifica',
    code: cs(['grid = [[0] * 10 for _ in range(10)]', 'backup = grid.copy()', 'backup[0][0] = 1', 'print(grid[0][0])']),
    solution: 'copy hace una copia superficial: las filas siguen siendo las mismas listas, y cambiar una en backup la cambia en grid. Usa copy.deepcopy.',
  },
  {
    key: 'py-sleep-congela', language: L, fence: F, title: 'El juego se congela al parpadear',
    code: cs(['def flash(player):', '    player.color = RED', '    time.sleep(0.2)', '    player.color = WHITE']),
    solution: 'time.sleep bloquea el programa entero: no se dibuja ni se leen teclas durante ese tiempo. Usa un temporizador que se compruebe en cada vuelta del bucle.',
  },
  {
    key: 'py-input-texto', language: L, fence: F, title: 'No se puede restar a un texto',
    code: cs(['lives = input("Vidas iniciales: ")', 'lives = lives - 1']),
    solution: 'input devuelve siempre una cadena, y restarle un número da TypeError. Convierte con int(input(...)).',
  },
  {
    key: 'py-modo-w-borra', language: L, fence: F, title: 'La partida guardada desaparece',
    code: cs(['def load_save():', '    with open("save.json", "w") as f:', '        return json.load(f)']),
    solution: 'Abrir en modo "w" vacía el archivo antes de leer, así que la partida se borra al intentar cargarla. Para leer se usa modo "r".',
  },
  {
    key: 'py-json-set', language: L, fence: F, title: 'No se puede guardar',
    code: cs(['save = {"level": 3, "unlocked": {"bosque", "cueva"}}', 'json.dump(save, open("save.json", "w"))']),
    solution: 'JSON no tiene conjuntos: json.dump falla con un set. Convierte a lista antes de guardar, list(unlocked).',
  },
  {
    key: 'py-sin-self', language: L, fence: F, title: 'Toma un argumento pero se le dan dos',
    code: cs(['class Enemy:', '    def take_damage(amount):', '        self.health -= amount']),
    solution: 'Falta self como primer parámetro del método. Al llamar enemy.take_damage(10), Python pasa el objeto como primer argumento y sobra uno.',
  },
  {
    key: 'py-load-en-bucle', language: 'Python (Pygame)', fence: F, title: 'Va a tirones',
    code: cs(['while running:', '    hero = pygame.image.load("hero.png")', '    screen.blit(hero, pos)', '    pygame.display.flip()']),
    solution: 'La imagen se lee del disco en cada fotograma. Cárgala una vez antes del bucle y reutilízala.',
  },
  {
    key: 'py-convert-sin-alpha', language: 'Python (Pygame)', fence: F, title: 'Fondo negro alrededor del sprite',
    code: cs(['hero = pygame.image.load("hero.png").convert()']),
    solution: 'convert descarta la transparencia del PNG, y las zonas transparentes salen negras. Para imágenes con alfa se usa convert_alpha().',
  },
  {
    key: 'py-sort-objetos', language: L, fence: F, title: 'No se pueden ordenar los jugadores',
    code: cs(['players.sort()', 'print(players[0].name)']),
    solution: 'Python no sabe comparar dos objetos Player entre sí: TypeError. Indica por qué ordenar con key, por ejemplo players.sort(key=lambda p: p.score, reverse=True).',
  },
  {
    key: 'py-ruta-backslash', language: L, fence: F, title: 'No encuentra el archivo',
    code: cs(['level = open("levels\\new_level.txt")']),
    solution: 'En una cadena normal, la barra invertida seguida de n es un salto de línea, así que la ruta queda rota. Usa barras normales, cadenas crudas r"..." o pathlib.',
  },
  {
    key: 'py-comparar-texto-numero', language: L, fence: F, title: 'No se puede comparar',
    code: cs(['best = config["best_score"]  # viene de un archivo de texto', 'if score > best:', '    save_best(score)']),
    solution: 'El valor leído de un archivo de texto es una cadena, y comparar un número con una cadena da TypeError en Python 3. Convierte con int(best).',
  },
  {
    key: 'py-pygame-keydown-mover', language: 'Python (Pygame)', fence: F, title: 'Un paso por pulsación',
    code: cs(['for event in pygame.event.get():', '    if event.type == pygame.KEYDOWN and event.key == pygame.K_RIGHT:', '        player.x += 5']),
    solution: 'KEYDOWN solo llega una vez al pulsar, así que mantener la tecla no mueve al personaje. Para movimiento continuo se consulta pygame.key.get_pressed() en cada vuelta.',
  },
];

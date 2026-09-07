// Fragmentos en Python (herramientas y Pygame). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'Python';
const F = 'python';

module.exports = [
  {
    key: 'sm-py-globals', language: L, fence: F, title: 'global por todas partes',
    code: cs(['def add_score(points):', '    global score', '    score += points', '', 'def reset():', '    global score, lives', '    score = 0', '    lives = 3']),
    solution: 'El estado vive suelto en el módulo y cada función lo declara global para tocarlo. Una clase Game (o un dataclass de estado) que se pase a las funciones deja claro quién es el dueño.',
  },
  {
    key: 'sm-py-magic-numbers', language: L, fence: F, title: 'Números sueltos',
    code: cs(['if player.y > 540:', '    die()', 'enemy.speed = 2.75', 'if dist < 48:', '    hit()']),
    solution: 'Nadie sabe qué son 540, 2.75 o 48, y ajustar el juego es buscarlos por el archivo. Constantes con nombre en mayúsculas (GROUND_Y, ENEMY_SPEED, HIT_RANGE).',
  },
  {
    key: 'sm-py-string-state', language: L, fence: F, title: 'Estado en texto',
    code: cs(['state = "idle"', 'if state == "jumping":', '    apply_gravity()', 'elif state == "dashing":', '    keep_speed()']),
    solution: 'Un "jumpin" mal escrito no da error, solo un estado que no entra. Un Enum State con IDLE, JUMPING y DASHING autocompleta y falla al escribir mal.',
  },
  {
    key: 'sm-py-long-main', language: L, fence: F, title: 'main de trescientas líneas',
    code: cs(['def main():', '    # inicializar (30 líneas)', '    # bucle: entrada, física, colisiones, dibujo (250 líneas)', '    # guardar (20 líneas)']),
    solution: 'No se puede leer, probar ni reutilizar por partes. Divide en handle_input, update, draw y save, y deja main como índice.',
  },
  {
    key: 'sm-py-print-debug', language: L, fence: F, title: 'print olvidado',
    code: cs(['while running:', '    print("pos", player.x, player.y)', '    update()']),
    solution: 'Sesenta líneas por segundo esconden los mensajes que importan y frenan el bucle. Usa logging con nivel DEBUG y desactívalo al publicar.',
  },
  {
    key: 'sm-py-copy-paste-keys', language: L, fence: F, title: 'Un if por tecla',
    code: cs(['if keys[K_LEFT]: player.x -= SPEED', 'if keys[K_RIGHT]: player.x += SPEED', 'if keys[K_UP]: player.y -= SPEED', 'if keys[K_DOWN]: player.y += SPEED']),
    solution: 'Cuatro bloques iguales que crecerán con cada tecla. Un diccionario de tecla a dirección y un bucle que sume las que estén pulsadas.',
  },
  {
    key: 'sm-py-bare-except', language: L, fence: F, title: 'except a secas',
    code: cs(['try:', '    save_game()', 'except:', '    pass']),
    solution: 'Atrapa todo, incluido Ctrl+C, y no deja rastro. Captura la excepción concreta (OSError) y regístrala; si no sabes qué hacer con ella, mejor dejarla subir.',
  },
  {
    key: 'sm-py-load-in-loop', language: L, fence: F, title: 'Cargar la imagen cada frame',
    code: cs(['while running:', '    hero = pygame.image.load("hero.png")', '    screen.blit(hero, (x, y))']),
    solution: 'Lee y decodifica el archivo sesenta veces por segundo. Carga la imagen una vez antes del bucle (y convert() para que el blit sea rápido).',
  },
  {
    key: 'sm-py-parallel-lists', language: L, fence: F, title: 'Listas paralelas',
    code: cs(['enemy_x = []', 'enemy_y = []', 'enemy_hp = []', 'enemy_hp[i] -= 1']),
    solution: 'Tres listas que deben ir sincronizadas: borrar un enemigo es borrar en las tres con el mismo índice. Un dataclass Enemy(x, y, hp) y una sola lista.',
  },
  {
    key: 'sm-py-bool-flags', language: L, fence: F, title: 'Una bandera por estado',
    code: cs(['is_jumping = False', 'is_falling = False', 'is_dashing = False', 'is_dead = False']),
    solution: 'Cuatro booleanos permiten combinaciones imposibles y cada if tiene que negar los demás. Un solo estado (Enum) evita saltar estando muerto.',
  },
  {
    key: 'sm-py-nested-ifs', language: L, fence: F, title: 'Escalera de ifs',
    code: cs(['if player:', '    if player.alive:', '        if player.has_key:', '            if door.locked:', '                door.open()']),
    solution: 'Cuatro niveles para una acción. Salidas tempranas (if not player: return) dejan la función plana y cada condición a la vista.',
  },
  {
    key: 'sm-py-isinstance-chain', language: L, fence: F, title: 'Cadena de isinstance',
    code: cs(['for e in enemies:', '    if isinstance(e, Slime):', '        e.bounce()', '    elif isinstance(e, Bat):', '        e.fly()', '    elif isinstance(e, Knight):', '        e.block()']),
    solution: 'Cada enemigo nuevo obliga a tocar este bucle. Un método común update() que cada clase implemente a su manera, y el bucle solo llama a e.update().',
  },
  {
    key: 'sm-py-config-dict', language: L, fence: F, title: 'Diccionario de configuración mutable',
    code: cs(['CONFIG = {"speed": 5, "lives": 3}', '', 'def hard_mode():', '    CONFIG["speed"] = 8', '    CONFIG["lives"] = 1']),
    solution: 'Cualquier función puede cambiar la configuración en cualquier momento y las claves mal escritas crean entradas nuevas en silencio. Un dataclass congelado (frozen=True) con los valores, y distintas instancias por dificultad.',
  },
  {
    key: 'sm-py-index-loop', language: L, fence: F, title: 'Bucle por índice',
    code: cs(['for i in range(len(enemies)):', '    enemies[i].update()']),
    solution: 'El índice no se usa para nada. for enemy in enemies: enemy.update() es más corto y no puede salirse del rango. Si hace falta el índice, enumerate.',
  },
  {
    key: 'sm-py-string-concat', language: L, fence: F, title: 'Concatenar en bucle',
    code: cs(['report = ""', 'for line in lines:', '    report = report + line + "\\n"']),
    solution: 'Crea una cadena nueva en cada vuelta. "\\n".join(lines) lo hace de una vez y se lee mejor.',
  },
  {
    key: 'sm-py-dead-code', language: L, fence: F, title: 'Código comentado',
    code: cs(['# player.x += 4', '# if old: draw_old()', 'player.x += SPEED * dt  # mueve al jugador', '# TODO borrar']),
    solution: 'El código comentado se lee pero no se ejecuta y nadie sabe si volverá. Bórralo, git lo recuerda. El comentario que repite la línea tampoco aporta.',
  },
  {
    key: 'sm-py-hardcoded-path', language: L, fence: F, title: 'Ruta fija de Windows',
    code: cs(['with open("C:\\\\Users\\\\ana\\\\game\\\\levels\\\\1.json") as f:', '    level = json.load(f)']),
    solution: 'Funciona en un ordenador y con un usuario. Construye la ruta desde el propio archivo: Path(__file__).parent / "levels" / "1.json", que además funciona en cualquier sistema.',
  },
  {
    key: 'sm-py-long-params', language: L, fence: F, title: 'Ocho parámetros',
    code: cs(['def spawn_enemy(x, y, z, hp, speed, damage, is_boss, color):', '    ...']),
    solution: 'Con tantos parámetros del mismo tipo es fácil pasar dos en el orden equivocado. Agrupa en un dataclass EnemyData y una posición, o al menos obliga a nombrarlos con * en la firma.',
  },
  {
    key: 'sm-py-tuple-return', language: L, fence: F, title: 'Devolver una tupla larga',
    code: cs(['def load_player():', '    return x, y, hp, speed, name', '', 'x, y, hp, speed, name = load_player()']),
    solution: 'Cinco valores por posición: añadir uno rompe todas las llamadas y el orden hay que recordarlo. Devuelve un dataclass Player con campos con nombre.',
  },
  {
    key: 'sm-py-bool-params', language: L, fence: F, title: 'Booleanos en la llamada',
    code: cs(['set_visible(True, False, True)']),
    solution: 'En la llamada no se sabe qué es cada True. Argumentos con nombre (set_visible(body=True, weapon=False, shadow=True)) o métodos separados.',
  },
  {
    key: 'sm-py-inheritance-reuse', language: L, fence: F, title: 'Heredar para reutilizar',
    code: cs(['class Coin(Enemy):', '    pass  # solo por el método float()']),
    solution: 'Una moneda no es un enemigo: hereda vida, daño e IA que no le tocan. Saca el flotar a una función o un mixin pequeño que usen los dos.',
  },
  {
    key: 'sm-py-eval-config', language: L, fence: F, title: 'eval para leer la configuración',
    code: cs(['with open("config.txt") as f:', '    config = eval(f.read())']),
    solution: 'Ejecuta lo que haya en el archivo, sea lo que sea, y un error de sintaxis da un mensaje críptico. json.load (o tomllib) lee datos sin ejecutar código.',
  },
  {
    key: 'sm-py-sleep-loop', language: L, fence: F, title: 'time.sleep como reloj',
    code: cs(['while running:', '    update()', '    draw()', '    time.sleep(0.016)']),
    solution: 'No tiene en cuenta lo que tardan update y draw, así que la velocidad depende de la máquina. clock.tick(60) de Pygame espera solo lo que falta y devuelve el delta.',
  },
  {
    key: 'sm-py-import-star', language: L, fence: F, title: 'import *',
    code: cs(['from pygame.locals import *', 'from utils import *', 'from math import *']),
    solution: 'Nadie sabe de dónde sale cada nombre y dos módulos pueden pisarse. Importa lo que uses por nombre o el módulo entero (import math).',
  },
  {
    key: 'sm-py-compare-true', language: L, fence: F, title: 'Comparar con True',
    code: cs(['if alive == True:', '    move()', 'if paused == False:', '    update()']),
    solution: 'El booleano ya es la condición. if alive: y if not paused: se leen mejor y no dependen de que el valor sea exactamente True.',
  },
  {
    key: 'sm-py-dict-chain', language: L, fence: F, title: 'Cadena de in',
    code: cs(['if "player" in data and "pos" in data["player"] and "x" in data["player"]["pos"]:', '    x = data["player"]["pos"]["x"]']),
    solution: 'El código no confía en la forma de los datos y lo comprueba en cada acceso. Valida el guardado una vez al cargarlo y conviértelo en dataclasses; el resto del código accede sin miedo.',
  },
  {
    key: 'sm-py-screen-size', language: L, fence: F, title: 'Tamaño de pantalla repetido',
    code: cs(['screen = pygame.display.set_mode((800, 600))', 'if x > 800: x = 0', 'if y > 600: y = 0', 'hud = pygame.Rect(0, 560, 800, 40)']),
    solution: 'Cambiar la resolución es buscar todos los 800 y 600. Constantes WIDTH y HEIGHT, o mejor, screen.get_size() donde haga falta.',
  },
  {
    key: 'sm-py-static-class', language: L, fence: F, title: 'Clase de métodos estáticos',
    code: cs(['class MathUtils:', '    @staticmethod', '    def clamp(v, lo, hi): ...', '    @staticmethod', '    def lerp(a, b, t): ...']),
    solution: 'La clase solo sirve de carpeta. En Python un módulo (mathutils.py) con funciones sueltas hace lo mismo con menos ceremonia.',
  },
  {
    key: 'sm-py-in-list-loop', language: L, fence: F, title: 'in sobre una lista dentro del bucle',
    code: cs(['for e in enemies:', '    if e.id in hit_ids:  # hit_ids es una lista', '        continue']),
    solution: 'in sobre una lista recorre toda la lista por cada enemigo. Con un set la comprobación es inmediata.',
  },
  {
    key: 'sm-py-single-letter', language: L, fence: F, title: 'Nombres de una letra',
    code: cs(['for e in es:', '    e.h -= d', '    if e.h <= 0:', '        e.die()']),
    solution: 'Cada letra obliga a adivinar. enemies, enemy, health y damage se entienden sin contexto y cuestan unos caracteres más.',
  },
];

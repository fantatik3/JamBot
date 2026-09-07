// Fragmentos en GDScript (Godot 4). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'GDScript (Godot 4)';
const F = 'gdscript';

module.exports = [
  {
    key: 'sm-gd-get-node-process', language: L, fence: F, title: 'get_node en _process',
    code: cs(['func _process(delta):', '    var player = get_node("/root/Main/Player")', '    look_at(player.global_position)']),
    solution: 'Busca el nodo por ruta en cada frame. Guárdalo una vez con @onready var player = get_node(...) o, mejor, con un @export var player: Node2D que se asigna en el editor.',
  },
  {
    key: 'sm-gd-deep-path', language: L, fence: F, title: 'Ruta frágil',
    code: cs(['func _on_hit():', '    get_node("../../UI/HUD/HealthBar").value = hp']),
    solution: 'Una ruta con ../../ se rompe en cuanto alguien mueve un nodo en la escena. Emite una señal (health_changed) y que la barra se conecte; o exporta un NodePath para que la dependencia sea visible en el editor.',
  },
  {
    key: 'sm-gd-magic-numbers', language: L, fence: F, title: 'Números sueltos',
    code: cs(['if global_position.y > 648:', '    queue_free()', 'velocity.x = 320 if running else 140']),
    solution: '648 es la altura de la ventana de hoy y 320 la velocidad que alguien probó una tarde. Nombra los valores (const o @export) y lee el tamaño de la pantalla con get_viewport_rect().',
  },
  {
    key: 'sm-gd-untyped', language: L, fence: F, title: 'Sin tipos',
    code: cs(['var speed = 200', 'var target', '', 'func take_damage(amount):', '    hp -= amount']),
    solution: 'Sin tipos el editor no autocompleta, los errores aparecen al ejecutar y GDScript va más lento. Escribe var speed: float = 200.0, var target: Node2D y func take_damage(amount: int) -> void.',
  },
  {
    key: 'sm-gd-autoload-god', language: L, fence: F, title: 'El autoload que lo sabe todo',
    code: cs(['# Global.gd (autoload)', 'var player', 'var score = 0', 'var current_level', 'var enemies = []', 'var settings = {}']),
    solution: 'Un autoload con todo el estado del juego se convierte en una variable global gigante que cualquier script toca. Deja en autoloads solo lo que de verdad es global (ajustes, transiciones) y que cada escena sea dueña de sus datos.',
  },
  {
    key: 'sm-gd-poll-signal', language: L, fence: F, title: 'Vigilar en vez de avisar',
    code: cs(['var last_hp := 0', '', 'func _process(delta):', '    if player.hp != last_hp:', '        last_hp = player.hp', '        health_bar.value = player.hp']),
    solution: 'Compara cada frame para detectar un cambio que ocurre pocas veces. Que el jugador emita una señal health_changed cuando cambie la vida y la barra se conecte a ella.',
  },
  {
    key: 'sm-gd-string-state', language: L, fence: F, title: 'Estado en texto',
    code: cs(['var state = "idle"', '', 'func _physics_process(delta):', '    if state == "jump":', '        apply_gravity()', '    elif state == "dash":', '        keep_speed()']),
    solution: 'Un "jumping" mal escrito en otro script no da error, solo un estado que nunca entra. Un enum State { IDLE, JUMP, DASH } con match deja todos los estados a la vista y el editor autocompleta.',
  },
  {
    key: 'sm-gd-print-spam', language: L, fence: F, title: 'print en cada frame',
    code: cs(['func _process(delta):', '    print("pos: ", global_position)', '    print(velocity)']),
    solution: 'Llena la consola y esconde los errores reales, y print cuesta tiempo en cada frame. Quítalo al terminar o usa print_debug detrás de una constante DEBUG.',
  },
  {
    key: 'sm-gd-copy-paste-input', language: L, fence: F, title: 'Cuatro ifs de entrada',
    code: cs([
      'if Input.is_action_pressed("left"):',
      '    velocity.x = -speed',
      'if Input.is_action_pressed("right"):',
      '    velocity.x = speed',
      'if Input.is_action_pressed("up"):',
      '    velocity.y = -speed',
      'if Input.is_action_pressed("down"):',
      '    velocity.y = speed',
    ]),
    solution: 'Funciona, pero la diagonal va más rápido y cada cambio se repite cuatro veces. Input.get_vector("left", "right", "up", "down") devuelve la dirección ya normalizada en una línea.',
  },
  {
    key: 'sm-gd-nested-ifs', language: L, fence: F, title: 'Escalera de ifs',
    code: cs(['if player:', '    if player.alive:', '        if player.has_key:', '            if door.locked:', '                door.open()']),
    solution: 'Cada nivel empuja la acción a la derecha y obliga a leer cuatro condiciones para saber qué pasa. Con salidas tempranas (if not player: return) la función queda plana.',
  },
  {
    key: 'sm-gd-load-in-spawn', language: L, fence: F, title: 'load en cada spawn',
    code: cs(['func spawn_enemy():', '    var enemy = load("res://enemies/slime.tscn").instantiate()', '    add_child(enemy)']),
    solution: 'load busca y lee el recurso en cada llamada. Con const SLIME = preload("res://enemies/slime.tscn") la escena se carga una vez con el script y spawn solo la instancia.',
  },
  {
    key: 'sm-gd-paths-duplicated', language: L, fence: F, title: 'La misma ruta en tres sitios',
    code: cs(['$Sprite.texture = load("res://art/hero/idle.png")', '# en otro script', 'icon.texture = load("res://art/hero/idle.png")', '# y en otro', 'preview = load("res://art/hero/idle.png")']),
    solution: 'Cuando el archivo se mueva habrá que encontrar las tres copias. Exporta la textura (@export var idle: Texture2D) o define la ruta una sola vez en una constante.',
  },
  {
    key: 'sm-gd-manual-timer', language: L, fence: F, title: 'Temporizador a mano',
    code: cs(['var time := 0.0', '', 'func _process(delta):', '    time += delta', '    if time > 2.0:', '        time = 0.0', '        spawn()']),
    solution: 'Reinventa un Timer con una variable y un if, sin pausa ni control desde el editor. Un nodo Timer con wait_time 2 y su señal timeout hace lo mismo y se ve en la escena.',
  },
  {
    key: 'sm-gd-parent-name', language: L, fence: F, title: 'Preguntar por el nombre del padre',
    code: cs(['func _on_body_entered(body):', '    if body.get_parent().name == "Enemies":', '        take_damage(1)']),
    solution: 'Depende de cómo se llame un nodo padre y se rompe al reorganizar la escena. Añade los enemigos a un grupo y pregunta body.is_in_group("enemies"), o usa capas de colisión.',
  },
  {
    key: 'sm-gd-inheritance-reuse', language: L, fence: F, title: 'Heredar para reutilizar',
    code: cs(['class_name Coin', 'extends Enemy', '# solo quería el flotar de Enemy']),
    solution: 'Una moneda no es un enemigo: hereda vida, daño y IA que no le tocan y cualquier cambio en Enemy la afecta. Saca el flotar a un nodo o script propio (Floater) y añádeselo a los dos.',
  },
  {
    key: 'sm-gd-bool-flags', language: L, fence: F, title: 'Una bandera por estado',
    code: cs(['var is_jumping := false', 'var is_falling := false', 'var is_dashing := false', 'var is_dead := false']),
    solution: 'Cuatro booleanos permiten combinaciones imposibles, como saltar estando muerto, y cada if tiene que negar los demás. Un solo estado (enum) evita las combinaciones inválidas.',
  },
  {
    key: 'sm-gd-long-function', language: L, fence: F, title: '_physics_process de cien líneas',
    code: cs(['func _physics_process(delta):', '    # entrada (20 líneas)', '    # gravedad y salto (25 líneas)', '    # animaciones (30 líneas)', '    # sonidos (15 líneas)', '    move_and_slide()']),
    solution: 'Una función que hace cinco cosas se lee y se depura mal. Divide en handle_input, apply_gravity, update_animation y play_sounds, y deja _physics_process como índice.',
  },
  {
    key: 'sm-gd-tween-each-frame', language: L, fence: F, title: 'Tween en _process',
    code: cs(['func _process(delta):', '    var tween = create_tween()', '    tween.tween_property(self, "modulate:a", target_alpha, 0.3)']),
    solution: 'Crea un tween nuevo en cada frame, así que hay decenas peleando por la misma propiedad. Crea el tween solo cuando cambia target_alpha, y mata el anterior antes.',
  },
  {
    key: 'sm-gd-double-negative', language: L, fence: F, title: 'Doble negación',
    code: cs(['var not_visible := false', '', 'if not not_visible:', '    show()']),
    solution: 'Un nombre en negativo obliga a pensar dos veces cada condición. Llama a la variable visible y escribe if visible: show().',
  },
  {
    key: 'sm-gd-magic-return', language: L, fence: F, title: 'Resultado en enteros',
    code: cs(['func check_move(pos) -> int:', '    if blocked(pos): return 0', '    if has_enemy(pos): return 1', '    return 2']),
    solution: 'Quien llama tiene que recordar que 1 significa enemigo. Devuelve un enum MoveResult { BLOCKED, ENEMY, FREE } y el código se lee solo.',
  },
  {
    key: 'sm-gd-duplicate-constants', language: L, fence: F, title: 'La misma velocidad en tres scripts',
    code: cs(['# player.gd', 'const SPEED = 300', '# dash.gd', 'const SPEED = 300', '# animation.gd', 'const RUN_THRESHOLD = 300']),
    solution: 'Tres copias del mismo valor se desincronizan en cuanto alguien ajusta una. Define la velocidad una vez, en el jugador o en un Resource de estadísticas, y que los demás la lean de ahí.',
  },
  {
    key: 'sm-gd-root-child-index', language: L, fence: F, title: 'Buscar por índice en la raíz',
    code: cs(['var hud = get_tree().root.get_child(0).get_node("UI/HUD")']),
    solution: 'Depende del orden de los hijos de la raíz, que cambia al añadir cualquier escena. Un autoload pequeño, una señal o un grupo ("hud") localizan el HUD sin adivinar índices.',
  },
  {
    key: 'sm-gd-silent-fail', language: L, fence: F, title: 'Fallo silencioso',
    code: cs(['func load_save():', '    var file = FileAccess.open(SAVE_PATH, FileAccess.READ)', '    if not file:', '        return', '    data = JSON.parse_string(file.get_as_text())']),
    solution: 'Si el guardado no se abre, la función vuelve sin decir nada y el juego arranca con datos vacíos sin explicación. Registra el motivo con push_error(FileAccess.get_open_error()) y decide qué hacer.',
  },
  {
    key: 'sm-gd-touch-internals', language: L, fence: F, title: 'Tocar las tripas del otro',
    code: cs(['func _on_attack():', '    $"../Enemy".hp -= 10', '    $"../Enemy".flash_timer = 0.2']),
    solution: 'El atacante conoce las variables internas del enemigo y las cambia por su cuenta. Que el enemigo exponga take_damage(10) y decida él mismo qué pasa con su vida y su parpadeo.',
  },
  {
    key: 'sm-gd-bool-params', language: L, fence: F, title: 'Booleanos en la llamada',
    code: cs(['set_state(true, false, true)']),
    solution: 'En la llamada no se sabe qué significa cada valor. Usa un enum, un diccionario o métodos separados (enable_gravity(), disable_input()) para que se lea sin abrir la función.',
  },
  {
    key: 'sm-gd-process-always', language: L, fence: F, title: '_process sin descanso',
    code: cs(['func _process(delta):', '    if not visible:', '        return', '    update_ai(delta)']),
    solution: 'El nodo sigue despertando cada frame solo para comprobar que no tiene que hacer nada. Llama a set_process(false) al ocultarlo y set_process(true) al mostrarlo; Godot no lo llamará mientras tanto.',
  },
  {
    key: 'sm-gd-comments-obvious', language: L, fence: F, title: 'Comentarios que repiten',
    code: cs(['hp -= damage  # resta el daño a la vida', '# incrementa i', 'i += 1', '# spawn_old()']),
    solution: 'Comentar lo que ya dice la línea añade ruido, y el código comentado nadie sabe si volverá. Comenta el porqué cuando no sea evidente y borra lo demás.',
  },
  {
    key: 'sm-gd-signal-name-concat', language: L, fence: F, title: 'Nombre de señal montado con texto',
    code: cs(['var signal_name = "on_" + action + "_pressed"', 'connect(signal_name, _on_action)']),
    solution: 'Montar el nombre de la señal con texto funciona hasta que alguien la renombra: no hay error en el editor, solo una conexión que falla al ejecutar. Conecta con la señal como valor (pressed.connect(...)) o con un diccionario explícito de acciones.',
  },
  {
    key: 'sm-gd-single-letter', language: L, fence: F, title: 'Nombres de una letra',
    code: cs(['for e in es:', '    e.h -= d', '    if e.h <= 0:', '        e.die()']),
    solution: 'Cada letra obliga a adivinar. enemies, enemy, health y damage cuestan unos caracteres más y se entienden sin contexto.',
  },
  {
    key: 'sm-gd-hardcoded-screen', language: L, fence: F, title: 'Tamaño de pantalla a mano',
    code: cs(['if position.x > 1152: position.x = 0', 'if position.y > 648: position.y = 0']),
    solution: 'Cambia la resolución en el proyecto y el envoltorio deja de coincidir. Lee get_viewport_rect().size una vez y usa ese tamaño.',
  },
];

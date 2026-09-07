// Fragmentos en GDScript (Godot 4). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'GDScript (Godot)';
const F = 'gdscript';

module.exports = [
  {
    key: 'gd-sin-delta', language: L, fence: F, title: 'Velocidad según los FPS',
    code: cs(['func _process(delta):', '    position.x += speed']),
    solution: 'Falta multiplicar por delta: se mueve speed píxeles por fotograma, así que va más rápido en ordenadores potentes.',
  },
  {
    key: 'gd-connect-con-parentesis', language: L, fence: F, title: 'El botón no hace nada',
    code: cs(['func _ready():', '    $Button.pressed.connect(_on_button_pressed())', '', 'func _on_button_pressed():', '    get_tree().change_scene_to_file("res://game.tscn")']),
    solution: 'connect recibe la función, no su resultado: sobran los paréntesis. Así la función se ejecuta una vez al arrancar (cambia de escena de golpe) y no queda conectada al botón.',
  },
  {
    key: 'gd-division-entera', language: L, fence: F, title: 'La barra siempre vacía',
    code: cs(['var current: int = 3', 'var total: int = 10', '', 'func _process(_delta):', '    progress_bar.value = current / total * 100']),
    solution: 'Dividir dos enteros da un entero: 3 / 10 es 0, y 0 * 100 sigue siendo 0. Convierte uno de los dos a float antes de dividir.',
  },
  {
    key: 'gd-queue-free-antes', language: L, fence: F, title: 'La animación de muerte no se ve',
    code: cs(['func die():', '    queue_free()', '    $AnimationPlayer.play("death")']),
    solution: 'queue_free borra el nodo al acabar el fotograma, así que la animación apenas empieza. Reproduce la animación y llama a queue_free cuando termine, por ejemplo con animation_finished.',
  },
  {
    key: 'gd-comparar-nombre', language: L, fence: F, title: 'El jugador no recibe daño',
    code: cs(['func _on_body_entered(body):', '    if body.name == "player":', '        take_damage()']),
    solution: 'El nodo se llama "Player" con mayúscula, así que la comparación falla. Y comparar por nombre es frágil: mejor usar grupos y body.is_in_group("player").',
  },
  {
    key: 'gd-await-olvidado', language: L, fence: F, title: 'El texto sale todo de golpe',
    code: cs(['func show_text(text: String):', '    for letter in text:', '        label.text += letter', '        get_tree().create_timer(0.05).timeout']),
    solution: 'Falta await delante del timeout: sin él, la señal no espera a nada y el bucle termina en un instante. Debe ser await get_tree().create_timer(0.05).timeout.',
  },
  {
    key: 'gd-move-and-slide-argumento', language: L, fence: F, title: 'Error al mover el personaje',
    code: cs(['func _physics_process(delta):', '    velocity.x = Input.get_axis("left", "right") * SPEED', '    move_and_slide(velocity)']),
    solution: 'En Godot 4, move_and_slide no recibe argumentos: usa la propiedad velocity del cuerpo. Con el argumento, el script ni siquiera arranca.',
  },
  {
    key: 'gd-pressed-en-vez-de-just', language: L, fence: F, title: 'Salta como un canguro',
    code: cs(['func _physics_process(delta):', '    if Input.is_action_pressed("jump") and is_on_floor():', '        velocity.y = JUMP_VELOCITY', '    move_and_slide()']),
    solution: 'is_action_pressed es cierto mientras se mantiene la tecla, así que salta otra vez nada más tocar el suelo. Para un salto por pulsación se usa is_action_just_pressed.',
  },
  {
    key: 'gd-nodo-sin-onready', language: L, fence: F, title: 'La etiqueta es null',
    code: cs(['var label = $ScoreLabel', '', 'func _ready():', '    label.text = "0"']),
    solution: 'Las variables de clase se inicializan antes de que los hijos existan, así que $ScoreLabel devuelve null. Hace falta @onready var label = $ScoreLabel.',
  },
  {
    key: 'gd-dado-de-cero', language: L, fence: F, title: 'El dado saca cero',
    code: cs(['func roll_dice():', '    var roll = randi() % 6', '    return roll']),
    solution: 'randi() % 6 da valores de 0 a 5. Para un dado de 1 a 6 hay que sumar 1, o usar randi_range(1, 6).',
  },
  {
    key: 'gd-texto-mas-entero', language: L, fence: F, title: 'No se puede sumar eso',
    code: cs(['func update_score():', '    score_label.text = "Puntos: " + score']),
    solution: 'No se puede concatenar una cadena con un entero directamente. Convierte con str(score) o usa "Puntos: %d" % score.',
  },
  {
    key: 'gd-instancia-sin-add-child', language: L, fence: F, title: 'El enemigo nunca aparece',
    code: cs(['func spawn_enemy():', '    var enemy = enemy_scene.instantiate()', '    enemy.position = spawn_point.position']),
    solution: 'Se crea la instancia pero no se añade al árbol: falta add_child(enemy). Sin eso, el enemigo existe en memoria pero no en la escena.',
  },
  {
    key: 'gd-rotacion-en-grados', language: L, fence: F, title: 'Gira una barbaridad',
    code: cs(['func face_right():', '    rotation = 90']),
    solution: 'rotation está en radianes: 90 radianes son más de catorce vueltas. Usa rotation_degrees = 90 o deg_to_rad(90).',
  },
  {
    key: 'gd-position-en-cuerpo', language: L, fence: F, title: 'El cuerpo ignora las colisiones',
    code: cs(['# El script está en un CharacterBody2D', 'func _process(delta):', '    position.x += speed * delta']),
    solution: 'Cambiar position a mano se salta las colisiones. Un CharacterBody2D se mueve poniendo velocity y llamando a move_and_slide en _physics_process.',
  },
  {
    key: 'gd-array-por-referencia', language: L, fence: F, title: 'La copia cambia el original',
    code: cs(['func copy_inventory():', '    var backup = inventory', '    backup.clear()', '    return backup']),
    solution: 'Los arrays se pasan por referencia: backup e inventory son el mismo array, así que clear vacía el inventario real. Usa inventory.duplicate().',
  },
  {
    key: 'gd-senal-mal-escrita', language: L, fence: F, title: 'El temporizador no avisa',
    code: cs(['func _ready():', '    $Timer.timeout.connect(on_timeout)', '', 'func _on_timeout():', '    spawn_wave()']),
    solution: 'La función se llama _on_timeout, con guion bajo, y se intenta conectar on_timeout, que no existe. El script falla al arrancar.',
  },
  {
    key: 'gd-emit-sin-argumentos', language: L, fence: F, title: 'La barra de vida no se entera',
    code: cs(['signal health_changed(current, maximum)', '', 'func take_damage(amount):', '    health -= amount', '    health_changed.emit()']),
    solution: 'La señal declara dos argumentos y se emite sin ninguno, así que la función conectada recibe menos parámetros de los que espera y falla. Debe ser health_changed.emit(health, max_health).',
  },
  {
    key: 'gd-tween-cada-frame', language: L, fence: F, title: 'Cientos de tweens',
    code: cs(['func _process(delta):', '    var tween = create_tween()', '    tween.tween_property(self, "position", target, 1.0)']),
    solution: 'Se crea un tween nuevo en cada fotograma, todos peleando por la misma propiedad. El tween se crea una vez, cuando cambia el objetivo.',
  },
  {
    key: 'gd-mascara-colision', language: L, fence: F, title: 'La zona no detecta al jugador',
    code: cs(['# Area2D con máscara de colisión: solo capa 1', '# El jugador está en la capa 2', 'func _ready():', '    body_entered.connect(_on_body_entered)']),
    solution: 'La máscara del Area2D solo mira la capa 1 y el jugador está en la 2, así que body_entered nunca se emite. Hay que activar la capa 2 en la máscara.',
  },
  {
    key: 'gd-yield-godot4', language: L, fence: F, title: 'Sintaxis de Godot 3',
    code: cs(['func flash():', '    modulate = Color.RED', '    yield(get_tree().create_timer(0.1), "timeout")', '    modulate = Color.WHITE']),
    solution: 'yield es de Godot 3. En Godot 4 no existe y el script no compila. Debe ser await get_tree().create_timer(0.1).timeout.',
  },
  {
    key: 'gd-export-sin-asignar', language: L, fence: F, title: 'No se puede instanciar null',
    code: cs(['@export var bullet_scene: PackedScene', '', 'func shoot():', '    var bullet = bullet_scene.instantiate()', '    add_child(bullet)']),
    solution: 'La variable exportada aparece en el inspector pero nadie ha arrastrado la escena, así que vale null. Hay que asignarla en el inspector o comprobar que no sea null.',
  },
  {
    key: 'gd-pausa-sin-salida', language: L, fence: F, title: 'La pausa no se puede quitar',
    code: cs(['func _on_pause_pressed():', '    get_tree().paused = true', '    $PauseMenu.show()']),
    solution: 'Al pausar el árbol, el propio menú de pausa también se congela y sus botones no responden. El menú necesita process_mode en Always para seguir funcionando en pausa.',
  },
  {
    key: 'gd-get-node-relativo', language: L, fence: F, title: 'No encuentra al jugador',
    code: cs(['# Este script está en Main/Enemies/Goblin', '# El jugador está en Main/Player', 'func _ready():', '    player = get_node("Player")']),
    solution: 'get_node busca a partir del nodo actual, y Player no es hijo del goblin. Hay que dar la ruta relativa correcta, como get_node("../../Player"), o mejor buscarlo por grupo.',
  },
  {
    key: 'gd-lerp-sin-delta', language: L, fence: F, title: 'La cámara depende de los FPS',
    code: cs(['func _process(delta):', '    position = position.lerp(target.position, 0.1)']),
    solution: 'Con un factor fijo por fotograma, la cámara alcanza al objetivo el doble de rápido a 120 FPS que a 60. Mete delta en el factor, por ejemplo 1.0 - exp(-8.0 * delta).',
  },
  {
    key: 'gd-referencia-liberada', language: L, fence: F, title: 'Instancia previamente liberada',
    code: cs(['func kill(enemy):', '    enemy.queue_free()', '', 'func _process(delta):', '    for enemy in enemies:', '        enemy.look_at(player.position)']),
    solution: 'El enemigo se libera pero sigue en el array, y al fotograma siguiente se le llama look_at: error de instancia liberada. Hay que quitarlo del array al matarlo, o comprobar is_instance_valid.',
  },
  {
    key: 'gd-connect-en-process', language: L, fence: F, title: 'Señal ya conectada',
    code: cs(['func _process(delta):', '    $Area2D.body_entered.connect(_on_body_entered)']),
    solution: 'Se intenta conectar la misma señal en cada fotograma, y Godot da error porque ya está conectada. Las señales se conectan una vez, en _ready o en el editor.',
  },
  {
    key: 'gd-escala-negativa', language: L, fence: F, title: 'Colisiones raras al girar',
    code: cs(['# El script está en el CharacterBody2D', 'func face(direction):', '    scale.x = -1 if direction < 0 else 1']),
    solution: 'La física no soporta escala negativa en cuerpos: las colisiones se comportan de forma extraña. Se voltea el sprite con flip_h, no el cuerpo entero.',
  },
  {
    key: 'gd-accion-mayuscula', language: L, fence: F, title: 'La acción no existe',
    code: cs(['# En el Input Map la acción se llama "jump"', 'func _physics_process(delta):', '    if Input.is_action_just_pressed("Jump"):', '        jump()']),
    solution: 'Los nombres de acción distinguen mayúsculas: "Jump" no existe y Godot avisa en cada consulta. Debe ser "jump", tal como está en el Input Map.',
  },
  {
    key: 'gd-load-en-process', language: L, fence: F, title: 'Tirones al disparar',
    code: cs(['func _process(delta):', '    if Input.is_action_just_pressed("shoot"):', '        var bullet = load("res://bullet.tscn").instantiate()', '        add_child(bullet)']),
    solution: 'load lee la escena del disco cada vez que se dispara. Se carga una vez con preload o en una variable al arrancar y se instancia desde ahí.',
  },
  {
    key: 'gd-position-local', language: L, fence: F, title: 'La bala aparece en otro sitio',
    code: cs(['func shoot():', '    var bullet = bullet_scene.instantiate()', '    bullet.position = $Muzzle.position', '    get_parent().add_child(bullet)']),
    solution: 'position es relativa al padre, y la bala se añade a otro padre, así que aparece desplazada. Al pasar de un nodo a otro se usa global_position.',
  },
];

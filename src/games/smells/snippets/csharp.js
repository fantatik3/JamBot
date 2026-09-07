// Fragmentos en C# (Unity). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'C# (Unity)';
const F = 'csharp';

module.exports = [
  {
    key: 'sm-cs-find-update', language: L, fence: F, title: 'Buscar al jugador cada frame',
    code: cs(['void Update()', '{', '    var player = GameObject.Find("Player");', '    transform.LookAt(player.transform);', '}']),
    solution: 'GameObject.Find recorre toda la escena y aquí se llama sesenta veces por segundo. Guarda la referencia una vez en Start o Awake, o exponla con [SerializeField] y arrástrala en el inspector.',
  },
  {
    key: 'sm-cs-getcomponent-fixed', language: L, fence: F, title: 'GetComponent en cada paso de física',
    code: cs(['void FixedUpdate()', '{', '    GetComponent<Rigidbody>().AddForce(Vector3.up * thrust);', '}']),
    solution: 'GetComponent busca el componente en cada llamada. Cachéalo en Awake en un campo privado (rb = GetComponent<Rigidbody>()) y usa ese campo.',
  },
  {
    key: 'sm-cs-magic-numbers', language: L, fence: F, title: 'Números sueltos',
    code: cs(['if (health < 20) PlayLowHealth();', 'speed = isRunning ? 7.5f : 3.2f;', 'if (Vector3.Distance(a, b) < 1.75f) Interact();']),
    solution: 'Cada número tiene un significado que solo está en la cabeza de quien lo escribió, y cambiarlo obliga a buscarlo por todo el proyecto. Dales nombre: constantes o campos [SerializeField] como lowHealthThreshold, runSpeed o interactRange.',
  },
  {
    key: 'sm-cs-public-fields', language: L, fence: F, title: 'Todo público por el inspector',
    code: cs(['public float speed;', 'public int hp;', 'public Transform target;', 'public bool isDead;']),
    solution: 'Se hacen públicos solo para verlos en el inspector, y de paso cualquier script puede tocarlos. [SerializeField] private los muestra en el inspector sin abrir la puerta al resto del código; lo que sí deba leerse desde fuera, como propiedad de solo lectura.',
  },
  {
    key: 'sm-cs-god-class', language: L, fence: F, title: 'El GameManager lo hace todo',
    code: cs(['void Update()', '{', '    HandleInput();', '    MoveEnemies();', '    RefreshHud();', '    UpdateMusic();', '    AutoSave();', '}']),
    solution: 'Una clase que gestiona entrada, enemigos, interfaz, música y guardado cambia por cinco motivos distintos y acaba con mil líneas. Reparte cada responsabilidad en su componente y deja que el GameManager solo coordine.',
  },
  {
    key: 'sm-cs-tag-string', language: L, fence: F, title: 'Comparar el tag con ==',
    code: cs(['void OnTriggerEnter(Collider other)', '{', '    if (other.gameObject.tag == "Enemy") TakeDamage(1);', '}']),
    solution: 'Leer .tag crea una cadena nueva cada vez y la comparación por texto no avisa si escribes mal el tag. CompareTag("Enemy") no asigna memoria y lanza un error si el tag no existe. Las capas o un componente Enemy son aún más robustos.',
  },
  {
    key: 'sm-cs-string-state', language: L, fence: F, title: 'Estados en cadenas',
    code: cs(['string state = "idle";', '', 'if (state == "jumping") ApplyGravity();', 'else if (state == "dashing") KeepSpeed();']),
    solution: 'Un estado en texto acepta cualquier valor, no autocompleta y un "jumpin" mal escrito pasa en silencio. Un enum State { Idle, Jumping, Dashing } con un switch deja los estados a la vista y el compilador avisa de los que faltan.',
  },
  {
    key: 'sm-cs-bool-flags', language: L, fence: F, title: 'Una bandera por estado',
    code: cs(['bool isJumping, isFalling, isDashing, isClimbing, isDead;', '', 'if (!isJumping && !isFalling && !isDashing && !isClimbing && !isDead)', '    Walk();']),
    solution: 'Cinco booleanos permiten 32 combinaciones y solo unas pocas tienen sentido, así que cada rama tiene que negar todas las demás. Un único estado (enum o máquina de estados) hace imposible estar saltando y muerto a la vez.',
  },
  {
    key: 'sm-cs-copy-paste-move', language: L, fence: F, title: 'Cuatro métodos casi iguales',
    code: cs([
      'void MoveLeft()  { transform.position += Vector3.left * speed * Time.deltaTime; }',
      'void MoveRight() { transform.position += Vector3.right * speed * Time.deltaTime; }',
      'void MoveUp()    { transform.position += Vector3.up * speed * Time.deltaTime; }',
      'void MoveDown()  { transform.position += Vector3.down * speed * Time.deltaTime; }',
    ]),
    solution: 'Cuatro copias de la misma línea: cualquier cambio hay que hacerlo cuatro veces y tarde o temprano una se queda atrás. Un solo Move(Vector3 direction) elimina la repetición.',
  },
  {
    key: 'sm-cs-nested-ifs', language: L, fence: F, title: 'Escalera de ifs',
    code: cs(['if (player != null)', '{', '    if (player.IsAlive)', '    {', '        if (player.HasKey)', '        {', '            OpenDoor();', '        }', '    }', '}']),
    solution: 'Cada nivel de anidación empuja la acción real más a la derecha y hace más difícil ver qué condiciones hacen falta. Con salidas tempranas (if (player == null) return; if (!player.IsAlive) return; ...) la lógica queda plana y legible.',
  },
  {
    key: 'sm-cs-instantiate-destroy', language: L, fence: F, title: 'Crear y destruir cada bala',
    code: cs(['void Shoot()', '{', '    var bullet = Instantiate(bulletPrefab, muzzle.position, muzzle.rotation);', '    Destroy(bullet, 2f);', '}']),
    solution: 'Funciona, pero con muchas balas Instantiate y Destroy generan basura y tirones cuando el recolector pasa. Un pool de balas que se activan y desactivan reutiliza los objetos y mantiene el frame estable.',
  },
  {
    key: 'sm-cs-singleton-chain', language: L, fence: F, title: 'Instance de todo',
    code: cs(['void OnCoinPicked()', '{', '    ScoreManager.Instance.Add(10);', '    AudioManager.Instance.Play("coin");', '    UIManager.Instance.RefreshScore();', '    SaveManager.Instance.MarkDirty();', '}']),
    solution: 'La moneda conoce cuatro sistemas distintos y no se puede probar ni reutilizar sin todos ellos en escena. Que la moneda solo anuncie un evento (OnCoinPicked) y que puntuación, audio, interfaz y guardado se suscriban cada uno por su lado.',
  },
  {
    key: 'sm-cs-static-mutable', language: L, fence: F, title: 'Puntuación estática global',
    code: cs(['public static class Game', '{', '    public static int score;', '    public static int lives;', '}', '', '// en cualquier parte: Game.score += 10;']),
    solution: 'Cualquier script puede cambiar la puntuación desde cualquier sitio, y cuando un valor sale mal no hay forma de saber quién lo tocó. Que un solo dueño la modifique con un método (AddScore) y avise con un evento; el resto solo lee.',
  },
  {
    key: 'sm-cs-resources-load-loop', language: L, fence: F, title: 'Cargar el clip en cada salto',
    code: cs(['void Jump()', '{', '    var clip = Resources.Load<AudioClip>("sfx/jump");', '    source.PlayOneShot(clip);', '}']),
    solution: 'Resources.Load busca y carga el asset cada vez que se salta. Carga el clip una vez en Awake, o mejor, asígnalo en un campo [SerializeField] y olvídate de Resources.',
  },
  {
    key: 'sm-cs-empty-catch', language: L, fence: F, title: 'Excepción tragada',
    code: cs(['try', '{', '    SaveGame();', '}', 'catch (Exception)', '{', '}']),
    solution: 'Si el guardado falla, nadie se entera: ni el log ni la persona que juega. Como mínimo registra el error con Debug.LogException y avisa en pantalla; tragarse la excepción solo convierte un fallo visible en uno misterioso.',
  },
  {
    key: 'sm-cs-dead-code', language: L, fence: F, title: 'Código comentado',
    code: cs(['// speed = 4f;', '// if (old) MoveOld();', 'speed = 6f; // velocidad', '// TODO quitar', '// transform.Translate(dir * 4f);']),
    solution: 'El código comentado no se ejecuta pero sí se lee, y nadie sabe si es historia o algo pendiente. Bórralo: el historial de git lo guarda si hiciera falta. Y un comentario que repite la línea ("velocidad") no aporta nada.',
  },
  {
    key: 'sm-cs-text-every-frame', language: L, fence: F, title: 'Texto de puntuación cada frame',
    code: cs(['void Update()', '{', '    scoreText.text = "Score: " + score;', '}']),
    solution: 'Concatena una cadena nueva y vuelve a maquetar el texto sesenta veces por segundo aunque la puntuación no cambie. Actualiza el texto solo cuando cambia la puntuación, desde el método que la modifica o un evento.',
  },
  {
    key: 'sm-cs-long-params', language: L, fence: F, title: 'Ocho parámetros',
    code: cs(['void SpawnEnemy(float x, float y, float z, int hp, float speed,', '                int damage, bool isBoss, Color tint)']),
    solution: 'Con tantos parámetros del mismo tipo es fácil pasar dos en el orden equivocado y la firma crece con cada nuevo dato. Agrupa la posición en un Vector3 y las estadísticas en un EnemyData (ScriptableObject o struct) que el método reciba entero.',
  },
  {
    key: 'sm-cs-bool-params', language: L, fence: F, title: 'Booleanos misteriosos',
    code: cs(['SetVisible(true, false, true);', '', 'void SetVisible(bool body, bool weapon, bool shadow) { ... }']),
    solution: 'En la llamada nadie sabe qué significa cada true. Usa argumentos con nombre (weapon: false), métodos separados (ShowBody, HideWeapon) o un enum de partes; el código se lee sin abrir la definición.',
  },
  {
    key: 'sm-cs-inheritance-reuse', language: L, fence: F, title: 'Heredar para reutilizar',
    code: cs(['class Enemy : MonoBehaviour { public void Move() { ... } }', '', '// la bala también se mueve, así que...', 'class Bullet : Enemy { }']),
    solution: 'Una bala no es un enemigo: arrastra vida, IA y todo lo que Enemy tenga, y cualquier cambio en Enemy la rompe. Saca el movimiento a un componente propio (Mover) y añádelo a los dos.',
  },
  {
    key: 'sm-cs-hardcoded-path', language: L, fence: F, title: 'Ruta de guardado fija',
    code: cs(['File.WriteAllText("C:/Users/ana/Desktop/save.json", json);']),
    solution: 'Funciona en un ordenador y en ningún otro. Application.persistentDataPath da la carpeta correcta en cada sistema y se combina con Path.Combine.',
  },
  {
    key: 'sm-cs-coroutine-string', language: L, fence: F, title: 'Corrutina por nombre',
    code: cs(['StartCoroutine("FadeOut");', '// ...', 'StopCoroutine("FadeOut");']),
    solution: 'Con cadenas, renombrar FadeOut no avisa y el error aparece en tiempo de ejecución. Guarda la corrutina en una variable (fade = StartCoroutine(FadeOut())) y detén esa; o al menos usa nameof(FadeOut).',
  },
  {
    key: 'sm-cs-poll-death', language: L, fence: F, title: 'Vigilar la vida cada frame',
    code: cs(['void Update()', '{', '    if (health <= 0 && !isDead) Die();', '}']),
    solution: 'Comprueba sesenta veces por segundo algo que solo cambia cuando alguien hace daño. Llama a Die desde TakeDamage, en el momento en que la vida baja de cero, y Update queda libre.',
  },
  {
    key: 'sm-cs-null-chain', language: L, fence: F, title: 'Cadena de nulos',
    code: cs(['if (player != null && player.Stats != null && player.Stats.Weapon != null)', '    damage = player.Stats.Weapon.Damage;']),
    solution: 'Tantas comprobaciones dicen que el código no confía en sus propios datos. Garantiza que un Player siempre tiene Stats y un arma por defecto (aunque sea "manos vacías") y la cadena desaparece; o usa player?.Stats?.Weapon?.Damage ?? 0 si de verdad es opcional.',
  },
  {
    key: 'sm-cs-naming-mix', language: L, fence: F, title: 'Tres estilos de nombre',
    code: cs(['public float MoveSpeed;', 'float jump_force;', 'int HP;', 'bool canjump;']),
    solution: 'Cuatro campos, cuatro convenciones. Da igual cuál elijas, pero elige una para todo el proyecto: en C# lo habitual es camelCase para campos privados y PascalCase para propiedades y métodos.',
  },
  {
    key: 'sm-cs-linq-update', language: L, fence: F, title: 'LINQ en Update',
    code: cs(['void Update()', '{', '    var closest = enemies.Where(e => e.IsAlive)', '                          .OrderBy(e => Vector3.Distance(transform.position, e.transform.position))', '                          .First();', '}']),
    solution: 'Cada frame crea enumeradores, ordena la lista entera y genera basura, para quedarse con un solo elemento. Un bucle que guarde el más cercano no asigna nada, y calcularlo cada varios frames suele bastar.',
  },
  {
    key: 'sm-cs-debug-log-update', language: L, fence: F, title: 'Debug.Log olvidado',
    code: cs(['void Update()', '{', '    Debug.Log("aqui");', '    Debug.Log(transform.position);', '}']),
    solution: 'Sesenta líneas por segundo en la consola esconden los errores de verdad y Debug.Log no es gratis en la build. Quita los logs de depuración al terminar, o envuélvelos en un flag de depuración.',
  },
  {
    key: 'sm-cs-awake-overrides', language: L, fence: F, title: 'Awake pisa el inspector',
    code: cs(['[SerializeField] float speed = 5f;', '', 'void Awake()', '{', '    speed = 8f;', '}']),
    solution: 'El valor del inspector no sirve de nada porque Awake lo sobrescribe, y quien lo ajuste en el editor no entenderá por qué no cambia. Decide una fuente de verdad: o el inspector o el código, no las dos.',
  },
  {
    key: 'sm-cs-method-two-things', language: L, fence: F, title: 'TakeDamage hace de todo',
    code: cs(['public void TakeDamage(int amount)', '{', '    health -= amount;', '    hudText.text = health.ToString();', '    audio.PlayOneShot(hurtClip);', '    cameraShake.Play();', '}']),
    solution: 'La vida sabe de interfaz, sonido y cámara, y ninguno de esos puede cambiar sin tocar este método. Que TakeDamage solo cambie la vida y lance un evento OnDamaged; HUD, audio y cámara se suscriben.',
  },
  {
    key: 'sm-cs-int-for-enum', language: L, fence: F, title: 'Tipo de enemigo en int',
    code: cs(['int enemyType = 2; // 0 slime, 1 bat, 2 knight', '', 'if (enemyType == 2) Block();']),
    solution: 'El significado de cada número vive en un comentario que nadie actualiza. Un enum EnemyType { Slime, Bat, Knight } se lee solo y evita el 3 que no existe.',
  },
];

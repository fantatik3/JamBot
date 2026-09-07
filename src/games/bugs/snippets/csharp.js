// Fragmentos en C# (Unity). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'C# (Unity)';
const F = 'csharp';

module.exports = [
  {
    key: 'cs-sin-deltatime', language: L, fence: F, title: 'Movimiento sin delta time',
    code: cs(['void Update()', '{', '    transform.position += Vector3.right * speed;', '}']),
    solution: 'Falta multiplicar por Time.deltaTime: el personaje se mueve más rápido cuantos más fotogramas por segundo haya.',
  },
  {
    key: 'cs-tag-minuscula', language: L, fence: F, title: 'Etiqueta que no coincide',
    code: cs(['void OnTriggerEnter2D(Collider2D other)', '{', '    if (other.CompareTag("player"))', '        TakeDamage();', '}']),
    solution: 'La etiqueta del jugador es "Player" con mayúscula. CompareTag distingue mayúsculas, así que nunca coincide y además avisa de que la etiqueta no existe.',
  },
  {
    key: 'cs-destroy-this', language: L, fence: F, title: 'El enemigo no desaparece',
    code: cs(['void Die()', '{', '    Destroy(this);', '    Instantiate(explosion, transform.position, Quaternion.identity);', '}']),
    solution: 'Destroy(this) destruye el script, no el objeto: el enemigo sigue en la escena sin comportamiento. Debe ser Destroy(gameObject).',
  },
  {
    key: 'cs-corrutina-sin-start', language: L, fence: F, title: 'El fundido no arranca',
    code: cs(['void Start()', '{', '    FadeOut();', '}', '', 'IEnumerator FadeOut()', '{', '    for (float t = 0; t < 1; t += Time.deltaTime)', '    {', '        canvasGroup.alpha = 1 - t;', '        yield return null;', '    }', '}']),
    solution: 'Una corrutina no arranca llamándola como una función normal: hace falta StartCoroutine(FadeOut()). Así no pasa nada.',
  },
  {
    key: 'cs-igualdad-float', language: L, fence: F, title: 'Nunca llega',
    code: cs(['void Update()', '{', '    transform.position = Vector3.MoveTowards(transform.position, target, speed * Time.deltaTime);', '    if (transform.position.x == target.x)', '        Arrived();', '}']),
    solution: 'Comparar floats con == casi nunca acierta por los decimales. Usa Mathf.Approximately o una distancia mínima.',
  },
  {
    key: 'cs-getkeydown-fixed', language: L, fence: F, title: 'El salto se pierde a veces',
    code: cs(['void FixedUpdate()', '{', '    if (Input.GetKeyDown(KeyCode.Space))', '        Jump();', '}']),
    solution: 'GetKeyDown solo es cierto durante el fotograma de la pulsación, y FixedUpdate no corre en todos los fotogramas. Lee la entrada en Update y aplica el salto en FixedUpdate.',
  },
  {
    key: 'cs-indice-fuera', language: L, fence: F, title: 'Se pasa uno',
    code: cs(['for (int i = 0; i <= enemies.Length; i++)', '{', '    enemies[i].ResetState();', '}']),
    solution: 'El <= recorre una posición de más: el último índice válido es Length - 1. IndexOutOfRangeException en la última vuelta.',
  },
  {
    key: 'cs-remove-en-foreach', language: L, fence: F, title: 'Limpieza que revienta',
    code: cs(['foreach (var enemy in enemies)', '{', '    if (enemy.health <= 0)', '        enemies.Remove(enemy);', '}']),
    solution: 'No se puede quitar de una lista mientras se recorre con foreach: InvalidOperationException. Recorre al revés con un for, o usa enemies.RemoveAll(e => e.health <= 0).',
  },
  {
    key: 'cs-prefab-sin-instantiate', language: L, fence: F, title: 'La bala no sale',
    code: cs(['void Shoot()', '{', '    GameObject bullet = bulletPrefab;', '    bullet.transform.position = firePoint.position;', '    bullet.GetComponent<Rigidbody2D>().linearVelocity = firePoint.right * bulletSpeed;', '}']),
    solution: 'No se crea ninguna bala: se está moviendo el propio prefab. Falta Instantiate(bulletPrefab, firePoint.position, firePoint.rotation).',
  },
  {
    key: 'cs-random-range-int', language: L, fence: F, title: 'El último nunca sale',
    code: cs(['int index = Random.Range(0, items.Length - 1);', 'Spawn(items[index]);']),
    solution: 'Con enteros, Random.Range excluye el máximo, así que el último objeto nunca se elige. Debe ser Random.Range(0, items.Length).',
  },
  {
    key: 'cs-evento-sin-baja', language: L, fence: F, title: 'Game over por triplicado',
    code: cs(['void OnEnable()', '{', '    GameEvents.OnPlayerDied += ShowGameOver;', '}']),
    solution: 'Se suscribe al evento pero nunca se da de baja en OnDisable. Cada vez que el objeto se reactiva se suscribe otra vez, y ShowGameOver acaba llamándose varias veces o sobre objetos destruidos.',
  },
  {
    key: 'cs-temporizador-mal-reset', language: L, fence: F, title: 'Dispara sin parar',
    code: cs(['timer += Time.deltaTime;', 'if (timer > cooldown)', '{', '    Shoot();', '    timer = cooldown;', '}']),
    solution: 'El temporizador se deja en cooldown en vez de ponerlo a 0, así que la condición se cumple en cada fotograma después del primer disparo. Debe ser timer = 0f.',
  },
  {
    key: 'cs-layermask-indice', language: L, fence: F, title: 'El raycast ignora el suelo',
    code: cs(['bool grounded = Physics2D.Raycast(', '    transform.position, Vector2.down, 0.2f,', '    LayerMask.NameToLayer("Ground"));']),
    solution: 'NameToLayer devuelve el número de la capa (por ejemplo 8), no una máscara. Como máscara, ese número selecciona otras capas. Debe ser LayerMask.GetMask("Ground").',
  },
  {
    key: 'cs-getcomponent-null', language: L, fence: F, title: 'Explota al empezar',
    code: cs(['// El HUD lo crea otro script en su Start', 'void Awake()', '{', '    hud = FindObjectOfType<Hud>();', '    hud.SetLives(lives);', '}']),
    solution: 'Awake corre antes que cualquier Start, así que el HUD todavía no existe: hud es null y salta NullReferenceException. Búscalo en Start, o mejor después de que se cree, y comprueba que no sea null.',
  },
  {
    key: 'cs-division-entera', language: L, fence: F, title: 'La barra de vida siempre vacía',
    code: cs(['int current = 30;', 'int max = 100;', '', 'void UpdateBar()', '{', '    float percent = current / max * 100;', '    bar.fillAmount = percent / 100f;', '}']),
    solution: 'current y max son enteros, así que 30 / 100 da 0 antes de multiplicar. Convierte uno a float: (float)current / max.',
  },
  {
    key: 'cs-transform-con-rigidbody', language: L, fence: F, title: 'Atraviesa las paredes',
    code: cs(['// El objeto tiene un Rigidbody2D dinámico', 'void Update()', '{', '    transform.position += Vector3.right * input * speed * Time.deltaTime;', '}']),
    solution: 'Mover por transform.position se salta la física: el cuerpo se teletransporta cada fotograma y las colisiones no se calculan bien. Usa rb.linearVelocity o rb.MovePosition en FixedUpdate.',
  },
  {
    key: 'cs-collision-con-trigger', language: L, fence: F, title: 'La moneda no se recoge',
    code: cs(['// El collider de la moneda está marcado como Is Trigger', 'void OnCollisionEnter2D(Collision2D collision)', '{', '    if (collision.gameObject.CompareTag("Player"))', '        Pickup();', '}']),
    solution: 'Un collider marcado como trigger no genera OnCollisionEnter, sino OnTriggerEnter. La función nunca se llama.',
  },
  {
    key: 'cs-invoke-nombre', language: L, fence: F, title: 'No reaparece',
    code: cs(['void Die()', '{', '    gameObject.SetActive(false);', '    Invoke("Respawn", 2f);', '}', '', 'void RespawnPlayer()', '{', '    gameObject.SetActive(true);', '}']),
    solution: 'Invoke busca un método llamado exactamente "Respawn" y aquí se llama RespawnPlayer, así que avisa en consola y no pasa nada. Los nombres en texto no los comprueba el compilador.',
  },
  {
    key: 'cs-time-time-absoluto', language: L, fence: F, title: 'Explota demasiado pronto',
    code: cs(['void Update()', '{', '    float timer = Time.time;', '    if (timer > 3f)', '        Explode();', '}']),
    solution: 'Time.time es el tiempo desde que arrancó el juego, no desde que apareció la bomba. Guarda Time.time al aparecer y compara la diferencia.',
  },
  {
    key: 'cs-lerp-factor-fijo', language: L, fence: F, title: 'Suavizado que depende de los FPS',
    code: cs(['void Update()', '{', '    transform.position = Vector3.Lerp(transform.position, target.position, 0.1f);', '}']),
    solution: 'Con un factor fijo por fotograma, a 144 FPS llega el doble de rápido que a 60. Multiplica el factor por Time.deltaTime o usa SmoothDamp.',
  },
  {
    key: 'cs-corrutina-en-inactivo', language: L, fence: F, title: 'La corrutina muere con el objeto',
    code: cs(['void Die()', '{', '    gameObject.SetActive(false);', '    StartCoroutine(RespawnAfter(2f));', '}']),
    solution: 'Un objeto desactivado no puede ejecutar corrutinas: StartCoroutine falla o se detiene. Lánzala desde un objeto que siga activo, como un gestor.',
  },
  {
    key: 'cs-getcomponent-hijo', language: L, fence: F, title: 'El Animator es null',
    code: cs(['// El componente Animator está en el hijo "Model"', 'void Awake()', '{', '    animator = GetComponent<Animator>();', '}']),
    solution: 'GetComponent solo mira en el propio objeto. Como el Animator está en un hijo, devuelve null. Usa GetComponentInChildren<Animator>().',
  },
  {
    key: 'cs-clamp-invertido', language: L, fence: F, title: 'La vida se vuelve loca',
    code: cs(['void Heal(int amount)', '{', '    health = Mathf.Clamp(health + amount, maxHealth, 0);', '}']),
    solution: 'Los argumentos de Clamp van (valor, mínimo, máximo) y aquí están al revés. Debe ser Mathf.Clamp(health + amount, 0, maxHealth).',
  },
  {
    key: 'cs-wait-en-pausa', language: L, fence: F, title: 'El menú de pausa se congela',
    code: cs(['IEnumerator ShowPauseMenu()', '{', '    Time.timeScale = 0f;', '    yield return new WaitForSeconds(0.5f);', '    pausePanel.SetActive(true);', '}']),
    solution: 'WaitForSeconds usa el tiempo del juego, que está a 0 por la pausa, así que nunca termina. Usa WaitForSecondsRealtime.',
  },
  {
    key: 'cs-camera-main-null', language: L, fence: F, title: 'Camera.main es null',
    code: cs(['// La cámara de la escena no tiene la etiqueta MainCamera', 'void Update()', '{', '    Vector3 mouse = Camera.main.ScreenToWorldPoint(Input.mousePosition);', '}']),
    solution: 'Camera.main busca una cámara con la etiqueta MainCamera. Sin ella devuelve null y salta NullReferenceException. Pon la etiqueta o guarda una referencia a la cámara.',
  },
  {
    key: 'cs-raycast-a-si-mismo', language: L, fence: F, title: 'El raycast siempre choca',
    code: cs(['RaycastHit2D hit = Physics2D.Raycast(transform.position, Vector2.right, 5f);', 'if (hit.collider != null)', '    Debug.Log("Hay algo delante: " + hit.collider.name);']),
    solution: 'El rayo sale desde dentro del propio collider y lo detecta a él mismo, así que siempre hay "algo delante". Usa una máscara de capas o desactiva las consultas que empiezan dentro de colliders.',
  },
  {
    key: 'cs-settrigger-cada-frame', language: L, fence: F, title: 'La animación se reinicia sin parar',
    code: cs(['void Update()', '{', '    if (isRunning)', '        animator.SetTrigger("Run");', '}']),
    solution: 'SetTrigger se dispara en cada fotograma mientras corre, así que la animación se reinicia constantemente. Un estado continuo se controla con SetBool, no con un trigger.',
  },
  {
    key: 'cs-escena-no-en-build', language: L, fence: F, title: 'No carga el siguiente nivel',
    code: cs(['// La escena Level2 existe en la carpeta Scenes', 'void NextLevel()', '{', '    SceneManager.LoadScene("Level2");', '}']),
    solution: 'Una escena solo se puede cargar si está en la lista de Build Settings. Si no está, LoadScene falla con un error en consola.',
  },
  {
    key: 'cs-lista-estatica', language: L, fence: F, title: 'Enemigos fantasma',
    code: cs(['public class Enemy : MonoBehaviour', '{', '    public static List<Enemy> all = new List<Enemy>();', '', '    void Start()', '    {', '        all.Add(this);', '    }', '}']),
    solution: 'La lista es estática y sobrevive al cambiar de escena, pero los enemigos se destruyen. Quedan referencias a objetos destruidos. Hay que quitarse de la lista en OnDestroy.',
  },
  {
    key: 'cs-mouse-en-pantalla', language: L, fence: F, title: 'El cursor se va a otro lado',
    code: cs(['void Update()', '{', '    Vector3 pos = Input.mousePosition;', '    crosshair.position = pos;', '}']),
    solution: 'Input.mousePosition está en píxeles de pantalla, no en unidades del mundo. Convierte con Camera.main.ScreenToWorldPoint antes de usarlo como posición.',
  },
  {
    key: 'cs-boton-no-configurado', language: L, fence: F, title: 'Input Button no está configurado',
    code: cs(['void Update()', '{', '    if (Input.GetButtonDown("Fire"))', '        Shoot();', '}']),
    solution: 'El sistema de entrada clásico de Unity define el botón como "Fire1", no "Fire". Con un nombre que no existe salta un error en cada fotograma y nunca dispara.',
  },
  {
    key: 'cs-find-nieto', language: L, fence: F, title: 'No encuentra el arma',
    code: cs(['// Jerarquía: Player > Arm > Weapon', 'void Awake()', '{', '    weapon = transform.Find("Weapon");', '}']),
    solution: 'transform.Find solo busca entre los hijos directos, y Weapon es nieto. Hay que dar la ruta completa: transform.Find("Arm/Weapon").',
  },
  {
    key: 'cs-lookat-en-2d', language: L, fence: F, title: 'El sprite desaparece al apuntar',
    code: cs(['// Juego 2D', 'void Update()', '{', '    transform.LookAt(target);', '}']),
    solution: 'LookAt orienta el eje Z hacia el objetivo, así que en 2D gira el sprite hacia dentro de la pantalla y deja de verse. En 2D se calcula el ángulo con Mathf.Atan2 y se rota solo en Z.',
  },
  {
    key: 'cs-addforce-en-update', language: L, fence: F, title: 'Empuja más en ordenadores rápidos',
    code: cs(['void Update()', '{', '    if (Input.GetKey(KeyCode.D))', '        rb.AddForce(Vector2.right * force);', '}']),
    solution: 'AddForce se llama una vez por fotograma, así que a más FPS más fuerza acumulada. Las fuerzas van en FixedUpdate, que corre a ritmo fijo.',
  },
  {
    key: 'cs-siguiente-escena-fuera', language: L, fence: F, title: 'Explota en el último nivel',
    code: cs(['void LevelComplete()', '{', '    int next = SceneManager.GetActiveScene().buildIndex + 1;', '    SceneManager.LoadScene(next);', '}']),
    solution: 'En el último nivel, next se sale de la lista de escenas y LoadScene falla. Hay que comprobar contra SceneManager.sceneCountInBuildSettings y volver al menú.',
  },
  {
    key: 'cs-setparent-escala', language: L, fence: F, title: 'La bala se deforma',
    code: cs(['void Shoot()', '{', '    var bullet = Instantiate(bulletPrefab, firePoint.position, Quaternion.identity);', '    bullet.transform.SetParent(transform);', '}']),
    solution: 'Al hacerla hija del jugador, la bala hereda su escala y su movimiento: se estira si el jugador está escalado y se mueve con él. Las balas no deberían ser hijas de quien dispara.',
  },
  {
    key: 'cs-instance-en-start', language: L, fence: F, title: 'El gestor es null a veces',
    code: cs(['public class GameManager : MonoBehaviour', '{', '    public static GameManager Instance;', '', '    void Start()', '    {', '        Instance = this;', '    }', '}']),
    solution: 'Instance se asigna en Start, pero otros objetos pueden usar GameManager.Instance en su Awake o Start antes de que este Start se ejecute. Asígnalo en Awake.',
  },
  {
    key: 'cs-triggerstay-danio', language: L, fence: F, title: 'La lava mata al instante',
    code: cs(['void OnTriggerStay2D(Collider2D other)', '{', '    if (other.CompareTag("Player"))', '        other.GetComponent<Health>().Damage(10);', '}']),
    solution: 'OnTriggerStay se llama en cada paso de física mientras el jugador está dentro: unas 50 veces por segundo. Hay que aplicar el daño con un temporizador o solo al entrar.',
  },
];

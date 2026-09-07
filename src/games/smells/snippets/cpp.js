// Fragmentos en C++ (motores propios, SDL, SFML). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'C++';
const F = 'cpp';

module.exports = [
  {
    key: 'sm-cpp-raw-new', language: L, fence: F, title: 'new y delete a mano',
    code: cs(['Enemy* e = new Enemy();', 'enemies.push_back(e);', '// ... más tarde', 'delete e;']),
    solution: 'Cada new exige recordar su delete en el sitio correcto, y una salida temprana o una excepción lo saltan. std::unique_ptr o guardar los enemigos por valor en el vector deja la liberación en manos del compilador.',
  },
  {
    key: 'sm-cpp-using-namespace-header', language: L, fence: F, title: 'using namespace en la cabecera',
    code: cs(['// game.h', '#include <string>', 'using namespace std;']),
    solution: 'Todo archivo que incluya la cabecera hereda el using y las colisiones de nombres que trae. En cabeceras, escribe std::string; el using, si acaso, en un .cpp.',
  },
  {
    key: 'sm-cpp-macro-constants', language: L, fence: F, title: 'Constantes con #define',
    code: cs(['#define SPEED 5', '#define MAX_ENEMIES 100', '#define GRAVITY 9.8']),
    solution: 'Las macros no tienen tipo ni ámbito y el depurador no las ve. constexpr float kSpeed = 5.0f; hace lo mismo con tipo, nombre y espacio de nombres.',
  },
  {
    key: 'sm-cpp-globals', language: L, fence: F, title: 'Variables globales',
    code: cs(['int score;', 'Player player;', 'std::vector<Enemy> enemies;', '', 'void update() { player.update(enemies); score++; }']),
    solution: 'Cualquier función puede tocar el estado desde cualquier archivo y el orden de inicialización entre archivos no está garantizado. Agrupa el estado en una clase Game y pásalo a quien lo necesite.',
  },
  {
    key: 'sm-cpp-by-value', language: L, fence: F, title: 'Vector por valor',
    code: cs(['void draw(std::vector<Sprite> sprites)', '{', '    for (auto& s : sprites) s.draw();', '}']),
    solution: 'Copia el vector entero en cada llamada. const std::vector<Sprite>& evita la copia y deja claro que la función no lo modifica.',
  },
  {
    key: 'sm-cpp-c-arrays', language: L, fence: F, title: 'Array fijo y contador',
    code: cs(['Enemy enemies[100];', 'int enemyCount = 0;', '', 'enemies[enemyCount++] = Enemy();']),
    solution: 'El límite es arbitrario y el contador hay que mantenerlo a mano. std::vector<Enemy> crece solo, sabe su tamaño y se recorre con range-for.',
  },
  {
    key: 'sm-cpp-string-state', language: L, fence: F, title: 'Estado en cadena',
    code: cs(['std::string state = "idle";', 'if (state == "jump") applyGravity();']),
    solution: 'Comparar cadenas es lento y un "jumpp" mal escrito no da error. enum class State { Idle, Jump, Dash } y un switch con el que el compilador avisa de los casos que faltan.',
  },
  {
    key: 'sm-cpp-bool-flags', language: L, fence: F, title: 'Una bandera por estado',
    code: cs(['bool isJumping, isFalling, isDashing, isDead;']),
    solution: 'Cuatro booleanos permiten combinaciones imposibles y cada if tiene que negar los demás. Un solo enum class State evita estar saltando y muerto a la vez.',
  },
  {
    key: 'sm-cpp-god-class', language: L, fence: F, title: 'Game lo hace todo',
    code: cs(['class Game {', '    void update() { input(); physics(); ai(); render(); audio(); save(); }', '    // 2000 líneas más', '};']),
    solution: 'Una clase que cambia por seis motivos distintos acaba siendo imposible de tocar sin romper algo. Cada sistema en su clase (Input, Physics, Renderer) y Game solo los coordina.',
  },
  {
    key: 'sm-cpp-out-params', language: L, fence: F, title: 'Salida por punteros',
    code: cs(['void getPosition(float* x, float* y, float* z);', '', 'float x, y, z;', 'getPosition(&x, &y, &z);']),
    solution: 'Tres variables sin inicializar y tres punteros para devolver un valor. Devuelve una struct Vec3 (o std::tuple) y la llamada se reduce a auto pos = getPosition().',
  },
  {
    key: 'sm-cpp-index-loop', language: L, fence: F, title: 'Bucle por índice',
    code: cs(['for (int i = 0; i < enemies.size(); ++i)', '{', '    enemies[i].update();', '}']),
    solution: 'Mezcla int con size_t (aviso de signos) y el índice no se usa para nada. for (auto& enemy : enemies) enemy.update(); es más corto y no puede salirse del rango.',
  },
  {
    key: 'sm-cpp-copy-paste', language: L, fence: F, title: 'Cuatro funciones casi iguales',
    code: cs(['void moveLeft()  { pos.x -= speed * dt; }', 'void moveRight() { pos.x += speed * dt; }', 'void moveUp()    { pos.y -= speed * dt; }', 'void moveDown()  { pos.y += speed * dt; }']),
    solution: 'La misma línea cuatro veces: cualquier cambio se hace cuatro veces y alguna se queda atrás. Un solo move(Vec2 direction).',
  },
  {
    key: 'sm-cpp-nested-ifs', language: L, fence: F, title: 'Escalera de ifs',
    code: cs(['if (player) {', '    if (player->alive) {', '        if (player->hasKey) {', '            door.open();', '        }', '    }', '}']),
    solution: 'La acción queda a tres niveles de profundidad. Salidas tempranas (if (!player) return;) dejan la función plana.',
  },
  {
    key: 'sm-cpp-ownership-unclear', language: L, fence: F, title: 'Quién borra la textura',
    code: cs(['Texture* loadTexture(const std::string& path);', '', 'Texture* tex = loadTexture("hero.png");']),
    solution: 'Un puntero crudo no dice si quien llama debe liberar la textura o si la guarda un gestor. std::unique_ptr o std::shared_ptr en la firma deja la propiedad clara y hace imposible olvidarse.',
  },
  {
    key: 'sm-cpp-inheritance-reuse', language: L, fence: F, title: 'Heredar para reutilizar',
    code: cs(['class Enemy { public: void move(float dt); };', 'class Bullet : public Enemy {}; // solo por move()']),
    solution: 'Una bala no es un enemigo: hereda vida, IA y tamaño de objeto que no usa. Un componente Mover o una función libre que usen las dos.',
  },
  {
    key: 'sm-cpp-long-params', language: L, fence: F, title: 'Ocho parámetros',
    code: cs(['void spawnEnemy(float x, float y, float z, int hp, float speed,', '                int damage, bool boss, Color tint);']),
    solution: 'Con tantos parámetros del mismo tipo es fácil cambiar dos de orden sin que el compilador diga nada. Agrupa en Vec3 y una struct EnemyData que se pase entera.',
  },
  {
    key: 'sm-cpp-const-missing', language: L, fence: F, title: 'Sin const',
    code: cs(['float getHealth() { return health; }', 'void render(Scene& scene) { scene.draw(); }']),
    solution: 'Sin const no se puede llamar a getHealth desde un objeto const, y render dice que va a modificar la escena aunque no lo haga. float getHealth() const y void render(const Scene& scene).',
  },
  {
    key: 'sm-cpp-c-cast', language: L, fence: F, title: 'Casts al estilo C',
    code: cs(['int cells = (int)(distance / cellSize);', 'Enemy* e = (Enemy*)entity;']),
    solution: 'El cast de C hace lo que sea necesario sin decir qué, incluidos casts peligrosos. static_cast<int> y static_cast<Enemy*> (o dynamic_cast si hay duda) dicen la intención y el compilador comprueba.',
  },
  {
    key: 'sm-cpp-include-all', language: L, fence: F, title: 'Cabecera que incluye todo',
    code: cs(['// common.h', '#include "player.h"', '#include "enemy.h"', '#include "renderer.h"', '#include "audio.h"', '#include "save.h"']),
    solution: 'Cada archivo que incluya common.h recompila cuando cambie cualquiera de los cinco. Incluye solo lo que uses y usa declaraciones adelantadas (class Enemy;) en las cabeceras.',
  },
  {
    key: 'sm-cpp-printf-debug', language: L, fence: F, title: 'printf de depuración',
    code: cs(['void update(float dt)', '{', '    printf("dt=%f pos=%f\\n", dt, pos.x);', '    // ...', '}']),
    solution: 'Sesenta líneas por segundo en la consola frenan el juego y esconden lo importante. Quítalo o envuélvelo en una macro o función de log con nivel.',
  },
  {
    key: 'sm-cpp-ignore-return', language: L, fence: F, title: 'Ignorar el resultado',
    code: cs(['SDL_Init(SDL_INIT_VIDEO);', 'window = SDL_CreateWindow("Jam", 0, 0, 800, 600, 0);', 'renderer = SDL_CreateRenderer(window, -1, 0);']),
    solution: 'Si algo falla, el programa sigue con punteros nulos y revienta más tarde en otro sitio. Comprueba cada resultado y muestra SDL_GetError(); un fallo claro al arrancar ahorra una hora de depuración.',
  },
  {
    key: 'sm-cpp-char-buffer', language: L, fence: F, title: 'Buffer de char',
    code: cs(['char name[32];', 'strcpy(name, input);']),
    solution: 'strcpy no conoce el tamaño del buffer y un nombre largo lo desborda. std::string crece sola y se compara y concatena sin funciones de C.',
  },
  {
    key: 'sm-cpp-singleton-chain', language: L, fence: F, title: 'Instance de todo',
    code: cs(['void onCoin()', '{', '    Score::instance().add(10);', '    Audio::instance().play("coin");', '    Hud::instance().refresh();', '}']),
    solution: 'La moneda depende de tres singletons y no se puede probar sin ellos. Que emita un evento o llame a una interfaz que reciba; puntuación, audio e interfaz se suscriben.',
  },
  {
    key: 'sm-cpp-bool-params', language: L, fence: F, title: 'Booleanos misteriosos',
    code: cs(['setVisible(true, false, true);']),
    solution: 'En la llamada no se sabe qué es cada true. Un enum con banderas (Parts::Body | Parts::Shadow) o métodos separados se leen sin abrir la definición.',
  },
  {
    key: 'sm-cpp-manual-array', language: L, fence: F, title: 'new[] para un buffer',
    code: cs(['float* samples = new float[count];', 'fill(samples, count);', 'delete[] samples;']),
    solution: 'Otro par new/delete que una excepción o un return temprano se saltan. std::vector<float> samples(count) libera sola.',
  },
  {
    key: 'sm-cpp-int-enum', language: L, fence: F, title: 'Estado en int',
    code: cs(['int state = 2; // 0 idle, 1 walk, 2 jump', 'if (state == 2) applyGravity();']),
    solution: 'El significado vive en un comentario que nadie actualiza. enum class State { Idle, Walk, Jump } se lee solo y no acepta un 7.',
  },
  {
    key: 'sm-cpp-macro-function', language: L, fence: F, title: 'Macro como función',
    code: cs(['#define MAX(a, b) ((a) > (b) ? (a) : (b))', '', 'int best = MAX(score++, record);']),
    solution: 'La macro evalúa sus argumentos dos veces: score++ se ejecuta dos veces cuando gana. std::max, o una función inline, evalúa cada argumento una sola vez y tiene tipo.',
  },
  {
    key: 'sm-cpp-endl-loop', language: L, fence: F, title: 'endl en cada línea',
    code: cs(['for (const auto& line : log)', '    std::cout << line << std::endl;']),
    solution: 'endl vacía el buffer en cada línea, lo que con miles de líneas se nota. Escribe el salto con "\\n" y deja que el flujo vacíe cuando toque.',
  },
  {
    key: 'sm-cpp-comments-dead', language: L, fence: F, title: 'Código comentado',
    code: cs(['// pos.x += 4;', '// if (old) drawOld();', 'pos.x += speed * dt; // mueve', '// TODO borrar']),
    solution: 'El código comentado no se ejecuta pero se lee, y nadie sabe si volverá. Bórralo, el historial lo guarda. Un comentario que repite la línea no aporta nada.',
  },
  {
    key: 'sm-cpp-public-all', language: L, fence: F, title: 'Todo público',
    code: cs(['class Player {', 'public:', '    float health;', '    float maxHealth;', '    // health puede acabar por encima de maxHealth desde fuera', '};']),
    solution: 'Cualquiera puede poner la vida por encima del máximo o en negativo. Campos privados y métodos que mantengan las reglas (heal, takeDamage) protegen el invariante.',
  },
];

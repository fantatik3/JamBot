// Fragmentos en C++ (con y sin Unreal). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const F = 'cpp';

module.exports = [
  {
    key: 'cpp-sin-inicializar', language: 'C++', fence: F, title: 'Puntuación con basura',
    code: cs(['int score;', '', 'void AddPoints(int points)', '{', '    score += points;', '}']),
    solution: 'score no se inicializa, así que empieza con el valor que hubiera en memoria. Ponlo a 0 al declararlo.',
  },
  {
    key: 'cpp-puntero-nulo', language: 'C++ (Unreal)', fence: F, title: 'Crash al no haber objetivo',
    code: cs(['AActor* Target = FindTarget();', 'Target->TakeDamage(10.f);']),
    solution: 'FindTarget puede devolver nullptr cuando no hay nadie cerca, y se usa sin comprobar: acceso a puntero nulo y crash. Comprueba if (Target) antes.',
  },
  {
    key: 'cpp-asignacion-en-if', language: 'C++', fence: F, title: 'Vidas que desaparecen',
    code: cs(['if (lives = 0)', '{', '    GameOver();', '}']),
    solution: 'Es una asignación, no una comparación: lives se pone a 0 y el if nunca entra. Debe ser lives == 0.',
  },
  {
    key: 'cpp-erase-en-bucle', language: 'C++', fence: F, title: 'Borrar enemigos revienta',
    code: cs(['for (auto& enemy : enemies)', '{', '    if (enemy.health <= 0)', '        enemies.erase(std::find(enemies.begin(), enemies.end(), enemy));', '}']),
    solution: 'Borrar de un vector mientras se recorre con un bucle de rango invalida los iteradores: comportamiento indefinido y crash. Usa erase con remove_if después del bucle.',
  },
  {
    key: 'cpp-referencia-colgante', language: 'C++', fence: F, title: 'Devuelve algo que ya no existe',
    code: cs(['const std::string& GetPlayerName()', '{', '    std::string name = "Jugador " + std::to_string(id);', '    return name;', '}']),
    solution: 'Se devuelve una referencia a una variable local que se destruye al salir de la función. Devuelve la cadena por valor.',
  },
  {
    key: 'cpp-indice-array', language: 'C++', fence: F, title: 'Escribe fuera del array',
    code: cs(['int lives[3] = {3, 3, 3};', 'lives[3] = 0;']),
    solution: 'Un array de 3 tiene índices 0, 1 y 2. Escribir en lives[3] toca memoria ajena sin que el compilador avise; puede corromper otra variable o fallar más tarde.',
  },
  {
    key: 'cpp-switch-sin-break', language: 'C++', fence: F, title: 'Todos los estados a la vez',
    code: cs(['switch (state)', '{', '    case Idle:', '        PlayIdle();', '    case Walk:', '        PlayWalk();', '    case Attack:', '        PlayAttack();', '}']),
    solution: 'Faltan los break: en estado Idle se ejecutan PlayIdle, PlayWalk y PlayAttack seguidos. Cada case necesita su break.',
  },
  {
    key: 'cpp-division-entera-float', language: 'C++', fence: F, title: 'Velocidad cero',
    code: cs(['float speed = 1 / 2;', 'position += speed * dt;']),
    solution: '1 / 2 se calcula entre enteros y da 0 antes de convertirse a float. Escribe 1.0f / 2.0f.',
  },
  {
    key: 'cpp-uproperty-faltante', language: 'C++ (Unreal)', fence: F, title: 'El objeto desaparece solo',
    code: cs(['class AEnemySpawner : public AActor', '{', '    UEnemyConfig* Config;', '', '    void BeginPlay() override', '    {', '        Config = NewObject<UEnemyConfig>();', '    }', '};']),
    solution: 'Un puntero a UObject sin UPROPERTY es invisible para el recolector de basura de Unreal, que puede destruir el objeto en cualquier momento. Marca el miembro con UPROPERTY().',
  },
  {
    key: 'cpp-new-sin-delete', language: 'C++', fence: F, title: 'La memoria no para de subir',
    code: cs(['void Update()', '{', '    Bullet* bullet = new Bullet(position, direction);', '    bullet->Move();', '}']),
    solution: 'Cada fotograma se reserva una bala con new y nunca se libera: fuga de memoria hasta que el juego se arrastra. Usa objetos en la pila, punteros inteligentes o un pool.',
  },
  {
    key: 'cpp-referencia-vector', language: 'C++', fence: F, title: 'El primer enemigo se corrompe',
    code: cs(['Enemy& first = enemies[0];', 'enemies.push_back(Enemy());', 'first.health -= 10;']),
    solution: 'push_back puede reubicar el vector en memoria, y entonces la referencia first apunta a memoria vieja. Hay que tomar la referencia después de modificar el vector, o usar índices.',
  },
  {
    key: 'cpp-sizeof-puntero', language: 'C++', fence: F, title: 'Solo procesa dos vidas',
    code: cs(['void ResetLives(int lives[])', '{', '    int count = sizeof(lives) / sizeof(lives[0]);', '    for (int i = 0; i < count; i++)', '        lives[i] = 3;', '}']),
    solution: 'Dentro de la función, lives es un puntero, y sizeof da el tamaño del puntero, no del array. Pasa el tamaño como parámetro o usa std::array o std::vector.',
  },
  {
    key: 'cpp-tick-desactivado', language: 'C++ (Unreal)', fence: F, title: 'Tick nunca se ejecuta',
    code: cs(['AEnemy::AEnemy()', '{', '    PrimaryActorTick.bCanEverTick = false;', '}', '', 'void AEnemy::Tick(float DeltaTime)', '{', '    ChasePlayer(DeltaTime);', '}']),
    solution: 'El constructor desactiva el tick del actor, así que Tick no se llama nunca y el enemigo no persigue a nadie. Debe ser bCanEverTick = true.',
  },
  {
    key: 'cpp-comparar-char', language: 'C++', fence: F, title: 'El jefe nunca es el jefe',
    code: cs(['void OnSpawn(const char* name)', '{', '    if (name == "boss")', '        PlayBossMusic();', '}']),
    solution: 'Con const char*, == compara direcciones de memoria, no el texto. Usa std::string o strcmp.',
  },
  {
    key: 'cpp-division-entera', language: 'C++', fence: F, title: 'Barra de vida vacía',
    code: cs(['int current = 30;', 'int max = 100;', 'float ratio = current / max;', 'healthBar.SetFill(ratio);']),
    solution: 'La división se hace entre enteros y da 0 antes de guardarse en el float. Convierte uno de los dos: static_cast<float>(current) / max.',
  },
  {
    key: 'cpp-puntero-basura', language: 'C++', fence: F, title: 'Comprueba un puntero que no existe',
    code: cs(['Enemy* target;', 'if (target != nullptr)', '    target->Hit();']),
    solution: 'target no se inicializa, así que contiene basura que casi nunca es nullptr, y la comprobación no protege de nada. Inicialízalo a nullptr al declararlo.',
  },
  {
    key: 'cpp-doble-delete', language: 'C++', fence: F, title: 'Crash al limpiar',
    code: cs(['delete enemy;', 'enemies.clear();', 'delete enemy;']),
    solution: 'Se libera la misma memoria dos veces: comportamiento indefinido que suele acabar en crash. Pon el puntero a nullptr tras borrarlo, o mejor usa unique_ptr.',
  },
  {
    key: 'cpp-array-local', language: 'C++', fence: F, title: 'Devuelve un array que ya no existe',
    code: cs(['int* GetSpawnPoints()', '{', '    int points[4] = {0, 10, 20, 30};', '    return points;', '}']),
    solution: 'El array vive en la pila de la función y desaparece al salir; el puntero devuelto apunta a memoria libre. Devuelve un std::array o un std::vector por valor.',
  },
  {
    key: 'cpp-copia-en-bucle', language: 'C++', fence: F, title: 'El daño no se aplica',
    code: cs(['for (Enemy enemy : enemies)', '{', '    enemy.health -= 10;', '}']),
    solution: 'El bucle recorre copias de cada enemigo y el daño se aplica a la copia. Usa una referencia: for (Enemy& enemy : enemies).',
  },
  {
    key: 'cpp-map-inserta', language: 'C++', fence: F, title: 'Jugadores fantasma en la tabla',
    code: cs(['std::map<std::string, int> scores;', '', 'bool HasScore(const std::string& name)', '{', '    return scores[name] > 0;', '}']),
    solution: 'El operador [] crea la entrada con valor 0 si no existe, así que solo consultar ya mete jugadores en la tabla. Usa find o count para preguntar sin insertar.',
  },
  {
    key: 'cpp-size-t-al-reves', language: 'C++', fence: F, title: 'Bucle infinito al limpiar',
    code: cs(['for (size_t i = enemies.size() - 1; i >= 0; --i)', '{', '    if (enemies[i].dead)', '        enemies.erase(enemies.begin() + i);', '}']),
    solution: 'size_t no puede ser negativo: al bajar de 0 da la vuelta a un número enorme y i >= 0 siempre es cierto. Usa un int con signo o recorre con iteradores.',
  },
  {
    key: 'cpp-sombra-parametro', language: 'C++', fence: F, title: 'La vida no se guarda',
    code: cs(['class Player', '{', '    int health;', 'public:', '    Player(int health)', '    {', '        health = health;', '    }', '};']),
    solution: 'Dentro del constructor, health es el parámetro y se asigna a sí mismo; el miembro queda sin inicializar. Usa this->health = health o la lista de inicialización.',
  },
  {
    key: 'cpp-destructor-no-virtual', language: 'C++', fence: F, title: 'Fuga al borrar enemigos',
    code: cs(['class Enemy { public: ~Enemy() {} };', 'class Dragon : public Enemy { std::vector<Fire> flames; };', '', 'Enemy* e = new Dragon();', 'delete e;']),
    solution: 'El destructor de Enemy no es virtual, así que al borrar por el puntero base no se ejecuta el destructor de Dragon y flames se queda en memoria. Declara virtual ~Enemy().',
  },
  {
    key: 'cpp-overflow-puntuacion', language: 'C++', fence: F, title: 'Puntuación negativa',
    code: cs(['int score = 2000000000;', 'score += 500000000;', 'printf("%d", score);']),
    solution: 'Un int de 32 bits llega hasta unos 2147 millones; sumar más lo desborda y sale negativo. Usa long long o limita la puntuación.',
  },
  {
    key: 'cpp-getworld-en-constructor', language: 'C++ (Unreal)', fence: F, title: 'Crash al construir el actor',
    code: cs(['AEnemy::AEnemy()', '{', '    GetWorld()->GetTimerManager().SetTimer(Handle, this, &AEnemy::Attack, 1.f, true);', '}']),
    solution: 'En el constructor el actor todavía no está en ningún mundo y GetWorld devuelve nullptr. Los temporizadores se crean en BeginPlay.',
  },
  {
    key: 'cpp-spawn-clase-null', language: 'C++ (Unreal)', fence: F, title: 'No aparece ningún enemigo',
    code: cs(['// EnemyClass es un TSubclassOf<AEnemy> editable en el editor', 'void ASpawner::Spawn()', '{', '    AEnemy* Enemy = GetWorld()->SpawnActor<AEnemy>(EnemyClass, GetActorLocation(), FRotator::ZeroRotator);', '    Enemy->Activate();', '}']),
    solution: 'Si EnemyClass no se ha asignado en el editor, SpawnActor devuelve nullptr y la siguiente línea revienta. Comprueba EnemyClass y el resultado antes de usarlos.',
  },
  {
    key: 'cpp-delegado-sin-ufunction', language: 'C++ (Unreal)', fence: F, title: 'El golpe no se detecta',
    code: cs(['// En el header: void OnHit(AActor* Self, AActor* Other, FVector Impulse, const FHitResult& Hit);', 'void AProjectile::BeginPlay()', '{', '    OnActorHit.AddDynamic(this, &AProjectile::OnHit);', '}']),
    solution: 'Los delegados dinámicos solo pueden enlazar funciones marcadas con UFUNCTION(). Sin esa macro en OnHit, el enlace falla en silencio y nunca se llama.',
  },
  {
    key: 'cpp-sin-delta-sdl', language: 'C++ (SDL)', fence: F, title: 'Velocidad según el ordenador',
    code: cs(['while (running)', '{', '    HandleEvents();', '    player.x += 5;', '    Render();', '}']),
    solution: 'Sin limitar fotogramas ni medir el tiempo, el bucle corre tan rápido como pueda y el personaje vuela en un PC potente. Mide el tiempo entre vueltas y multiplica.',
  },
  {
    key: 'cpp-pop-vacio', language: 'C++', fence: F, title: 'Crash al recargar sin balas',
    code: cs(['void Reload()', '{', '    magazine.pop_back();', '    magazine.push_back(Bullet());', '}']),
    solution: 'pop_back en un vector vacío es comportamiento indefinido y suele fallar. Comprueba !magazine.empty() antes.',
  },
  {
    key: 'cpp-float-igualdad', language: 'C++', fence: F, title: 'La cuenta atrás no termina',
    code: cs(['timer -= dt;', 'if (timer == 0.0f)', '    Explode();']),
    solution: 'Restando decimales, timer casi nunca vale exactamente 0.0: pasa de 0.01 a -0.006. Compara con timer <= 0.0f.',
  },
];

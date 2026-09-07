// Fragmentos de shaders (GLSL). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const L = 'GLSL';
const F = 'glsl';

module.exports = [
  {
    key: 'glsl-fragcoord-sin-dividir', language: L, fence: F, title: 'Textura de un solo color',
    code: cs(['vec2 uv = gl_FragCoord.xy;', 'vec4 color = texture(tex, uv);']),
    solution: 'gl_FragCoord está en píxeles, no en el rango 0..1 que espera la textura. Hay que dividir por la resolución: gl_FragCoord.xy / resolution.',
  },
  {
    key: 'glsl-sin-normalizar', language: L, fence: F, title: 'Iluminación que se desmadra',
    code: cs(['float light = dot(normal, lightDir);', 'fragColor = albedo * light;']),
    solution: 'Ni normal ni lightDir están normalizados, así que el producto escalar no queda entre -1 y 1, y además los valores negativos oscurecen de más. Normaliza los dos y usa max(0.0, ...).',
  },
  {
    key: 'glsl-alpha-perdido', language: L, fence: F, title: 'El sprite no es transparente',
    code: cs(['vec4 color = texture(tex, uv);', 'fragColor = vec4(color.rgb * tint, 1.0);']),
    solution: 'Se descarta el alfa de la textura y se pone 1.0, así que todo el sprite es opaco. Debe ser vec4(color.rgb * tint, color.a).',
  },
  {
    key: 'glsl-division-entera', language: L, fence: F, title: 'Siempre negro',
    code: cs(['float half = 1 / 2;', 'fragColor = vec4(vec3(half), 1.0);']),
    solution: '1 / 2 es una división entre enteros y da 0. En GLSL hay que escribir 1.0 / 2.0.',
  },
  {
    key: 'glsl-alpha-sin-discard', language: L, fence: F, title: 'Recortes que tapan lo de detrás',
    code: cs(['vec4 color = texture(tex, uv);', 'if (color.a < 0.5)', '    color.a = 0.0;', 'fragColor = color;']),
    solution: 'Poner el alfa a 0 no evita que el píxel escriba en el búfer de profundidad, así que las hojas transparentes tapan lo que hay detrás. Para recortar hay que usar discard.',
  },
  {
    key: 'glsl-normal-map-sin-remapear', language: L, fence: F, title: 'El relieve se ve raro',
    code: cs(['vec3 n = texture(normalMap, uv).rgb;', 'float light = max(0.0, dot(n, lightDir));']),
    solution: 'Un normal map guarda las normales en 0..1 y hay que llevarlas a -1..1 con n * 2.0 - 1.0 antes de usarlas. Sin eso, todas las normales apuntan hacia arriba y a la derecha.',
  },
  {
    key: 'glsl-uv-fuera-de-rango', language: L, fence: F, title: 'La textura se estira por los bordes',
    code: cs(['vec2 uv = (gl_FragCoord.xy / resolution) * 2.0;', 'fragColor = texture(tex, uv);']),
    solution: 'Las UV llegan hasta 2.0 y la textura está en modo clamp, así que fuera de 0..1 se repite el último píxel y se ve estirada. Usa fract(uv) o pon la textura en modo repeat.',
  },
  {
    key: 'glsl-normal-interpolada', language: L, fence: F, title: 'Brillo que se apaga entre vértices',
    code: cs(['// Vertex shader', 'vNormal = normalize(normalMatrix * normal);', '', '// Fragment shader', 'float light = max(0.0, dot(vNormal, lightDir));']),
    solution: 'La normal se normaliza en el vertex shader, pero al interpolarse entre vértices deja de medir 1. Hay que volver a normalizar vNormal en el fragment shader.',
  },
  {
    key: 'glsl-smoothstep-invertido', language: L, fence: F, title: 'El borde sale al revés',
    code: cs(['float edge = smoothstep(1.0, 0.0, dist);', 'fragColor = vec4(vec3(edge), 1.0);']),
    solution: 'smoothstep espera el borde bajo primero y el alto después. Con los bordes al revés, el resultado no está definido y en la práctica sale invertido o vacío. Debe ser smoothstep(0.0, 1.0, dist).',
  },
  {
    key: 'glsl-precision-tiempo', language: L, fence: F, title: 'Tiembla tras unos minutos',
    code: cs(['precision mediump float;', 'uniform float time;', '', 'void main() {', '    float wave = sin(uv.x * 10.0 + time * 5.0);', '}']),
    solution: 'Con mediump, un tiempo grande pierde decimales y la onda empieza a dar saltos al cabo de unos minutos. Envuelve el tiempo con mod antes de pasarlo, o usa highp para esa variable.',
  },
  {
    key: 'glsl-boca-abajo', language: L, fence: F, title: 'La textura sale boca abajo',
    code: cs(['// La imagen se ve invertida verticalmente', 'vec2 uv = gl_FragCoord.xy / resolution;', 'fragColor = texture(tex, uv);']),
    solution: 'gl_FragCoord tiene el origen abajo a la izquierda y la imagen se cargó con el origen arriba. Invierte la coordenada: uv.y = 1.0 - uv.y, o voltea la imagen al cargarla.',
  },
  {
    key: 'glsl-swizzle-corto', language: L, fence: F, title: 'No compila',
    code: cs(['vec3 color = texture(tex, uv).rg;', 'fragColor = vec4(color, 1.0);']),
    solution: '.rg da un vec2 y se intenta guardar en un vec3: error de tipos al compilar. Debe ser .rgb.',
  },
  {
    key: 'glsl-literal-entero', language: L, fence: F, title: 'Error en el bucle',
    code: cs(['float total = 0;', 'for (float i = 0; i < 4; i++) {', '    total += texture(tex, uv + offsets[int(i)]).r;', '}']),
    solution: 'En GLSL ES, un float no se puede inicializar con un literal entero: 0 y 4 tienen que ser 0.0 y 4.0. Además, indexar un array con un valor no constante puede no estar permitido.',
  },
  {
    key: 'glsl-color-sin-escribir', language: L, fence: F, title: 'Píxeles de colores aleatorios',
    code: cs(['void main() {', '    if (uv.x > 0.5) {', '        fragColor = vec4(1.0, 0.0, 0.0, 1.0);', '    }', '}']),
    solution: 'En la mitad izquierda nunca se escribe fragColor, así que el color queda sin definir y sale basura o negro según la tarjeta. Escribe siempre un valor, también en el else.',
  },
  {
    key: 'glsl-floor-en-vez-de-fract', language: L, fence: F, title: 'Los tiles son de un solo color',
    code: cs(['vec2 tileUv = floor(uv * 4.0);', 'fragColor = texture(tex, tileUv);']),
    solution: 'floor deja un valor entero por tile, así que toda la casilla muestra el mismo píxel de la textura. Para repetirla dentro de cada casilla hace falta fract(uv * 4.0).',
  },
  {
    key: 'glsl-normalize-cero', language: L, fence: F, title: 'Un píxel negro en el centro',
    code: cs(['vec2 dir = normalize(uv - center);', 'float angle = atan(dir.y, dir.x);']),
    solution: 'Justo en el centro, uv - center es cero y normalizar un vector nulo da NaN: ese píxel sale negro o basura. Comprueba la longitud antes o suma un epsilon.',
  },
  {
    key: 'glsl-sin-alpha-negativo', language: L, fence: F, title: 'Parpadea a medias',
    code: cs(['float pulse = sin(time * 3.0);', 'fragColor = vec4(color.rgb, pulse);']),
    solution: 'sin va de -1 a 1, así que la mitad del tiempo el alfa es negativo y el objeto desaparece. Lleva el valor a 0..1 con sin(x) * 0.5 + 0.5.',
  },
  {
    key: 'glsl-mix-fuera-de-rango', language: L, fence: F, title: 'Colores quemados',
    code: cs(['float t = distance(uv, center) * 3.0;', 'fragColor = vec4(mix(colorA, colorB, t), 1.0);']),
    solution: 'mix extrapola cuando el factor pasa de 1, y aquí t llega hasta 4: los colores se salen del rango y se queman. Limita el factor con clamp(t, 0.0, 1.0).',
  },
  {
    key: 'glsl-step-invertido', language: L, fence: F, title: 'La máscara está al revés',
    code: cs(['// Queremos 1 fuera del círculo de radio 0.3 y 0 dentro', 'float mask = step(dist, 0.3);', 'fragColor = vec4(vec3(mask), 1.0);']),
    solution: 'step(edge, x) devuelve 1 cuando x es mayor o igual que edge. Con los argumentos cambiados, da 1 dentro del círculo: la máscara sale al revés de lo que se quería. Debe ser step(0.3, dist).',
  },
  {
    key: 'glsl-atan-invertido', language: L, fence: F, title: 'El efecto radial está girado',
    code: cs(['vec2 d = uv - vec2(0.5);', 'float angle = atan(d.x, d.y);']),
    solution: 'atan recibe primero la y y luego la x. Con el orden cambiado, el ángulo sale girado 90 grados y con el sentido invertido. Debe ser atan(d.y, d.x).',
  },
  {
    key: 'glsl-texel-fijo', language: L, fence: F, title: 'El contorno queda desplazado',
    code: cs(['vec2 texel = 1.0 / vec2(256.0, 256.0);', 'float alphaRight = texture(tex, uv + vec2(texel.x, 0.0)).a;']),
    solution: 'El tamaño de texel está fijado a 256 pero la textura es de otro tamaño, así que la muestra vecina cae en el píxel equivocado. Calcula el texel con textureSize o pásalo como uniform.',
  },
  {
    key: 'glsl-sin-matriz', language: L, fence: F, title: 'Todo aparece en el centro de la pantalla',
    code: cs(['// Vertex shader', 'in vec3 position;', 'void main() {', '    gl_Position = vec4(position, 1.0);', '}']),
    solution: 'La posición se envía sin pasar por las matrices de modelo, vista y proyección, así que se interpreta directamente en espacio de recorte. Falta multiplicar por la matriz MVP.',
  },
  {
    key: 'glsl-godot-modulate', language: L, fence: F, title: 'El tinte no se aplica',
    code: cs(['// Godot, shader_type canvas_item', 'void fragment() {', '    COLOR = texture(TEXTURE, UV);', '}']),
    solution: 'Al escribir COLOR desde cero se pierde el color de vértice, que es donde va el modulate del nodo. Multiplica por el COLOR de entrada: COLOR = texture(TEXTURE, UV) * COLOR.',
  },
  {
    key: 'glsl-godot-screen-uv', language: L, fence: F, title: 'La distorsión de pantalla sale mal',
    code: cs(['// Godot 4, shader de distorsión aplicado a un ColorRect', 'uniform sampler2D screen_tex : hint_screen_texture;', 'void fragment() {', '    COLOR = texture(screen_tex, UV + offset);', '}']),
    solution: 'UV son las coordenadas del propio nodo, no de la pantalla. Para leer la textura de pantalla en el sitio correcto hay que usar SCREEN_UV.',
  },
  {
    key: 'glsl-espacios-mezclados', language: L, fence: F, title: 'La luz gira con el objeto',
    code: cs(['// Vertex shader', 'vNormal = normal;', '// Fragment shader', 'float light = max(0.0, dot(normalize(vNormal), lightDirWorld));']),
    solution: 'La normal está en espacio del objeto y la luz en espacio del mundo. Al rotar el objeto, la iluminación gira con él. Transforma la normal con la matriz normal antes de compararla.',
  },
  {
    key: 'glsl-modo-opaco', language: L, fence: F, title: 'El alfa no hace nada',
    code: cs(['// El material está en modo opaco', 'void main() {', '    fragColor = vec4(color.rgb, 0.5);', '}']),
    solution: 'Escribir un alfa de 0.5 no sirve si el material o el pipeline no mezclan: en modo opaco el alfa se ignora. Hay que activar la mezcla o poner el material en modo transparente.',
  },
  {
    key: 'glsl-vineta-ovalada', language: L, fence: F, title: 'La viñeta es un óvalo',
    code: cs(['vec2 uv = gl_FragCoord.xy / resolution;', 'float d = distance(uv, vec2(0.5));', 'float vignette = 1.0 - smoothstep(0.4, 0.7, d);']),
    solution: 'uv va de 0 a 1 en los dos ejes aunque la pantalla sea más ancha que alta, así que el círculo se estira. Corrige la x con la relación de aspecto antes de medir la distancia.',
  },
  {
    key: 'glsl-bucle-uniform', language: L, fence: F, title: 'No compila en móvil',
    code: cs(['uniform int lightCount;', 'for (int i = 0; i < lightCount; i++) {', '    total += ComputeLight(i);', '}']),
    solution: 'En GLSL ES 1.0 y en muchos móviles el límite del bucle tiene que ser constante. Recorre hasta un máximo fijo y sal con break cuando i llegue a lightCount.',
  },
  {
    key: 'glsl-derivadas-en-rama', language: L, fence: F, title: 'Bordes con artefactos',
    code: cs(['if (dist < 0.5) {', '    float w = fwidth(dist);', '    alpha = smoothstep(0.5 - w, 0.5 + w, dist);', '}']),
    solution: 'fwidth y las derivadas no están definidas dentro de una rama que no ejecutan todos los píxeles vecinos. Calcula w fuera del if.',
  },
  {
    key: 'glsl-indice-fuera', language: L, fence: F, title: 'A veces sale un color que no es de la paleta',
    code: cs(['uniform vec3 palette[8];', 'int index = int(texture(indexTex, uv).r * 8.0);', 'fragColor = vec4(palette[index], 1.0);']),
    solution: 'Cuando el canal rojo vale exactamente 1.0, el índice es 8 y se sale del array de 0..7: el resultado no está definido y sale basura. Limita el índice con min(index, 7).',
  },
];

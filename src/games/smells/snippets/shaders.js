// Fragmentos de shaders (GLSL, HLSL y el lenguaje de Godot). Formato en ../snippets.js.
const cs = (lines) => lines.join('\n');
const F = 'glsl';

module.exports = [
  {
    key: 'sm-sh-normalize-uniform', language: 'GLSL', fence: F, title: 'Normalizar la luz por píxel',
    code: cs(['uniform vec3 uLightDir;', 'void main() {', '    vec3 l = normalize(uLightDir);', '    float d = max(dot(vNormal, l), 0.0);', '}']),
    solution: 'uLightDir es la misma para todos los píxeles, así que se normaliza millones de veces por frame el mismo vector. Normalízala una vez en la CPU antes de subirla.',
  },
  {
    key: 'sm-sh-magic-numbers', language: 'GLSL', fence: F, title: 'Números sueltos',
    code: cs(['color.rgb *= 0.72;', 'if (fresnel > 0.37) color.rgb += vec3(0.15);', 'alpha = smoothstep(0.42, 0.58, noise);']),
    solution: 'Cada número es un ajuste que alguien encontró probando y nadie recuerda. Uniforms con nombre (uShadowStrength, uRimThreshold, uEdgeWidth) permiten ajustarlos desde el motor sin recompilar.',
  },
  {
    key: 'sm-sh-branch-uniform', language: 'GLSL', fence: F, title: 'Un shader para todo con ifs',
    code: cs(['uniform int uMode;', 'void main() {', '    if (uMode == 0) color = toon();', '    else if (uMode == 1) color = pbr();', '    else color = unlit();', '}']),
    solution: 'Todas las variantes se compilan y viven en el mismo shader, y cada píxel paga la rama. Variantes separadas (keywords, #ifdef o distintos materiales) dan shaders más simples y rápidos.',
  },
  {
    key: 'sm-sh-pow-square', language: 'GLSL', fence: F, title: 'pow para elevar al cuadrado',
    code: cs(['float d2 = pow(dist, 2.0);', 'float spec = pow(ndoth, 2.0) * pow(ndoth, 2.0);']),
    solution: 'pow es una función cara para algo que es una multiplicación. dist * dist, y para la cuarta potencia dos multiplicaciones más.',
  },
  {
    key: 'sm-sh-matrix-fragment', language: 'GLSL', fence: F, title: 'Rotación calculada por píxel',
    code: cs(['void main() {', '    float c = cos(uTime), s = sin(uTime);', '    mat2 rot = mat2(c, -s, s, c);', '    vec2 uv = rot * vUv;', '}']),
    solution: 'cos y sin de uTime valen lo mismo en todos los píxeles y se calculan en cada uno. Calcula la matriz en la CPU o en el vertex shader y pásala como uniform o varying.',
  },
  {
    key: 'sm-sh-repeated-sample', language: 'GLSL', fence: F, title: 'La misma textura cuatro veces',
    code: cs(['float r = texture(uTex, vUv).r;', 'float g = texture(uTex, vUv).g;', 'float b = texture(uTex, vUv).b;', 'float a = texture(uTex, vUv).a;']),
    solution: 'Cuatro lecturas de textura del mismo texel. Una sola vec4 t = texture(uTex, vUv) y luego t.r, t.g, t.b, t.a.',
  },
  {
    key: 'sm-sh-discard-opaque', language: 'GLSL', fence: F, title: 'discard en un shader opaco',
    code: cs(['void main() {', '    vec4 c = texture(uTex, vUv);', '    if (c.a < 0.01) discard;', '    fragColor = c;', '}']),
    solution: 'En un material opaco discard nunca se cumple pero desactiva optimizaciones de profundidad temprana en toda la pasada. Reserva discard para materiales recortados de verdad.',
  },
  {
    key: 'sm-sh-highp-everywhere', language: 'GLSL ES', fence: F, title: 'highp para todo',
    code: cs(['precision highp float;', 'varying highp vec2 vUv;', 'uniform highp vec4 uTint;']),
    solution: 'En móvil highp cuesta el doble que mediump y para UVs, colores y factores de mezcla mediump sobra. Reserva highp para posiciones y cálculos que lo necesiten.',
  },
  {
    key: 'sm-sh-length-compare', language: 'GLSL', fence: F, title: 'length para comparar distancias',
    code: cs(['if (length(p - center) < radius) inside = 1.0;']),
    solution: 'length calcula una raíz cuadrada solo para comparar. Compara los cuadrados: vec2 d = p - center; if (dot(d, d) < radius * radius).',
  },
  {
    key: 'sm-sh-dynamic-loop', language: 'GLSL', fence: F, title: 'Bucle con límite dinámico',
    code: cs(['uniform int uLightCount;', 'for (int i = 0; i < uLightCount; i++) {', '    color += shade(lights[i]);', '}']),
    solution: 'Con límite variable el compilador no puede desenrollar el bucle y en algunos móviles ni siquiera compila. Un límite constante (MAX_LIGHTS) con un break o un peso cero para las luces sobrantes rinde mejor.',
  },
  {
    key: 'sm-sh-hardcoded-resolution', language: 'GLSL', fence: F, title: 'Resolución fija',
    code: cs(['vec2 uv = gl_FragCoord.xy / vec2(1920.0, 1080.0);']),
    solution: 'En cualquier otra resolución el efecto se estira. Pasa el tamaño de la pantalla como uniform (uResolution) o usa las UVs del vertex shader.',
  },
  {
    key: 'sm-sh-per-channel', language: 'GLSL', fence: F, title: 'Canal a canal',
    code: cs(['color.r = tex.r * tint.r * k;', 'color.g = tex.g * tint.g * k;', 'color.b = tex.b * tint.b * k;']),
    solution: 'Tres líneas que hacen la misma operación vectorial. color.rgb = tex.rgb * tint.rgb * k; es más corta y deja que el compilador use las operaciones vectoriales.',
  },
  {
    key: 'sm-sh-unused', language: 'GLSL', fence: F, title: 'Uniforms sin usar',
    code: cs(['uniform float uSpeed;', 'uniform vec3 uOldColor;', 'varying vec3 vOldNormal;', '// ninguno se usa en main']),
    solution: 'Cada uniform y varying sin usar confunde a quien lee y ocupa un slot del material en el motor. Bórralos; si los necesitas, git los recuerda.',
  },
  {
    key: 'sm-sh-time-drift', language: 'GLSL', fence: F, title: 'sin de un tiempo enorme',
    code: cs(['float wave = sin(uTime * 80.0);']),
    solution: 'Después de unos minutos uTime es grande y la precisión del float se va: la onda tiembla o se congela. Pasa el tiempo ya acotado (mod(time, periodo)) desde la CPU.',
  },
  {
    key: 'sm-sh-hardcoded-color', language: 'GLSL', fence: F, title: 'Colores escritos a mano',
    code: cs(['vec3 outline = vec3(0.9, 0.2, 0.1);', 'vec3 fog = vec3(0.55, 0.6, 0.7);', '// también en otros tres shaders']),
    solution: 'Cuando arte cambie la paleta habrá que editar cada shader. Colores como uniforms, ajustables desde el material y compartidos entre shaders.',
  },
  {
    key: 'sm-sh-double-normalize', language: 'GLSL', fence: F, title: 'Normalizar dos veces',
    code: cs(['vec3 n = normalize(vNormal);', 'n = normalize(n);', 'float d = dot(normalize(n), l);']),
    solution: 'El vector ya está normalizado tras la primera llamada; las otras dos son trabajo gratis por píxel. Una vez basta.',
  },
  {
    key: 'sm-sh-smoothstep-reinvented', language: 'GLSL', fence: F, title: 'smoothstep a mano',
    code: cs(['float t = clamp((x - a) / (b - a), 0.0, 1.0);', 't = t * t * (3.0 - 2.0 * t);']),
    solution: 'Es exactamente smoothstep(a, b, x), que además puede estar optimizada en el hardware. Usa la función y el código dice lo que hace.',
  },
  {
    key: 'sm-sh-if-select', language: 'GLSL', fence: F, title: 'if para elegir un color',
    code: cs(['vec3 c;', 'if (mask > 0.5) c = colorA;', 'else c = colorB;']),
    solution: 'Funciona, pero mix(colorB, colorA, step(0.5, mask)) evita la rama y es lo que el compilador acaba generando de todos modos; además se lee como una operación de mezcla.',
  },
  {
    key: 'sm-sh-inverse-vertex', language: 'GLSL', fence: F, title: 'inverse en el vertex shader',
    code: cs(['void main() {', '    mat4 invModel = inverse(uModel);', '    vLocalLight = (invModel * vec4(uLightPos, 1.0)).xyz;', '}']),
    solution: 'Invierte la misma matriz para cada vértice, y inverse es de lo más caro que hay. Calcúlala una vez en la CPU y pásala como uniform.',
  },
  {
    key: 'sm-sh-dead-code', language: 'GLSL', fence: F, title: 'Código comentado',
    code: cs(['// color *= 0.5;', '// float old = texture(uOld, vUv).r;', 'color = texture(uTex, vUv); // lee la textura', '// TODO quitar']),
    solution: 'El código comentado se lee pero no se ejecuta, y nadie sabe si volverá. Bórralo, y borra también el comentario que repite la línea.',
  },
  {
    key: 'sm-sh-noise-copied', language: 'GLSL', fence: F, title: 'La misma función hash en tres shaders',
    code: cs(['float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }', '// copiada tal cual en fog.glsl, water.glsl y dissolve.glsl']),
    solution: 'Tres copias que divergen en cuanto alguien corrige una. Un include compartido (#include o el sistema de includes del motor) o una función en un archivo común.',
  },
  {
    key: 'sm-sh-uv-epsilon', language: 'GLSL', fence: F, title: 'Parche de UV',
    code: cs(['vec2 uv = vUv + vec2(0.001, 0.001); // arregla la costura']),
    solution: 'El desplazamiento esconde el síntoma: la costura viene del filtrado o del wrap de la textura. Arregla la causa (clamp to edge, padding en el atlas o medio texel calculado con el tamaño real) y quita el parche.',
  },
  {
    key: 'sm-sh-blur-copy-paste', language: 'GLSL', fence: F, title: 'Desenfoque a base de copiar',
    code: cs([
      'c += texture(uTex, vUv + vec2(-2.0, 0.0) * px) * 0.06;',
      'c += texture(uTex, vUv + vec2(-1.0, 0.0) * px) * 0.24;',
      'c += texture(uTex, vUv) * 0.4;',
      'c += texture(uTex, vUv + vec2(1.0, 0.0) * px) * 0.24;',
      'c += texture(uTex, vUv + vec2(2.0, 0.0) * px) * 0.06;',
    ]),
    solution: 'Cinco líneas iguales con los pesos escritos a mano; cambiar el radio es reescribirlas. Un bucle con un array constante de pesos, y el radio en un solo sitio.',
  },
  {
    key: 'sm-sh-float4-scalar', language: 'HLSL', fence: 'hlsl', title: 'float4 para un escalar',
    code: cs(['float4 fade = float4(alpha, 0, 0, 0);', 'color *= fade.x;']),
    solution: 'Guarda un número en un vector de cuatro y luego lee uno. Un float alpha basta y el compilador no tiene que arrastrar tres componentes vacíos.',
  },
  {
    key: 'sm-sh-lerp-if', language: 'HLSL', fence: 'hlsl', title: 'if para acotar el lerp',
    code: cs(['if (t < 1.0) c = lerp(a, b, t);', 'else c = b;']),
    solution: 'lerp(a, b, saturate(t)) hace lo mismo sin rama y en una línea; en GLSL, mix con clamp(t, 0.0, 1.0).',
  },
  {
    key: 'sm-sh-precision-mix', language: 'GLSL ES', fence: F, title: 'Precisiones mezcladas',
    code: cs(['mediump vec2 uv = vUv;', 'highp float t = uTime;', 'lowp vec4 c = texture(uTex, uv * t);']),
    solution: 'Mezclar precisiones sin criterio fuerza conversiones y da resultados distintos por dispositivo. Elige una precisión por defecto y sube solo lo que la necesite (posiciones, tiempo).',
  },
  {
    key: 'sm-sh-all-in-fragment', language: 'GLSL', fence: F, title: 'Todo en el fragment',
    code: cs(['void main() {', '    vec3 worldPos = (uModel * vec4(vLocalPos, 1.0)).xyz;', '    vec3 toLight = normalize(uLightPos - worldPos);', '    // ...', '}']),
    solution: 'La posición en mundo es lineal y puede calcularse por vértice e interpolarse. Muévela al vertex shader y pásala como varying; el fragment solo hace lo que varía por píxel.',
  },
  {
    key: 'sm-sh-magic-swizzle', language: 'GLSL', fence: F, title: 'Swizzle críptico',
    code: cs(['vec4 packed = texture(uData, vUv);', 'float speed = packed.z;', 'float life = packed.w;', 'float kind = packed.y;']),
    solution: 'Nadie sabe qué canal guarda qué sin buscar el código que escribe la textura. Un comentario en la cabecera con el formato o, mejor, funciones con nombre (unpackSpeed) para leer cada dato.',
  },
  {
    key: 'sm-sh-texture-in-branch', language: 'GLSL', fence: F, title: 'texture dentro de un if',
    code: cs(['if (vUv.x > 0.5) {', '    c = texture(uTexA, vUv);', '} else {', '    c = texture(uTexB, vUv);', '}']),
    solution: 'Muestrear dentro de una rama con condición por píxel rompe el cálculo de mipmaps en los bordes de la rama y muchas GPU ejecutan las dos igualmente. Muestrea las dos fuera y mezcla con step o mix.',
  },
  {
    key: 'sm-sh-godot-hint-missing', language: 'Godot shader', fence: F, title: 'Uniform sin hint',
    code: cs(['shader_type canvas_item;', 'uniform vec4 tint;', 'uniform float amount;']),
    solution: 'Sin hints Godot muestra tint como cuatro números y amount como un campo libre. uniform vec4 tint : source_color; y uniform float amount : hint_range(0.0, 1.0); dan selector de color y deslizador a quien ajuste el material.',
  },
];

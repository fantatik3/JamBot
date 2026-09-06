/**
 * Une líneas en el menor número posible de cadenas sin que ninguna supere `maxLength`.
 * Sirve para repartir listas largas en varios mensajes de Discord (límite de 2000 caracteres).
 */
function chunkLines(lines, maxLength) {
  const chunks = [];
  let current = '';

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > maxLength && current) {
      chunks.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/** Pasa a minúsculas y quita los acentos para que "Colisión" y "colision" sean iguales. */
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Devuelve las entradas de `words` que aparecen en `text` como palabras completas,
 * ignorando mayúsculas, acentos y plurales simples del español (-s / -es).
 */
function findForbiddenWords(text, words) {
  const haystack = normalize(text);
  const seen = new Set();
  const hits = [];

  for (const word of words) {
    const needle = normalize(word).trim();
    if (!needle || seen.has(needle)) continue;
    seen.add(needle);

    const pattern = new RegExp(`\\b${escapeRegExp(needle)}(?:s|es)?\\b`);
    if (pattern.test(haystack)) hits.push(word);
  }

  return hits;
}

/** Recorta a `max` caracteres y añade puntos suspensivos si corta. */
function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

module.exports = { chunkLines, normalize, findForbiddenWords, truncate };

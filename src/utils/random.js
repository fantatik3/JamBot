/** Devuelve un elemento aleatorio de un array no vacío. */
function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('pickRandom() requires a non-empty array');
  }
  return list[Math.floor(Math.random() * list.length)];
}

/** Divide un array en trozos de tamaño `size`. */
function chunk(list, size) {
  const result = [];
  for (let i = 0; i < list.length; i += size) {
    result.push(list.slice(i, i + size));
  }
  return result;
}

/** Devuelve una copia barajada del array (Fisher-Yates). */
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

module.exports = { pickRandom, chunk, shuffle };

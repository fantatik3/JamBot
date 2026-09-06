/**
 * Joins lines into as few strings as possible without any of them exceeding `maxLength`.
 * Used to split long lists across several Discord messages (2000-char limit).
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

/** Lowercases and strips accents so "Colisión" and "colision" compare equal. */
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
 * Returns the entries of `words` that appear in `text` as whole words,
 * ignoring case, accents and simple Spanish plurals (-s / -es).
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

/** Truncates to `max` characters, adding an ellipsis when cut. */
function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

module.exports = { chunkLines, normalize, findForbiddenWords, truncate };

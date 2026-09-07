#!/usr/bin/env node
/**
 * Comprueba que todos los idiomas de src/locales tienen exactamente las mismas claves que el
 * español, que es el idioma de referencia. Sale con código 1 si falta o sobra alguna.
 *
 *   npm run check:locales
 */
const locales = require('../src/locales');

const DEFAULT_LANGUAGE = 'es';

/** Lista de claves con puntos de un objeto anidado; funciones, cadenas y arrays son hojas. */
function flatten(node, prefix = '', out = []) {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [key, value] of Object.entries(node)) flatten(value, prefix ? `${prefix}.${key}` : key, out);
  } else {
    out.push(prefix);
  }
  return out;
}

/** engine.strings es una función que devuelve textos: se comparan también las claves de ese resultado. */
function keysOf(locale) {
  const keys = flatten(locale);
  const engineStrings = locale.engine?.strings;
  if (typeof engineStrings === 'function') {
    keys.push(...Object.keys(engineStrings({ gameId: 'x' })).map((key) => `engine.strings().${key}`));
  }
  return new Set(keys);
}

const base = keysOf(locales[DEFAULT_LANGUAGE]);
let problems = 0;

for (const [code, locale] of Object.entries(locales)) {
  if (code === DEFAULT_LANGUAGE) continue;
  const keys = keysOf(locale);
  const missing = [...base].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !base.has(key));
  for (const key of missing) console.log(`[${code}] missing: ${key}`);
  for (const key of extra) console.log(`[${code}] extra:   ${key}`);
  console.log(`[${code}] ${keys.size} keys · ${missing.length} missing · ${extra.length} extra`);
  problems += missing.length + extra.length;
}

console.log(problems === 0 ? 'All locales match the reference language.' : `${problems} problem(s) found.`);
process.exitCode = problems === 0 ? 0 : 1;

/**
 * Tiny JSON persistence for bot state (scores, active game rounds, glossary).
 * The whole store is held in memory and written atomically on every save().
 * Path: data/store.json (override with STORE_PATH, useful for tests).
 */
const fs = require('node:fs');
const path = require('node:path');
const logger = require('./logger');

const STORE_PATH = process.env.STORE_PATH || path.join(__dirname, '..', '..', 'data', 'store.json');

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn(`Could not read ${STORE_PATH}, starting empty:`, error.message);
    cache = {};
  }
  return cache;
}

function save() {
  const data = load();
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, STORE_PATH);
}

/** Returns (and creates if missing) a named top-level object in the store. */
function section(name) {
  const data = load();
  data[name] ??= {};
  return data[name];
}

module.exports = { load, save, section, STORE_PATH };

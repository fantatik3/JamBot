/**
 * Persistencia JSON mínima para el estado del bot (puntos, rondas activas, glosario).
 * Todo el almacén se mantiene en memoria y se escribe de forma atómica en cada save().
 * Ruta: data/store.json (se puede cambiar con STORE_PATH, útil para pruebas).
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

/**
 * Guarda el almacén en disco. Nunca lanza: si el disco falla, se avisa en el log y el juego
 * sigue con el estado en memoria (se perdería solo al reiniciar).
 */
function save() {
  const data = load();
  const json = JSON.stringify(data, null, 2);
  const tmp = `${STORE_PATH}.tmp`;

  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(tmp, json);
  } catch (error) {
    logger.error(`Could not write ${tmp} (${error.code ?? error.message}); state stays in memory only.`);
    return false;
  }

  // En Windows, renombrar justo después de escribir puede fallar un instante (antivirus, indexado).
  // Se reintenta unas veces y, si sigue fallando, se escribe el archivo directamente.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.renameSync(tmp, STORE_PATH);
      return true;
    } catch (error) {
      if (attempt < 4) {
        const until = Date.now() + 20 * (attempt + 1);
        while (Date.now() < until) { /* espera breve antes de reintentar */ }
        continue;
      }
      logger.warn(`Could not replace ${STORE_PATH} atomically (${error.code}); writing it directly.`);
    }
  }

  try {
    fs.writeFileSync(STORE_PATH, json);
    try { fs.unlinkSync(tmp); } catch { /* el temporal puede haberse ido ya */ }
    return true;
  } catch (error) {
    logger.error(`Could not write ${STORE_PATH} (${error.code ?? error.message}); state stays in memory only.`);
    return false;
  }
}

/** Devuelve (y crea si no existe) un objeto de primer nivel del almacén por nombre. */
function section(name) {
  const data = load();
  data[name] ??= {};
  return data[name];
}

module.exports = { load, save, section, STORE_PATH };

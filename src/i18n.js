/**
 * Textos del bot en el idioma configurado (BOT_LANGUAGE en .env). Cada idioma vive en
 * src/locales/<código>/ y se registra en src/locales/index.js.
 *
 *   t('common.somethingWentWrong')               -> cadena
 *   t('engine.command.started', { number, link }) -> cadena con {nombre} sustituido, o el resultado
 *                                                    de la función si la clave es una función
 *   get('welcome.phrases')                        -> valor tal cual (array, objeto...) o undefined
 *
 * Si una clave falta en el idioma activo se usa la del idioma por defecto (es) y se avisa en el log
 * una sola vez por clave.
 */
const config = require('./config');
const logger = require('./utils/logger');
const locales = require('./locales');

const DEFAULT_LANGUAGE = 'es';
const language = config.language;

if (!locales[language]) {
  throw new Error(`BOT_LANGUAGE must be one of: ${Object.keys(locales).join(', ')} (got "${language}").`);
}

const warned = new Set();

function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  logger.warn(message);
}

function lookup(locale, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), locale);
}

/** Valor sin procesar de una clave, o undefined si no existe en ningún idioma. */
function get(key) {
  let value = lookup(locales[language], key);
  if (value === undefined && language !== DEFAULT_LANGUAGE) {
    value = lookup(locales[DEFAULT_LANGUAGE], key);
    if (value !== undefined) warnOnce(key, `Locale "${language}" has no text for "${key}"; using "${DEFAULT_LANGUAGE}".`);
  }
  return value;
}

function interpolate(text, params) {
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Texto de una clave. Las funciones se llaman con `params`; en las cadenas se sustituye {nombre}. */
function t(key, params = {}) {
  const value = get(key);
  if (value === undefined) {
    warnOnce(key, `Missing text for "${key}" in every locale.`);
    return key;
  }
  if (typeof value === 'function') return value(params);
  if (typeof value === 'string') return interpolate(value, params);
  return value;
}

module.exports = { t, get, language, languages: Object.keys(locales) };

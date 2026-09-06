/**
 * Logger mínimo por niveles con marcas de tiempo ISO.
 * Lee LOG_LEVEL en cada llamada para funcionar antes y después de cargar dotenv.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function currentLevel() {
  const name = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[name] ?? LEVELS.info;
}

function write(level, args) {
  if (LEVELS[level] < currentLevel()) return;
  const stamp = new Date().toISOString();
  const prefix = `[${stamp}] [${level.toUpperCase()}]`;
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  out(prefix, ...args);
}

module.exports = {
  debug: (...args) => write('debug', args),
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
};

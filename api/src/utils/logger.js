import env from '../config/env.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[env.logLevel] ?? LEVELS.debug;

function formatDev(level, msg, meta) {
  const ts = new Date().toLocaleTimeString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] ${level.toUpperCase()} ${msg}${metaStr}`;
}

function formatProd(level, msg, meta) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message: msg,
    ...meta,
  });
}

const format = env.isDev ? formatDev : formatProd;

function log(level, msg, meta) {
  if (LEVELS[level] > currentLevel) return;
  const line = format(level, msg, meta);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

export default logger;

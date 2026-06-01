// =============================================================================
// DepGraph — Structured Logger (Week 7)
// Outputs JSON log lines in production; human-readable in development.
// =============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level:     LogLevel;
  service:   string;
  message:   string;
  meta?:     Record<string, unknown>;
}

const isProd = process.env.NODE_ENV === 'production';

function emit(level: LogLevel, service: string, message: string, meta?: Record<string, unknown>) {
  // Suppress debug logs in production
  if (isProd && level === 'debug') return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };

  const line = isProd ? JSON.stringify(entry) : `[${entry.level.toUpperCase()}] [${service}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`;

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/**
 * Create a namespaced logger for a service.
 * Usage: const log = createLogger('github');
 *        log.info('Fetching repo', { owner, repo });
 */
export function createLogger(service: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', service, message, meta),
    info:  (message: string, meta?: Record<string, unknown>) => emit('info',  service, message, meta),
    warn:  (message: string, meta?: Record<string, unknown>) => emit('warn',  service, message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', service, message, meta),
  };
}

// Global logger for non-service contexts
export const log = createLogger('app');

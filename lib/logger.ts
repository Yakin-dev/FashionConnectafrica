/**
 * Structured logging helper.
 * Provides consistent log formatting with levels, timestamps, and optional request IDs.
 * In production, logs are emitted as JSON for easy ingestion by cloud log services.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  requestId?: string;
  duration?: number;
  data?: Record<string, unknown>;
  error?: { name?: string; message?: string; stack?: string };
}

const isProduction = process.env.NODE_ENV === "production";

// Simple sequential request ID generator (not crypto-secure, which is fine for logging)
let requestCounter = 0;

/**
 * Generate a short unique request ID for correlating logs across a single request.
 */
export function generateRequestId(): string {
  requestCounter += 1;
  return `req-${Date.now().toString(36)}-${requestCounter.toString(36)}`;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for cloud log ingestion
    return JSON.stringify(entry);
  }
  // Human-readable format for development
  const parts: string[] = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
  ];
  if (entry.requestId) parts.push(`[${entry.requestId}]`);
  parts.push(entry.message);
  if (entry.duration !== undefined) parts.push(`(${entry.duration}ms)`);
  if (entry.error) {
    parts.push(`error=${entry.error.message || entry.error.name || String(entry.error)}`);
  }
  return parts.join(" ");
}

function log(
  level: LogLevel,
  message: string,
  options?: {
    requestId?: string;
    duration?: number;
    data?: Record<string, unknown>;
    error?: unknown;
  }
): void {
  const entry: LogEntry = {
    level,
    timestamp: formatTimestamp(),
    message,
    requestId: options?.requestId,
    duration: options?.duration,
    data: options?.data,
  };

  if (options?.error) {
    const err = options.error;
    entry.error = {
      name: err instanceof Error ? err.name : typeof err === "string" ? err : "Unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    };
  }

  const formatted = formatLogEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, options?: { requestId?: string; data?: Record<string, unknown> }) =>
    log("debug", message, options),
  info: (message: string, options?: { requestId?: string; duration?: number; data?: Record<string, unknown> }) =>
    log("info", message, options),
  warn: (message: string, options?: { requestId?: string; data?: Record<string, unknown> }) =>
    log("warn", message, options),
  error: (message: string, options?: { requestId?: string; error?: unknown; data?: Record<string, unknown> }) =>
    log("error", message, options),
};

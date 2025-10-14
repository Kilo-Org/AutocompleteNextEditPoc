// Stub implementation for SentryLogger when @sentry packages are not available
// This allows the codebase to compile and run without Sentry dependencies

import os from "node:os";
import { IdeInfo } from "../../index.js";

// Stub types to replace Sentry types
type SentryNodeClient = any;
type SentryScope = any;
type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";
type Extras = Record<string, any>;

class SentryLogger {
  static client: SentryNodeClient | undefined = undefined;
  static scope: SentryScope | undefined = undefined;
  static uniqueId = "NOT_UNIQUE";
  static os: string | undefined = undefined;
  static ideInfo: IdeInfo | undefined = undefined;
  static allowTelemetry: boolean = false;

  private static initializeSentryClient(_release: string): {
    client: SentryNodeClient | undefined;
    scope: SentryScope | undefined;
  } {
    // Stub implementation - Sentry not available
    return { client: undefined, scope: undefined };
  }

  static async setup(
    _allowAnonymousTelemetry: boolean,
    uniqueId: string,
    ideInfo: IdeInfo,
    _userEmail?: string,
  ) {
    // Stub implementation - Sentry not available
    SentryLogger.allowTelemetry = false;
    SentryLogger.uniqueId = uniqueId;
    SentryLogger.ideInfo = ideInfo;
    SentryLogger.os = os.platform();
    SentryLogger.client = undefined;
    SentryLogger.scope = undefined;
  }

  private static ensureInitialized(): void {
    // Stub - no-op
  }

  static get lazyClient(): SentryNodeClient | undefined {
    SentryLogger.ensureInitialized();
    return SentryLogger.client;
  }

  static get lazyScope(): SentryScope | undefined {
    SentryLogger.ensureInitialized();
    return SentryLogger.scope;
  }

  static shutdownSentryClient() {
    // Stub - no-op
    SentryLogger.client = undefined;
    SentryLogger.scope = undefined;
  }
}

/**
 * Initialize Sentry for error tracking, performance monitoring, and structured logging.
 * Returns the Sentry client and scope, or undefined objects if telemetry is disabled.
 * Stub implementation - Sentry not available.
 */
function initializeSentry(): {
  client: SentryNodeClient | undefined;
  scope: SentryScope | undefined;
} {
  return {
    client: SentryLogger.lazyClient,
    scope: SentryLogger.lazyScope,
  };
}

// Export utility functions for using Sentry throughout the application

/**
 * Create a custom span for performance monitoring
 * Stub implementation - Sentry not available.
 */
function createSpan<T>(
  _operation: string,
  _name: string,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  // Stub - just execute the callback without Sentry
  return callback();
}

/**
 * Capture an exception and send it to Sentry
 * Stub implementation - Sentry not available.
 */
export function captureException(
  _error: Error,
  _context?: Record<string, any>,
) {
  // Stub - no-op when Sentry is not available
}

/**
 * Capture a structured log message and send it to Sentry
 * Stub implementation - Sentry not available.
 */
function captureLog(
  _message: string,
  _level: SeverityLevel = "info",
  _context?: Extras,
) {
  // Stub - no-op when Sentry is not available
}

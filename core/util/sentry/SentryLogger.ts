// Stub implementation for SentryLogger when @sentry packages are not available
// This allows the codebase to compile and run without Sentry dependencies

// Export utility functions for using Sentry throughout the application

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

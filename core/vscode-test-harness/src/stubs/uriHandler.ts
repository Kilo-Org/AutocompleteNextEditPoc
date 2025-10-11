// Stub for testing - not used in actual tests
export class UriEventHandler {
  constructor(_context?: any) {}

  event(callback: (uri: any) => void): any {
    // Stub implementation - never actually called in tests
    return { dispose: () => {} };
  }

  dispose() {}
}

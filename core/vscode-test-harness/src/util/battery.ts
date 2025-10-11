// Stub for testing - not used in actual tests
export class Battery {
  onChangeAC(callback: (...args: any[]) => void): any {
    // Stub implementation - never actually called in tests
    return { dispose: () => {} };
  }
  dispose() {}
}
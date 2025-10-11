// Stub for testing - not used in actual tests
export class WorkOsAuthProvider {
  constructor(_context: any, _uriHandler?: any) {}
  dispose() {}
  refreshSessions(...args: any[]): any {
    return undefined;
  }
  getSessions(...args: any[]): any[] {
    return [];
  }
  removeSession(...args: any[]): any {
    return undefined;
  }
}

export function getControlPlaneSessionInfo(...args: any[]) {
  return null;
}
// Stub for testing - not used in actual tests
export interface Repository {
  rootUri: any;
  state: any;
  diff?(cached?: boolean): Promise<string>;
}

export interface GitExtension {
  getAPI(version: number): any;
}

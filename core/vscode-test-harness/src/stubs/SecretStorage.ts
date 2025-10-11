// Stub for testing - not used in actual tests
export class SecretStorage {
  constructor(_context: any) {}
  async store(_key: string, _value: any): Promise<void> {}
  async get(_key: string): Promise<any> {
    return null;
  }
  async retrieve(_key: string): Promise<any> {
    return null;
  }
  async delete(_key: string): Promise<void> {}
}

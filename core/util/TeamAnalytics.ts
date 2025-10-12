// Minimal stub for removed control-plane functionality
export class TeamAnalytics {
  static async capture(event: string, properties: Record<string, unknown>): Promise<void> {
    // No-op stub - telemetry disabled
  }
}

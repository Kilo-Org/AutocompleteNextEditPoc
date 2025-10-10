// Minimal stub for removed control-plane functionality
export interface ControlPlaneProxyInfo {
  workOsAccessToken?: string;
  controlPlaneProxyUrl?: string;
  controlPlaneSessionInfo?: any;
}

export interface IAnalyticsProvider {
  capture(event: string, properties: any): Promise<void>;
}
// Minimal stub for removed control-plane functionality
export const EXTENSION_NAME = "continue";

type ControlPlaneEnv = {
  CONTROL_PLANE_URL?: string;
  AUTH_TYPE?: string;
} | undefined;

export function getControlPlaneEnv(...args: any[]): Promise<ControlPlaneEnv> {
  return Promise.resolve(undefined);
}

export function getControlPlaneEnvSync(): ControlPlaneEnv {
  return undefined;
}

function useHub() {
  return false;
}
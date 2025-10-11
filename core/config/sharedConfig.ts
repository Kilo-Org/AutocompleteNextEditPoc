// Stub for shared config module
import { z } from "zod";
export interface SharedConfig {
  [key: string]: unknown;
}

export const sharedConfigSchema = z.object({}).catchall(z.unknown());
export type SharedConfigSchema = z.infer<typeof sharedConfigSchema>;

export function salvageSharedConfig(input: unknown): SharedConfig {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    // Validate and coerce to a record of unknowns
    return sharedConfigSchema.parse(input);
  }
  return {};
}

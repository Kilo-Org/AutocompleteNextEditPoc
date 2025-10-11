import { TextDecoder, TextEncoder } from "util";
import { beforeAll } from "vitest";

beforeAll(async () => {
  const g: any = globalThis;

  // Node 18+ provides global fetch/Request/Response.
  // If not present (older runtime), lazily fall back to node-fetch (if installed).
  if (
    typeof g.fetch === "undefined" ||
    typeof g.Request === "undefined" ||
    typeof g.Response === "undefined"
  ) {
    try {
      const mod: any = await import("node-fetch");
      g.fetch = mod.default ?? mod.fetch ?? g.fetch;
      g.Request = mod.Request ?? g.Request;
      g.Response = mod.Response ?? g.Response;
    } catch {
      // If node-fetch isn't installed, proceed; tests relying on fetch should use Node >=18.
    }
  }

  g.TextEncoder = TextEncoder;
  g.TextDecoder = TextDecoder;
});

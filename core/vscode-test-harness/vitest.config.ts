import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      core: path.resolve(__dirname, "../"),
    },
  },
  test: {
    include: ["**/*.vitest.ts"],
    environment: "node",
  },
});

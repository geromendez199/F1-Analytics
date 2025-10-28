import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/types.ts", "lib/i18n.ts"]
    }
  }
});

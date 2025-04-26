import { defineWorkspace } from "vitest/config";
const url = new URL("./src/packages", import.meta.url).pathname;
export default defineWorkspace([
  {
    test: {
      exclude: ["node_modules", "dist"],
      name: "client",
      root: "tests/client",
      environment: "happy-dom",
      alias: {
        "@": url,
      },
      testTimeout: 10 * 1000,
    },
  },
]);

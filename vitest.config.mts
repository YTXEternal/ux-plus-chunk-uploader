import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./build/test";
import tsconfigPaths from "vite-tsconfig-paths";
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      workspace: "./vitest.workspace.ts",
      coverage: {
        provider: "v8",
        enabled: true,
        reporter: ["text", "json-summary", "json"],
        reportOnFailure: true,
      },
    },
    plugins: [tsconfigPaths()],
  })
);

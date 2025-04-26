import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("../src/packages", import.meta.url).pathname,
    },
  },
});

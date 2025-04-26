import { mergeConfig, defineConfig } from "vite";
import commonConfig from "./common";

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  })
);

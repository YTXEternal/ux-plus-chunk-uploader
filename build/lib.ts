import { mergeConfig, defineConfig } from "vite";
import { resolve } from "node:path";
import babel from "@rollup/plugin-babel";
import dts from "vite-plugin-dts";
import commonConfig from "./common";

const entry = resolve(__dirname, "../src/packages");
const outDir = resolve(__dirname, "../dist");

export default mergeConfig(
  commonConfig,
  defineConfig({
    resolve: {
      alias: {
        "@": resolve(__dirname, "../src/packages"),
      },
    },
    build: {
      assetsDir: "ats",
      assetsInlineLimit: 0,
      outDir,
      lib: {
        entry,
        name: "index",
        fileName: "index",
      },
      rollupOptions: {
        external: [/node:?.+/, "spark-md5", "axios", /\.d\.ts$/],
        output: [
          {
            // ESM
            format: "es",
            //打包后文件名
            entryFileNames: "[name].mjs",
            //让打包目录和我们目录对应
            preserveModules: true,
            exports: "named",
          },
        ],
        plugins: [
          babel({
            extensions: [".ts"],
            babelHelpers: "bundled",
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: false,
                  targets: {
                    browsers: ["last 2 versions", "> 1%", "not ie <= 12"],
                  },
                },
              ],
            ],
          }),
        ],
      },
    },
    plugins: [
      dts({
        rollupTypes: true,
        tsconfigPath: "./tsconfig.build.json",
      }),
      dts({
        tsconfigPath: "./tsconfig.build.json",
        copyDtsFiles: true,
      }),
    ],
    esbuild: {
      drop: ["console", "debugger"],
    },
    worker: {
      format: "iife",
    },
  })
);

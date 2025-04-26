import { mergeConfig, defineConfig } from "vite";
import commonConfig from "./common";

export default mergeConfig(commonConfig, defineConfig({}));

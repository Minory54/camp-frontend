import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react({ include: /\.(js|jsx|ts|tsx|mdx)$/ }),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

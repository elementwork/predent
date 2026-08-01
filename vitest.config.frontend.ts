import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts", "src/**/*.spec.tsx"],
    setupFiles: ["./vitest.setup.frontend.ts"],
    css: false,
  },
});

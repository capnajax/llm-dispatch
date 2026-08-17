import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  plugins: [react()],
  build: { outDir: "../dist/www", emptyOutDir: true },
  server: { proxy: { "/v1": "http://localhost:3000" } },
  test: { environment: "node", include: ["**/*.test.ts"] },
});

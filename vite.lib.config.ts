import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "node_modules/text-interface/dist/text-interface.umd.js", // Use the UMD build from node_modules
      name: "TextInterface",
      fileName: "text-interface.bundle",
      formats: ["iife"], // IIFE for browser/iframe injection
    },
    outDir: "src/lib",
    emptyOutDir: false,
    rollupOptions: {
      // Externalize dependencies if needed
      external: [],
    },
  },
});

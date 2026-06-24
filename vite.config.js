import { defineConfig } from "vite";

export default defineConfig({
  base: "/webspark_markup/",
  server: {
    host: true,
    port: 5173,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.min.js",
        chunkFileNames: "assets/[name].min.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "assets/app.min.css";
          }

          return "assets/[name][extname]";
        }
      }
    }
  }
});

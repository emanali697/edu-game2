import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@engine": "/src/engine",
      "@data": "/src/data",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@hooks": "/src/hooks",
      "@services": "/src/services",
      "@context": "/src/context",
      "@utils": "/src/utils",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/database"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg", "og-image.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache CDN resources (Bootstrap, etc.)
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        navigateFallback: "index.html",
      },
      manifest: {
        name: "عالم التعلّم",
        short_name: "عالم التعلّم",
        description: "منصة تعليمية وتربوية ممتعة للأطفال",
        theme_color: "#6c5ce7",
        background_color: "#faf7ff",
        display: "standalone",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "pwa-192x192.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "pwa-192x192.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
import path from "node:path";

// Routes that should also resolve as `/route/index.html` on static hosts
// (nginx/Apache without SPA fallback). Dynamic routes like /child-play/:token
// are NOT included — those still need server-side SPA rewrite or hash routing.
const SPA_STATIC_ROUTES = [
  "/login",
  "/register",
  "/setup",
  "/play",
  "/bridge-game",
  "/forgiveness-game",
  "/garden-game",
  "/memory-game",
  "/order",
  "/faq",
  "/privacy",
  "/demo",
  "/dashboard",
  "/achievements",
  "/subscription",
  "/admin",
];

function spaStaticFallbackPlugin(routes) {
  return {
    name: "spa-static-fallback",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve("dist");
      const indexHtmlPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexHtmlPath)) return;
      const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
      for (const route of routes) {
        const dir = path.join(distDir, route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), indexHtml);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    spaStaticFallbackPlugin(SPA_STATIC_ROUTES),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["vite.svg", "og-image.svg"],
      workbox: {
        cleanupOutdatedCaches: true,
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
        navigateFallbackDenylist: [/^\/docs\//],
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

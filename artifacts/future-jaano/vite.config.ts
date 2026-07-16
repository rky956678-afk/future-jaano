import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const port = Number(process.env.PORT || 5173);
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "robots.txt"],
      manifestFilename: "manifest.webmanifest",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      manifest: {
        id: "/",
        name: "Future Jaano — AI Spiritual Guidance",
        short_name: "Future Jaano",
        description:
          "AI-powered astrology, kundli, vastu, palm reading, numerology and yog guidance — Hindi & English.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#070b2d",
        theme_color: "#070b2d",
        lang: "en-IN",
        dir: "ltr",
        categories: ["lifestyle", "education", "spirituality", "wellness"],
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any"
          }
        ],
        screenshots: [
          {
            src: "/screenshots/mobile-home.jpg",
            sizes: "412x915",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Future Jaano home — AI spiritual guidance"
          },
          {
            src: "/screenshots/desktop-home.jpg",
            sizes: "1280x800",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Future Jaano on desktop"
          }
        ],
        shortcuts: [
          {
            name: "Create Free Kundli",
            short_name: "Kundli",
            description: "Generate your AI Vedic birth chart",
            url: "/kundli",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Daily Horoscope",
            short_name: "Horoscope",
            description: "Today's horoscope for your zodiac",
            url: "/horoscope",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Vastu Analysis",
            short_name: "Vastu",
            description: "Upload room photo for Vastu score",
            url: "/vastu",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Problem Solver",
            short_name: "Remedies",
            description: "AI remedies from ancient wisdom",
            url: "/problem-solver",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }]
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets")
    },
    dedupe: ["react", "react-dom"]
  },
  root: path.resolve(__dirname),
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    // Dev proxy → local API server so /api works without a shared reverse proxy
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true
      },
      "/health": {
        target: process.env.API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true
      },
      "/docs": {
        target: process.env.API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true
  }
});

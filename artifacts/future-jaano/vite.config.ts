import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        id: "https://futurejaano.com/",
        name: "Future Jaano — AI Spiritual Guidance",
        short_name: "Future Jaano",
        description:
          "AI-powered astrology, kundli, vastu, palm reading, numerology and yog guidance — Hindi & English.",
        start_url: "https://futurejaano.com/",
        scope: "https://futurejaano.com/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "browser"],
        orientation: "portrait",
        background_color: "#070b2d",
        theme_color: "#070b2d",
        lang: "en-IN",
        dir: "ltr",
        categories: ["lifestyle", "education", "spirituality", "wellness"],
        prefer_related_applications: false,
        launch_handler: { client_mode: ["navigate-existing", "auto"] },
        handle_links: "preferred",
        edge_side_panel: { preferred_width: 480 },
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
        ],
        screenshots: [
          {
            src: "/screenshots/mobile-home.jpg",
            sizes: "412x915",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Future Jaano home — AI spiritual guidance",
          },
          {
            src: "/screenshots/desktop-home.jpg",
            sizes: "1280x800",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Future Jaano on desktop",
          },
        ],
        share_target: {
          action: "/share",
          method: "GET",
          enctype: "application/x-www-form-urlencoded",
          params: { title: "title", text: "text", url: "url" },
        },
        protocol_handlers: [
          { protocol: "web+jaano", url: "/share?text=%s" },
        ],
        file_handlers: [
          {
            action: "/share",
            accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
            launch_type: "single-client",
          },
        ],
        shortcuts: [
          {
            name: "Create Free Kundli",
            short_name: "Kundli",
            description: "Generate your AI Vedic birth chart",
            url: "/kundli",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Daily Horoscope",
            short_name: "Horoscope",
            description: "Today's horoscope for your zodiac",
            url: "/horoscope",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Vastu Analysis",
            short_name: "Vastu",
            description: "Upload room photo for Vastu score",
            url: "/vastu",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Problem Solver",
            short_name: "Remedies",
            description: "AI remedies from ancient wisdom",
            url: "/problem-solver",
            icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

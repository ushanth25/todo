import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,woff,woff2}"],
        navigateFallback: "/index.html",
      },
      manifest: {
        name: "100 Programs Tracker",
        short_name: "100 Programs",
        description: "Track the 100 programs every programmer should know. Works offline.",
        theme_color: "#2456e6",
        background_color: "#f2f5f8",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
});

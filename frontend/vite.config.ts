import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Sitemap from 'vite-plugin-sitemap'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), 
    Sitemap({
      hostname: 'https://share-frontend.pages.dev',
      outDir: './dist',
      changefreq: 'weekly',
      robots: [
        {
          userAgent: '*',
          allow: '/',
          crawlDelay: 10  
        }
      ]
    }),
        
    VitePWA({ 
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    workbox: {
      maximumFileSizeToCacheInBytes: 2000000,
    },
    manifest: {
      name: 'Vite PWA Project',
      short_name: 'Vite PWA Project',
      theme_color: '#ffffff',
      icons: [
          {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png'
          },
          {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
          },
          {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
          },
          {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
          },
      ],
    }, 
  })],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("@codemirror/lang-javascript")) {
            return "editor-js";
          }
          if (id.includes("@codemirror/lang-python")) {
            return "editor-py";
          }
          if (id.includes("@codemirror/lang-html")) {
            return "editor-html";
          }
          if (id.includes("@lezer/javascript")) {
            return "editor-js";
          }
          if (id.includes("@lezer/python")) {
            return "editor-py";
          }
          if (id.includes("@lezer/html")) {
            return "editor-html";
          }
          if (id.includes("@uiw/react-codemirror") || id.includes("@codemirror") || id.includes("@lezer")) {
            return "editor-core";
          }
          if (id.includes("react") || id.includes("recoil") || id.includes("react-router-dom")) {
            return "react-vendor";
          }
          if (id.includes("@radix-ui") || id.includes("lucide-react")) {
            return "ui-vendor";
          }
          if (id.includes("tsparticles") || id.includes("@tsparticles")) {
            return "particles";
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
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
      maximumFileSizeToCacheInBytes: 5000000, // Set max file size to cache in bytes (3MB)
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
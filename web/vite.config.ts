import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

function cardArtList(): Plugin {
  const virtual = 'virtual:card-art';
  const resolved = `\0${virtual}`;
  return {
    name: 'card-art-list',
    resolveId(id) {
      if (id === virtual) return resolved;
      return undefined;
    },
    load(id) {
      if (id !== resolved) return undefined;
      const dir = resolve('public/art/cards');
      let files: string[] = [];
      try {
        files = readdirSync(dir).filter((name) => name.endsWith('.webp'));
      } catch {
        files = [];
      }
      return `export const CARD_ART_FILES = ${JSON.stringify(files)};`;
    },
  };
}

export default defineConfig({
  base: '/suanshu/',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 800,
  },
  plugins: [
    cardArtList(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'favicon-32.png'],
      manifest: {
        name: '算数小恐龙',
        short_name: '算数小恐龙',
        description: '小恐龙闯关岛：一年级口算，一轮 30 题。',
        lang: 'zh-CN',
        dir: 'ltr',
        start_url: '/suanshu/',
        scope: '/suanshu/',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#8fd4ff',
        theme_color: '#8fd4ff',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cacheId: 'suanshu-v8',
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});

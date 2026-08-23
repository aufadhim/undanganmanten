import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'UndanganManten',
        short_name: 'UndanganManten',
        description: 'Buat undangan pernikahan digital premium dengan mudah.',
        theme_color: '#fdfcf0',
        background_color: '#fdfcf0',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        globIgnores: ['**/*.mp3', '**/*.mp4'],
        maximumFileSizeToCacheInBytes: 4000000
      }
    })
  ],
  server: { port: Number(env.VITE_DEV_PORT || 5173) },
  };
});

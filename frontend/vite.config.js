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
            src: 'https://cdn-icons-png.flaticon.com/512/865/865769.png', // Temporary generic icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4000000
      }
    })
  ],
  server: { port: Number(env.VITE_DEV_PORT || 5173) },
  };
});

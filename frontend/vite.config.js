import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Canonical registry/scene edits regenerate only changed outputs; application media saves are unrelated.
function syncTemplateSources(){return {name:'sync-template-sources',configureServer(server){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),shared=path.join(root,'shared'),script=path.join(root,'tools/sync-template-registry.cjs');
 if(!existsSync(shared)||!existsSync(script))return;
 let timer;server.watcher.add(shared);
 const changed=(event,file)=>{const relative=path.relative(shared,path.resolve(file)),projectFile=path.relative(root,path.resolve(file)).split(path.sep).join('/');
 const source=!relative.startsWith('..')&&!path.isAbsolute(relative)&&file.endsWith('.json');
 const derived=/^frontend\/(?:src\/components\/templates\/[^/]+\/defaultConfig\.json|public\/templates\/[^/]+\/(?:config\/invitation\.json|landscape\.json))$/.test(projectFile);
 if(!['add','change','unlink'].includes(event)||!source&&!derived)return;
  clearTimeout(timer);timer=setTimeout(()=>{try{execFileSync(process.execPath,[script],{cwd:root,stdio:'pipe'});}catch(error){server.config.logger.error('Template source sync failed: '+(error.stderr?.toString()||error.message));}},150);
 };
 server.watcher.on('all',changed);server.httpServer?.once('close',()=>{clearTimeout(timer);server.watcher.off('all',changed)});
}}}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [
    syncTemplateSources(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Samavaya',
        short_name: 'Samavaya',
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
        // Always fetch navigation HTML from the server so it selects the current build.
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        globIgnores: [
          'templates/**',
          '**/*.html',
          '**/*Template-*.js',
          '**/*.mp3',
          '**/*.mp4',
          '**/xlsx-*.js',
          '**/AnalitikPanel-*.js',
          '**/AdminDashboard-*.js',
          '**/TamuPanel-*.js',
          '**/DepthEngineLab-*.js'
        ],
        maximumFileSizeToCacheInBytes: 3000000
      }
    })
  ],
  server: { port: Number(env.VITE_DEV_PORT || 5173) },
  };
});

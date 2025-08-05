import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8888,
    proxy: {
      '/adminapi': {
        target: 'http://192.168.1.102/adminapi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/adminapi/, '')
      },
      '/ISAPI': {
        target: 'http://192.168.1.114:8090/ISAPI',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ISAPI/, '')
      },
      '/SDK': {
        target: 'http://192.168.1.114:8090/SDK',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/SDK/, '')
      },
      '/webSocketVideoCtrlProxy': {
        target: 'http://192.168.1.114:8090/webSocketVideoCtrlProxy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webSocketVideoCtrlProxy/, '')
      }
    }
  }
});

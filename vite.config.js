import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  base: '/video-recorder/',
  build: {
    outDir: '../hk-nginx/webs/video-recorder'
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8888,
    proxy: {
      '/poker-scan': {
        target: 'http://192.168.10.114:9981/poker-scan',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poker-scan/, '')
      },
      '/majiang-scan': {
        target: 'http://192.168.10.114:9981/majiang-scan',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/majiang-scan/, '')
      },
      '/chip-scan': {
        target: 'http://192.168.10.114:9981/chip-scan',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chip-scan/, '')
      },
      '/ISAPI': {
        target: 'http://192.168.10.114:8090/ISAPI',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ISAPI/, '')
      },
      '/SDK': {
        target: 'http://192.168.10.114:8090/SDK',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/SDK/, '')
      },
      '/webSocketVideoCtrlProxy': {
        target: 'http://192.168.10.114:8090/webSocketVideoCtrlProxy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webSocketVideoCtrlProxy/, '')
      }
    }
  }
});

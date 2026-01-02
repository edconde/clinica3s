import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/primeicons/fonts/*',
          dest: 'assets/fonts'
        }
      ]
    })
  ],
  build: {
    assetsInlineLimit: 0,
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  }
})

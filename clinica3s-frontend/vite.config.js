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
        },
        {
          src: 'node_modules/primereact/resources/themes/lara-light-indigo/fonts/*',
          dest: 'assets/fonts'
        }
      ]
    })
  ],
  build: {
    outDir: 'docs', // Para GitHub Pages
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

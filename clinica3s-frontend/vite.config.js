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
  // Nombre de tu repositorio en GitHub ya que este proyecto es subdirectorio de él
  base: '/clinica3s/',
  build: {
    outDir: '../docs', // Para GitHub Pages, directorio /docs en la raíz del repositorio
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

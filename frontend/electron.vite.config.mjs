import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/'),
        '@': resolve(__dirname, './src/renderer/'),
        '@components': resolve(__dirname, './src/renderer/components'),
        '@assets': resolve(__dirname, './src/renderer/assets'),
        '@constants': resolve(__dirname, './src/renderer/constants'),
        '@system': resolve(__dirname, './src/renderer/system'),
        '@pages': resolve(__dirname, './src/renderer/pages'),
        '@styles': resolve(__dirname, './src/renderer/styles'),
        '@utils': resolve(__dirname, './src/renderer/utils'),
      }
    },
    plugins: [react()]
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // needed for docker container port mapping
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // for dev, change to http://localhost:5000 if not using docker
        changeOrigin: true,
      },
    }
  }
})

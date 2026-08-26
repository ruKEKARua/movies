import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
    base: '/movies/',
    optimizeDeps: {
        include: ['react-fast-marquee'],
    },
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            '/steam-api': {
              target: 'https://api.steampowered.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/steam-api/, ''),
            },
        },
    },
  
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages publica em https://<usuario>.github.io/Candinho/
export default defineConfig({
  base: '/Candinho/',
  plugins: [react()],
})

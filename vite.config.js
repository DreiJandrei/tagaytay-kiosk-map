import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 🔥 MAGIC FIX: Fino-force natin ang app na tumakbo sa port 3000
    strictPort: true,
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/speater/',   // 👈 关键：挂到 /speater/ 子路径
})

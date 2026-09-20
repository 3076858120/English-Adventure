import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' 让站点同时适配 GitHub Pages 项目子路径 (/English-Adventure/) 和本地开发,
// 配合 hash 路由 (#map / #level-23) 不会出现 JS/CSS 404。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
})

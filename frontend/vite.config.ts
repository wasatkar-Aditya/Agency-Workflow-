import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  // GitHub Pages serves this project from its repository subpath.
  base: process.env.GITHUB_ACTIONS ? "/Agency-Workflow-/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

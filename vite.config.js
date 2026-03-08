import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { apiProxy } from './vite-proxy.js'

export default defineConfig(() => {
  // Load FatSecret + USDA credentials into process.env (server-side only, never sent to browser)
  dotenv.config({ path: 'functions/.env' })

  return {
    plugins: [react(), apiProxy()],
  }
})

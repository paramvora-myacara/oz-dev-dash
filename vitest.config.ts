import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    // Exclude Playwright E2E tests from Vitest
    exclude: ['**/tests/**', '**/node_modules/**'],
  },
})

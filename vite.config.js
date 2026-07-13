import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.jsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/pages/**',
        'src/main.jsx',
        'node_modules/**',
        'dist/**',
        '**/*.test.js',
        '**/*.test.jsx',
        'setupTests.jsx'
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 92,
        lines: 90
      }
    }
  }
})


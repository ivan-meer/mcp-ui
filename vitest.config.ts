import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use global APIs (describe, it, expect)
    environment: 'jsdom', // Default environment, can be overridden per package/file
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true, // Cover all files, not just tested ones
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/*/src/index.{ts,tsx}',
        'packages/**/*.d.ts',
        'packages/**/__tests__/**',
        'packages/**/dist/**',
        'apps/docs/**',
      ],
    },
  },
});

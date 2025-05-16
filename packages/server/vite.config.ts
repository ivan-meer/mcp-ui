import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      exclude: [
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.spec.ts"
      ]
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'McpUiServer',
      formats: ['es', 'cjs'], // cjs for Node compatibility
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['@mcp-ui/shared', /^node:.*/], // Externalize node built-ins
      output: {
        globals: {
          '@mcp-ui/shared': 'McpUiShared',
        },
      },
    },
    target: 'node18', // Target Node.js 18
    sourcemap: true,
  },
}); 
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'McpUiServer',
      formats: ['es', 'cjs'], // CommonJS might be useful for Node environments
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    sourcemap: true,
    target: 'node18', // Target a specific Node version
  },
}); 
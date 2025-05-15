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
      name: 'McpUiShared',
      formats: ['es', 'umd'], // UMD for broader compatibility if needed, es for modern
      fileName: (format) => `index.${format === 'es' ? 'mjs' : format === 'umd' ? 'js' : format + '.js'}`,
    },
    sourcemap: true,
    // Minify options if needed, default is esbuild which is fast
    // minify: 'terser',
    // terserOptions: { ... }
  },
}); 
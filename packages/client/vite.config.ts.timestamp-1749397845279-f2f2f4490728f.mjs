// vite.config.ts
import { defineConfig } from "file:///home/how2ai/mcp-ui/node_modules/.pnpm/vite@5.4.19_@types+node@22.15.18_lightningcss@1.30.1/node_modules/vite/dist/node/index.js";
import dts from "file:///home/how2ai/mcp-ui/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@22.15.18_rollup@4.40.2_typescript@5.8.3_vite@5.4.19_@_35e4d6c5693c8cb7fbc116a6f61470b9/node_modules/vite-plugin-dts/dist/index.mjs";
import path from "path";
import react from "file:///home/how2ai/mcp-ui/node_modules/.pnpm/@vitejs+plugin-react-swc@3.9.0_vite@5.4.19_@types+node@22.15.18_lightningcss@1.30.1_/node_modules/@vitejs/plugin-react-swc/index.mjs";
var __vite_injected_original_dirname = "/home/how2ai/mcp-ui/packages/client";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "McpUiClient",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format === "es" ? "mjs" : format === "umd" ? "js" : format + ".js"}`
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "@mcp-ui/shared",
        /@modelcontextprotocol\/sdk(\/.*)?/
      ],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "jsxRuntime",
          "@mcp-ui/shared": "McpUiShared",
          "@modelcontextprotocol/sdk": "ModelContextProtocolSDK"
        }
      }
    },
    sourcemap: false
  }
  // Vitest specific config can go here if not using a separate vitest.config.ts for the package
  // test: { ... }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ob3cyYWkvbWNwLXVpL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvaG93MmFpL21jcC11aS9wYWNrYWdlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvaG93MmFpL21jcC11aS9wYWNrYWdlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgZXhjbHVkZTogWycqKi9fX3Rlc3RzX18vKionLCAnKiovKi50ZXN0LnRzJywgJyoqLyouc3BlYy50cyddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICB9KSBhcyBhbnksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgbmFtZTogJ01jcFVpQ2xpZW50JyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT5cbiAgICAgICAgYGluZGV4LiR7Zm9ybWF0ID09PSAnZXMnID8gJ21qcycgOiBmb3JtYXQgPT09ICd1bWQnID8gJ2pzJyA6IGZvcm1hdCArICcuanMnfWAsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAncmVhY3QnLFxuICAgICAgICAncmVhY3QvanN4LXJ1bnRpbWUnLFxuICAgICAgICAnQG1jcC11aS9zaGFyZWQnLFxuICAgICAgICAvQG1vZGVsY29udGV4dHByb3RvY29sXFwvc2RrKFxcLy4qKT8vLFxuICAgICAgXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6ICdSZWFjdCcsXG4gICAgICAgICAgJ3JlYWN0L2pzeC1ydW50aW1lJzogJ2pzeFJ1bnRpbWUnLFxuICAgICAgICAgICdAbWNwLXVpL3NoYXJlZCc6ICdNY3BVaVNoYXJlZCcsXG4gICAgICAgICAgJ0Btb2RlbGNvbnRleHRwcm90b2NvbC9zZGsnOiAnTW9kZWxDb250ZXh0UHJvdG9jb2xTREsnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gIH0sXG4gIC8vIFZpdGVzdCBzcGVjaWZpYyBjb25maWcgY2FuIGdvIGhlcmUgaWYgbm90IHVzaW5nIGEgc2VwYXJhdGUgdml0ZXN0LmNvbmZpZy50cyBmb3IgdGhlIHBhY2thZ2VcbiAgLy8gdGVzdDogeyAuLi4gfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJSLFNBQVMsb0JBQW9CO0FBQ3hULE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBSGxCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLE1BQ2xCLFNBQVMsQ0FBQyxtQkFBbUIsZ0JBQWdCLGNBQWM7QUFBQTtBQUFBLElBRTdELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDN0MsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUNULFNBQVMsV0FBVyxPQUFPLFFBQVEsV0FBVyxRQUFRLE9BQU8sU0FBUyxLQUFLO0FBQUEsSUFDL0U7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AscUJBQXFCO0FBQUEsVUFDckIsa0JBQWtCO0FBQUEsVUFDbEIsNkJBQTZCO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7QUFBQTtBQUFBO0FBR0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

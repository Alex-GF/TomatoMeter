import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    {
      name: "markdown-loader",
      transform(code, id) {
        if (id.endsWith(".md")) {
          // For .md files, get the raw content
          return `export default ${JSON.stringify(code)};`;
        }
      }
    },
    {
      name: "yaml-loader",
      transform(code, id) {
        if (id.endsWith(".yml") || id.endsWith(".yaml")) {
          // For .yml or .yaml files, get the raw content
          return `export default ${JSON.stringify(code)};`;
        }
      }
    }
  ],
  publicDir: 'public',
});

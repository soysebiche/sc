import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules') && !/node_modules\/(react|react-dom|scheduler)\//.test(id) && !id.includes('web-vitals')) return 'charts';
          if (id.includes('historico_completo_sc.json')) return 'archive-data';
          // Only React lands in the eagerly-loaded vendor chunk; recharts' deps
          // (d3, redux, lodash, …) stay with the lazy YearChart chunk.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: true,
    include: ['src/**/*.test.js'],
  },
});

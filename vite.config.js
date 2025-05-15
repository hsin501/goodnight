import { defineConfig } from 'vite';

export default defineConfig({
  base: '/goodnight/',

  build: {
    minify: 'terser',
    target: 'es2015',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // ✅ 雙重保險
      },
    },
  },
});

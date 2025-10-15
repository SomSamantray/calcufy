import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // No PostCSS config needed - build script handles it
  build: {
    outDir: 'public/widgets',
    emptyOutDir: false, // Don't clear public/widgets each time
    rollupOptions: {
      input: {
        'calculator-carousel': path.resolve(__dirname, 'widgets/calculator-carousel.html'),
        'calculator-input': path.resolve(__dirname, 'widgets/calculator-input.html'),
        'result-card': path.resolve(__dirname, 'widgets/result-card.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src', // Set the root directory for the project
  build: {
    outDir: '../dist', // Output directory for the build
    rollupOptions: {
      input: 'src/index.html', // Entry point for the application
      output: {
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    open: true, // Automatically open the app in the browser
  },
});
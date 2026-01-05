import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gulf-order-system-bolt/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

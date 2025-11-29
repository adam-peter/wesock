import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // @ts-ignore Tailwind uses outdated types of vite 6 - remove this after update
    tailwindcss()
  ],
});

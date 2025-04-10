
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: true,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 8080,
      protocol: "ws"
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add conditional alias for useMediaCapture
      "@/composables/useMediaCapture": 
        process.env.CAPACITOR_PLATFORM
          ? path.resolve(__dirname, "src/composables/useMediaCapture.native.ts")
          : path.resolve(__dirname, "src/composables/useMediaCapture.ts")
    },
    // Configuración para resolver archivos .native.ts en dispositivos nativos
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.native.ts', '.native.tsx']
  },
  // Ensure proper history API fallback for SPA navigation
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}));

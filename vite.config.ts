
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
      // Use environment variable to determine platform
      // During build time, we'll default to web implementation
      // Native implementation will be used at runtime via file extension resolution
      "@/hooks/useMediaCapture": 
        process.env.CAPACITOR_PLATFORM
          ? path.resolve(__dirname, "src/hooks/useMediaCapture.native.ts")
          : path.resolve(__dirname, "src/hooks/useMediaCapture.ts")
    },
    // Extensions to resolve, with native extensions first
    extensions: ['.native.ts', '.native.tsx', '.ts', '.tsx', '.js', '.jsx', '.json']
  },
  // Ensure proper history API fallback for SPA navigation
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}));

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig(({ mode }) => {
  // loadEnv reads .env.[mode] and .env.[mode].local files.
  // Run `npm run dev:tunnel` (which sets mode="tunnel") to activate HMR fix.
  const env = loadEnv(mode, process.cwd(), "");
  const hmrClientPort = env.VITE_HMR_CLIENT_PORT
    ? Number(env.VITE_HMR_CLIENT_PORT)
    : undefined;

  return {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Allow any Host header — required when the dev server is reached through a
    // tunnel (cloudflared, ngrok, etc.) whose domain changes every session.
    // The `server` block is ignored by `vite build`, so no production impact.
    allowedHosts: true,
    // When behind an HTTPS tunnel (e.g. Cloudflare), the browser connects on
    // port 443 but the dev server listens on 3000. Without clientPort:443,
    // Vite's HMR client opens a WebSocket to port 3000 which the tunnel
    // doesn't expose — every reconnect attempt fails, and after N retries
    // Vite calls location.reload(), causing the "full page reload" in Telegram.
    // Set VITE_HMR_CLIENT_PORT=443 in .env.tunnel to fix this.
    hmr: hmrClientPort !== undefined ? { clientPort: hmrClientPort } : undefined,
    // Dev-only: proxy /api and /uploads to the backend so the frontend can run
    // through a single HTTPS tunnel (no cross-origin cookie issues).
    // vite build ignores the entire `server` block — no production impact.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react"],
        },
      },
    },
  },
  };
});

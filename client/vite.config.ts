import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const backendProxy = {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
  },
  "/socket.io": {
    target: "http://localhost:5000",
    changeOrigin: true,
    ws: true,
  },
};

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: backendProxy,
  },
  preview: {
    proxy: backendProxy,
  },
});

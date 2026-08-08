import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // reachable from other devices on your LAN, not just localhost
    port: 5173,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Capacitor serves the bundled web assets from https://localhost/ with the
// webDir mapped to the site root, so absolute ("/") asset URLs resolve fine.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    // Excalidraw + React produce some large chunks; silence the warning.
    chunkSizeWarningLimit: 4000,
  },
  define: {
    // Excalidraw expects this to be defined.
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
});

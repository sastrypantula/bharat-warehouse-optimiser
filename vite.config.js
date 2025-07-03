// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";


// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(process.cwd(), "./client/src"),
//       "@shared": path.resolve(process.cwd(), "./shared"),
//     },
//   },
//   root: path.resolve(process.cwd(), "client"),
//   build: {
//     outDir: path.resolve(process.cwd(), "dist/public"),
//     emptyOutDir: true,
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: {
    alias: [
      // React app src folder
      { find: "@",        replacement: path.resolve(__dirname, "client/src") },
      // Shared types & helpers outside /client
      { find: "@shared",  replacement: path.resolve(__dirname, "shared") },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message, source = "express") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${timestamp} [${source}] ${message}`);
}

export async function setupVite(app, server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    base: "/",
    root: path.resolve(__dirname, "../client"),
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  const clientDir = path.resolve(__dirname, "../client");
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(clientDir, "index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return vite;
}

export function serveStatic(app) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
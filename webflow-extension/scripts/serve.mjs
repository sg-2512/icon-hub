import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const ROOT_DIR = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 1337;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  if (reqPath === "/") reqPath = "/index.html";

  // Special route for webflow.json
  if (reqPath === "/webflow.json" || reqPath === "/webflow") {
    const jsonPath = path.join(ROOT_DIR, "webflow.json");
    if (fs.existsSync(jsonPath)) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      fs.createReadStream(jsonPath).pipe(res);
      return;
    }
  }

  let filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: try root dir if not found in public
      const rootFilePath = path.join(ROOT_DIR, reqPath);
      if (fs.existsSync(rootFilePath) && fs.statSync(rootFilePath).isFile()) {
        const ext = path.extname(rootFilePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        fs.createReadStream(rootFilePath).pipe(res);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[IconSearch Extension] Serving static files at http://localhost:${PORT}`);
});

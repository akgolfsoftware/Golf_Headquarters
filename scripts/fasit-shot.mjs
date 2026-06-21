// scripts/fasit-shot.mjs — skjermbilde av en design-handover .dc.html-fasit.
//
// Server public/design-handover/ slik at relative assets (support.js, ds/tokens.css,
// images/) resolver, rendrer .dc.html-en (support.js bygger custom <x-dc>-elementene),
// og lagrer ett full-høyde PNG på valgt bredde. Brukes som FASIT-bilde i porting-gaten.
//
// Bruk: node scripts/fasit-shot.mjs "<fil>.dc.html" [bredde] [ut.png]
//   bredde: 430 (PlayerHQ mobil) | 1280 (AgencyOS desktop). Default 430.
import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const FILE = process.argv[2];
const WIDTH = Number(process.argv[3] || 430);
const OUT = process.argv[4] || `/tmp/fasit-${WIDTH}.png`;
const ROOT =
  "/Users/anderskristiansen/Developer/akgolf-hq/public/design-handover";
const PORT = 8788;

if (!FILE) {
  console.error("Bruk: node scripts/fasit-shot.mjs <fil.dc.html> [bredde] [ut.png]");
  process.exit(1);
}

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".woff": "font/woff", ".woff2": "font/woff2",
};

const server = http.createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(req.url.split("?")[0]);
    const fp = path.join(ROOT, p);
    if (!existsSync(fp) || !fp.startsWith(ROOT)) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const buf = await readFile(fp);
    res.writeHead(200, {
      "content-type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream",
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto(`http://localhost:${PORT}/${encodeURIComponent(FILE)}`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1400); // la support.js bygge custom-elementene + fonter laste
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
server.close();
console.log("Skrev " + OUT);

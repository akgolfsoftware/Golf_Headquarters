import { build } from "esbuild";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { appFonts } from "./fonts.mjs";

/** Kun syntetisk komponentprøve. Ruting og serverhandlinger er eksplisitt simulert. */
export async function startSummaryHarness() {
  const root = process.cwd();
  const out = resolve(root, "tests/visual/ut/playerhq-summary");
  mkdirSync(out, { recursive: true });
  await import("./build-tailwind.mjs");
  const fontCss = appFonts(root);
  writeFileSync(resolve(out, "fonts.css"), fontCss);
  await build({
    entryPoints: [resolve(root, "tests/visual/playerhq-summary/render.tsx")], outfile: resolve(out, "summary.js"),
    bundle: true, format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"development"' },
    plugins: [{ name: "simulerte-grenser", setup(builder) {
      builder.onResolve({ filter: /^@\/app\/portal\/\(fullscreen\)\/live\/\[sessionId\]\/actions$/ }, ({ path }) => ({ path, namespace: "summary-actions" }));
      builder.onLoad({ filter: /.*/, namespace: "summary-actions" }, () => ({ loader: "js", contents: 'export const lagreDineOrd=(id,value)=>window.summaryHarness.save("ord",id,value);export const lagreSpillerVurdering=(id,value)=>window.summaryHarness.save("vurdering",id,value);' }));
      builder.onResolve({ filter: /^next\/link$/ }, ({ path }) => ({ path, namespace: "summary-link" }));
      builder.onLoad({ filter: /.*/, namespace: "summary-link" }, () => ({ resolveDir: root, loader: "js", contents: 'import {createElement} from "react";export default function Link({prefetch,scroll,replace,...props}){return createElement("a",props)}' }));
    } }],
  });
  const tokens = ["src/styles/train-lock-tokens.css", "src/styles/train-lock-valgt.css"].map((p) => readFileSync(resolve(root, p), "utf8")).join("\n");
  const html = `<!doctype html><html lang="nb" data-train-lock="4"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PH-06 – syntetisk komponentprøve</title><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/tailwind.css"><style>${tokens}\nbody{margin:0;font-family:var(--tl-font-sans)}.summary-rigg{position:fixed;right:8px;bottom:8px;z-index:100;padding:4px 8px;border:1px solid currentColor;background:var(--tl-scene);color:var(--tl-text);font:10px var(--tl-font-sans);pointer-events:none}</style><link rel="stylesheet" href="/summary.css"></head><body><div class="summary-rigg">SIMULERT</div><div id="root"></div><script src="/summary.js"></script></body></html>`;
  const files = new Map(["fonts.css", "tailwind.css", "summary.js", "summary.css"].map((f) => [`/${f}`, resolve(out, f)]));
  const server = createServer((req, res) => {
    const path = new URL(req.url, "http://127.0.0.1").pathname;
    const file = files.get(path);
    if (file) { res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/css"); res.end(readFileSync(file)); return; }
    if (path === "/reference" || path === "/reference-light") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      // PH-06 har statisk markup; fjern eksportens kjøreverktøy, behold selve tegningen.
      const source = path === "/reference" ? "PH-06 Live ferdig.dc.html" : "B3 Lys resterende skjermer.dc.html";
      res.end(readFileSync(resolve(root, "designsystem/train-lock", source), "utf8").replace('<script src="./support.js"></script>', "")); return;
    }
    if (path === "/portal" || path === "/portal/planlegge" || path === "/portal/analysere") {
      res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end('<html lang="nb"><p>SIMULERT mål for lenken</p></html>'); return;
    }
    if (path !== "/") { res.writeHead(404); res.end(); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(html);
  });
  await new Promise((resolveReady) => server.listen(0, "127.0.0.1", resolveReady));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((done) => { server.closeAllConnections(); server.close(done); }) };
}

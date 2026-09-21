/** Kun loopback og syntetiske data. Ingen miljøfiler, database eller API. */
import { build } from "esbuild";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export async function startPh01Harness() {
  const root = process.cwd();
  const out = "/private/tmp/ak-hq-ph01-visual-20260921/rigg";
  mkdirSync(out, { recursive: true, mode: 0o700 });
  await build({
    entryPoints: [resolve(root, "tests/visual/playerhq-ph01/fixture.tsx")],
    outfile: resolve(out, "ph01.js"),
    bundle: true,
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    plugins: [{ name: "syntetiske-grenser", setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/workbench\/wb-actions$/ }, ({ path }) => ({ path, namespace: "wb-actions" }));
      builder.onLoad({ filter: /.*/, namespace: "wb-actions" }, () => ({ loader: "js", contents: 'export async function resolvePlayerApproval(){return {ok:true}}' }));
      builder.onResolve({ filter: /^next\/(link|navigation|image)$/ }, ({ path }) => ({ path, namespace: "next" }));
      builder.onLoad({ filter: /.*/, namespace: "next" }, ({ path }) => ({
        resolveDir: root,
        loader: "js",
        contents: path === "next/navigation"
          ? 'export const useRouter=()=>({push:(url)=>location.assign(url),replace:(url)=>location.assign(url),refresh:()=>{}})'
          : path === "next/link"
            ? 'import{createElement}from"react";export default function Link({prefetch,scroll,replace,...props}){return createElement("a",props)}'
            : 'import{createElement}from"react";export default function Image({priority,fill,loader,quality,unoptimized,placeholder,blurDataURL,...props}){return createElement("img",props)}',
      }));
    }}],
  });

  const nextCandidates = [resolve(root, ".next/static/chunks"), resolve(root, ".next/dev/static/chunks"), resolve(root, "../../../.next/static/chunks"), resolve(root, "../../../.next/dev/static/chunks")];
  const chunks = nextCandidates.find((candidate) => existsSync(candidate));
  if (!chunks) throw new Error("Mangler lokale fontfiler fra et Next-bygg.");
  const faces = readdirSync(chunks).filter((file) => file.endsWith(".css")).flatMap((file) =>
    [...readFileSync(resolve(chunks, file), "utf8").matchAll(/@font-face\s*\{[^}]*font-family:\s*(?:Geist|Archivo|Oswald|IBM)[^}]+\}/g)].map(([face]) =>
      face.replace(/url\(([^)]+)\)/g, (_, url) => `url(data:font/woff2;base64,${readFileSync(resolve(chunks, url.replace(/["']/g, ""))).toString("base64")})`)
    )
  );
  if (!faces.length) throw new Error("Fant ikke appens lokale skrifter.");
  const tokens = readFileSync(resolve(root, "src/styles/ak-hq-tokens.css"), "utf8");
  writeFileSync(resolve(out, "app.css"), `${tokens}\n${[...new Set(faces)].join("\n")}\n:root{--font-archivo:Archivo;--font-oswald:Oswald;--font-ibm-plex-mono:"IBM Plex Mono"}html,body,#root{margin:0;min-height:100%;}`);

  const html = '<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PH-01 syntetisk kontroll</title><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/ph01.css"></head><body><div id="root"></div><script src="/ph01.js"></script></body></html>';
  const files = new Map([["/app.css", "app.css"], ["/ph01.css", "ph01.css"], ["/ph01.js", "ph01.js"]]);
  const server = createServer((req, res) => {
    const pathname = new URL(req.url, "http://127.0.0.1").pathname;
    const file = files.get(pathname);
    if (file) { res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/css"); res.end(readFileSync(resolve(out, file))); return; }
    if (pathname === "/logos/logo-ak-golf-hq.svg") { res.setHeader("Content-Type", "image/svg+xml"); res.end(readFileSync(resolve(root, "public/logos/logo-ak-golf-hq.svg"))); return; }
    if (pathname !== "/") { res.writeHead(404); res.end(); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(html);
  });
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((done) => { server.closeAllConnections(); server.close(done); }) };
}

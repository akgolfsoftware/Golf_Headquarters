/** Kun loopback, syntetisk komponentprøve. Ingen miljøfiler, database eller API. */
import { build } from "esbuild";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = process.cwd();
const port = Number(process.env.WB_PORT ?? 5460);
const out = process.env.WB_PORT ? `/private/tmp/ak-hq-workbench-rigg-${port}` : "/private/tmp/ak-hq-workbench-natt-20260920/rigg";
mkdirSync(out, { recursive: true, mode: 0o700 });
const actionNames = [...readFileSync("src/lib/workbench/wb-actions.ts", "utf8").matchAll(/export async function (\w+)/g)].map(m => m[1]);
await build({
  entryPoints: ["tests/visual/workbench/fixture.tsx"], outdir: out, bundle: true, format: "iife", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [{ name: "lokal-isolasjon", setup(b) {
    b.onLoad({filter:/\.[cm]?[jt]sx?$/}, ({path}) => {
      if (!path.startsWith(resolve(root,"src")+"/")) return;
      const source=readFileSync(path,"utf8");
      if (!/^\s*["']use server["'];/m.test(source)) return;
      const names=[...source.matchAll(/export (?:async )?function (\w+)|export const (\w+)/g)].map(m=>m[1]??m[2]);
      return {contents:names.map(n=>`export const ${n}=async()=>{throw new Error("Ingen server i komponentprøven")};`).join("\n"),loader:"js"};
    });
    b.onResolve({ filter: /^@\/lib\/workbench\/wb-actions$/ }, ({path}) => ({path, namespace:"handling"}));
    b.onLoad({filter:/.*/, namespace:"handling"}, () => ({contents: actionNames.map(n => `export const ${n}=async()=>{if(new URLSearchParams(location.search).get("fixture")==="slow")await new Promise(r=>setTimeout(r,2000));return {ok:false,error:"Komponentprøve: lagring er ikke tilkoblet."};};`).join("\n"), loader:"js"}));
    b.onResolve({filter:/^next\/(link|navigation|image)$/}, ({path}) => ({path, namespace:"next"}));
    b.onLoad({filter:/.*/, namespace:"next"}, ({path}) => ({ resolveDir:root, loader:"js", contents:
      path === "next/navigation" ? 'export const usePathname=()=>"/admin/workbench/syntetisk-spiller"; export const useSearchParams=()=>new URLSearchParams(location.search); export const useRouter=()=>({push:(url)=>location.assign(url),replace:(url)=>location.assign(url),refresh:()=>location.reload()});' :
      path === "next/link" ? 'import {createElement} from "react"; export default function Link({prefetch,scroll,replace,...p}){return createElement("a",p)}' :
      'import {createElement} from "react"; export default function Image({priority,fill,loader,quality,unoptimized,placeholder,blurDataURL,...p}){return createElement("img",p)}'
    }));
  }}],
});
const twEntry = resolve(root, "tests/visual/workbench/entry.css");
const css = await postcss([tailwind()]).process('@import "tailwindcss";\n@source "../../../src/components";', {from:twEntry});
const chunks = resolve(root,".next/static/chunks");
const fonts = (existsSync(chunks) ? readdirSync(chunks) : []).filter(f=>f.endsWith(".css")).flatMap(f=>[...readFileSync(resolve(chunks,f),"utf8").matchAll(/@font-face\{[^}]*font-family:(?:Geist|Archivo|Oswald|IBM)[^}]+\}/g)].map(([face])=>face.replace(/url\(([^)]+)\)/g,(_,url)=>`url(data:font/woff2;base64,${readFileSync(resolve(chunks,url.replace(/["']/g,""))).toString("base64")})`)));
if (!fonts.length) { if (!process.env.WB_UTEN_FONTER) throw new Error("Appens fontfiler mangler"); console.warn("Advarsel: kjører uten appens fonter (systemfonter brukes)"); }
const tokens = ["train-lock-tokens.css","train-lock-valgt.css","ak-hq-tokens.css"].map(f=>readFileSync(resolve(root,"src/styles",f),"utf8")).join("\n");
writeFileSync(resolve(out,"app.css"), css.css + tokens + [...new Set(fonts)].join("\n") + '\n:root{--font-geist-sans:Geist;--font-geist-mono:"Geist Mono";--font-archivo:Archivo;--font-oswald:Oswald;--font-ibm-plex-mono:"IBM Plex Mono"}body{margin:0}');
const html = '<!doctype html><html lang="nb" data-train-lock="4"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workbench – lokal komponentprøve</title><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/fixture.css"><div id="root"></div><script src="/fixture.js"></script></html>';
createServer((req,res)=>{
  const path=new URL(req.url,`http://127.0.0.1:${port}`).pathname;
  res.setHeader("Cache-Control","no-store");
  if (["/app.css","/fixture.css","/fixture.js"].includes(path)) { res.setHeader("Content-Type",path.endsWith(".js")?"text/javascript":"text/css"); res.end(readFileSync(resolve(out,path.slice(1)))); return; }
  if (path.startsWith("/api/")) { res.writeHead(503,{"Content-Type":"application/json"});res.end('{"error":"Ingen API i komponentprøven"}'); return; }
  if (path.endsWith(".svg")) { try {const file=resolve(root,"public",`.${path}`); if(!file.startsWith(resolve(root,"public")+"/"))throw new Error();res.setHeader("Content-Type","image/svg+xml");res.end(readFileSync(file));}catch{res.writeHead(404);res.end();}return; }
  res.setHeader("Content-Type","text/html;charset=utf-8");res.end(html);
}).listen(port,"127.0.0.1",()=>console.log(`Workbench-komponentprøve: http://127.0.0.1:${port}`));

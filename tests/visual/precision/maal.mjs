/**
 * Skjermprøve for Precision Athletics (PlayerHQ og AgencyOS).
 *
 * Bygger en skjerms prøvefil (tests/visual/precision/skjermer/<ID>.tsx) med
 * esbuild, serverer den lokalt og måler hver tilstand i hver bredde:
 * sidelengs rulling, noder utenfor rammen, treffmål (44 px til og med 1024 px
 * bredde, som designets --control-h; 32 px med mus på desktop) og
 * konsollfeil. Bare syntetiske data: ingen miljøfiler, database eller API.
 *
 *   node tests/visual/precision/maal.mjs AG-01
 *   node tests/visual/precision/maal.mjs AG-01 --bredder 390,1440
 *
 * Prøvefila eksporterer `tilstander: Record<string, ReactNode>` og kan
 * eksportere `natt: string[]` (tilstander som vises i nattema).
 * Resultat: <scratch>/precision-prove/<ID>/resultat.json + skjermbilder.
 * Avslutter med kode 1 hvis en måling feiler.
 */
import { build } from "esbuild";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const id = process.argv[2];
if (!id) { console.error("Bruk: node tests/visual/precision/maal.mjs <SKJERM-ID>"); process.exit(2); }
const bArg = process.argv.indexOf("--bredder");
const BREDDER = bArg > 0 ? process.argv[bArg + 1].split(",").map(Number) : [390, 768, 1024, 1280, 1440];
const entry = resolve(root, `tests/visual/precision/skjermer/${id}.tsx`);
if (!existsSync(entry)) { console.error(`Mangler prøvefil: ${entry}`); process.exit(2); }
const out = resolve(process.env.PRECISION_PROVE_UT ?? resolve(tmpdir(), "precision-prove"), id);
mkdirSync(out, { recursive: true, mode: 0o700 });

// Serverkode erstattes med tomme stubber: prøven skal aldri nå database eller nett.
const SERVER_ONLY = /^(server-only|@\/lib\/prisma|@\/lib\/auth\/.*|next\/headers|next\/cache)$/;
const stubbePlugin = {
  name: "prove-grenser",
  setup(b) {
    b.onResolve({ filter: SERVER_ONLY }, ({ path }) => ({ path, namespace: "stub-tom" }));
    b.onLoad({ filter: /.*/, namespace: "stub-tom" }, () => ({ loader: "js", contents: "export const prisma=new Proxy({},{get(){throw new Error('Ingen database i prøven')}});export default {};export const cookies=()=>({get(){}});export const headers=()=>new Map();export const revalidatePath=()=>{};export const revalidateTag=()=>{};" }));
    b.onResolve({ filter: /^next\/(link|navigation|image|dynamic)$/ }, ({ path }) => ({ path, namespace: "next-stub" }));
    b.onLoad({ filter: /.*/, namespace: "next-stub" }, ({ path }) => ({
      resolveDir: root, loader: "js",
      contents: path === "next/navigation"
        ? 'export const useRouter=()=>({push(){},replace(){},refresh(){},back(){},prefetch(){}});export const usePathname=()=>window.__PROVE_PATH__||"/";export const useSearchParams=()=>new URLSearchParams(location.search);export const useParams=()=>({});export const unstable_rethrow=()=>{};export function redirect(){throw new Error("redirect i prøven")};export function notFound(){throw new Error("notFound i prøven")}'
        : path === "next/link"
          ? 'import{createElement}from"react";export default function Link({prefetch,scroll,replace,shallow,...p}){return createElement("a",p)}'
          : path === "next/dynamic"
            ? 'import{lazy,createElement,Suspense}from"react";export default function dynamic(f){const C=lazy(()=>f().then(m=>({default:m.default??m})));return (p)=>createElement(Suspense,{fallback:null},createElement(C,p))}'
            : 'import{createElement}from"react";export default function Image({priority,fill,loader,quality,unoptimized,placeholder,blurDataURL,...p}){return createElement("img",p)}',
    }));
    // «use server»-moduler: behold eksportnavnene, bytt innholdet med ufarlige stubber.
    b.onLoad({ filter: /\.(ts|tsx)$/ }, ({ path }) => {
      const src = readFileSync(path, "utf8");
      if (!/^\s*["']use server["']/.test(src)) return undefined;
      const navn = [...src.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(\w+)/g)].map((m) => m[1]);
      return { loader: "js", contents: navn.map((n) => `export async function ${n}(){return {ok:true}}`).join("\n") };
    });
  },
};

const tsx = `import { createRoot } from "react-dom/client";
import * as P from ${JSON.stringify(entry)};
const t = new URLSearchParams(location.search).get("t");
window.__PROVE_PATH__ = P.sti ?? "/";
const natt = (P.natt ?? []).includes(t);
document.documentElement.dataset.theme = natt ? "night" : "light";
createRoot(document.getElementById("root")).render(P.tilstander[t]);
window.__TILSTANDER__ = Object.keys(P.tilstander);`;

await build({
  stdin: { contents: tsx, loader: "tsx", resolveDir: root, sourcefile: "inngang.tsx" }, outfile: resolve(out, "prove.js"), bundle: true, format: "iife",
  jsx: "automatic", loader: { ".css": "empty", ".svg": "dataurl", ".png": "dataurl" },
  tsconfig: resolve(root, "tsconfig.json"), define: { "process.env.NODE_ENV": '"development"' },
  plugins: [stubbePlugin], logLevel: "error",
});

// Samme rekkefølge som skallene: komponentstilene først, så Precision-laget.
// Basestilene alltid, pluss enhver bolk-egen stil (precision-a1.css, precision-a4.css, …)
// bolkene legger i src/styles/ ved siden av sin egen visning.
import { readdirSync } from "node:fs";
<<<<<<< HEAD
const bolkCss = readdirSync(resolve(root, "src/styles")).filter((f) => /^precision-(a\d+|tp|booking)\.css$/.test(f)).sort();
=======
const bolkCss = readdirSync(resolve(root, "src/styles")).filter((f) => /^precision-(a\d+|tp|iup|bk)\.css$/.test(f)).sort();
>>>>>>> origin/main
const css = ["precision-komponenter.css", "precision-athletics.css", ...bolkCss].map((f) => readFileSync(resolve(root, "src/styles", f), "utf8")).join("\n");
const html = (t) => `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=block" rel="stylesheet">
<style>:root{--font-ibm-plex-sans:"IBM Plex Sans";--font-ibm-plex-mono:"IBM Plex Mono"}\n${css}\nhtml,body{margin:0}</style><title>${id} · ${t}</title></head><body><div id="root"></div><script src="/prove.js"></script></body></html>`;
const TYPER = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
const server = createServer((req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (u.pathname === "/prove.js") { res.setHeader("Content-Type", "text/javascript"); res.end(readFileSync(resolve(out, "prove.js"))); return; }
  if (u.pathname === "/") { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(html(u.searchParams.get("t"))); return; }
  const fil = resolve(root, "public", "." + u.pathname);
  if (fil.startsWith(resolve(root, "public")) && existsSync(fil)) { res.setHeader("Content-Type", TYPER[extname(fil)] ?? "application/octet-stream"); res.end(readFileSync(fil)); return; }
  res.writeHead(404); res.end();
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const resultat = [];
try {
  const forste = await browser.newPage();
  await forste.goto(`${origin}/?t=__ingen__`);
  const tilstander = await forste.evaluate(() => window.__TILSTANDER__ ?? []);
  await forste.close();
  if (!tilstander.length) throw new Error("Prøvefila eksporterer ingen tilstander");
  for (const t of tilstander) {
    for (const w of BREDDER) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      const feil = [];
      page.on("console", (m) => { if (m.type() === "error") feil.push(m.text()); });
      page.on("pageerror", (e) => feil.push(String(e)));
      await page.goto(`${origin}/?t=${encodeURIComponent(t)}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const m = await page.evaluate((min) => {
        const d = document.documentElement, vw = d.clientWidth;
        const utenfor = [], smaa = [];
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.position === "fixed" && r.right <= 0) continue;
          if (r.right > vw + 0.5 || r.left < -0.5) {
            // Innhold inni en beholder som selv klipper, teller ikke.
            let p = el.parentElement, klippet = false;
            while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "clip") { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 0.5 && pr.left >= -0.5) { klippet = true; break; } } p = p.parentElement; }
            if (!klippet && el.closest(".pa-sr") == null) utenfor.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} (${Math.round(r.left)}–${Math.round(r.right)})`);
          }
          if (el.matches("a[href],button,[role=button],input,select,textarea,[role=tab]") && el.closest(".pa-sr") == null && (r.height < min || r.width < min)) {
            // Tekstlenker inne i løpende tekst er unntatt; alt annet skal ha 44 px.
            if (!(el.tagName === "A" && cs.display === "inline")) smaa.push(`${el.tagName.toLowerCase()} «${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}» ${Math.round(r.width)}×${Math.round(r.height)}`);
          }
        }
        return { scrollWidth: d.scrollWidth, clientWidth: vw, utenfor: utenfor.slice(0, 10), smaa: smaa.slice(0, 10), tekst: document.body.innerText.length };
      }, w <= 1024 ? 44 : 32);
      await page.screenshot({ path: resolve(out, `${t}-${w}.png`), fullPage: true });
      const ok = m.scrollWidth === m.clientWidth && m.utenfor.length === 0 && m.smaa.length === 0 && feil.length === 0 && m.tekst > 0;
      resultat.push({ tilstand: t, bredde: w, ok, ...m, konsollfeil: feil.slice(0, 5) });
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.closeAllConnections(); server.close();
}
writeFileSync(resolve(out, "resultat.json"), JSON.stringify(resultat, null, 2));
const feilet = resultat.filter((r) => !r.ok);
console.log(`${id}: ${resultat.length - feilet.length}/${resultat.length} tilfeller uten avvik. Skjermbilder: ${out}`);
for (const f of feilet) console.log(`  AVVIK ${f.tilstand} ${f.bredde}px: scroll ${f.scrollWidth}/${f.clientWidth}${f.utenfor.length ? " · utenfor: " + f.utenfor.join("; ") : ""}${f.smaa.length ? " · for små treffmål: " + f.smaa.join("; ") : ""}${f.konsollfeil.length ? " · konsoll: " + f.konsollfeil.join(" | ") : ""}${f.tekst === 0 ? " · tom side" : ""}`);
process.exit(feilet.length ? 1 : 0);

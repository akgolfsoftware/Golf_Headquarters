/** Lokal komponentrigg. Next-ruting simuleres; appkomponentene importeres uendret. */
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "_archive/portering-kontroll-2026-09-10");
mkdirSync(output, { recursive: true });
await build({
  entryPoints: { plan: resolve(root, "tests/visual/portering/plan-fixture.tsx"), idag: resolve(root, "tests/visual/portering/idag-fixture.tsx"), playernav: resolve(root, "tests/visual/portering/player-nav-fixture.tsx"), wang: resolve(root, "tests/visual/portering/wang-login-fixture.tsx"), fixture: resolve(root, "tests/visual/portering/tn-tilgang-fixture.tsx"), trainlock: resolve(root, "tests/visual/portering/train-lock-fixture.tsx") },
  outdir: output,
  bundle: true,
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [{
    name: "isoler-next-ruting",
    setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/workbench\/wb-actions$/ }, ({ path }) => ({ path, namespace: "idag-server-stub" }));
      builder.onLoad({ filter: /.*/, namespace: "idag-server-stub" }, () => ({ contents: 'export const resolvePlayerApproval=async(input)=>{if(window.planSvar)return window.planSvar("svar",input);throw new Error("Ingen serverhandling i komponentprøven")};export const moveSession=async(input)=>{if(window.planSvar)return window.planSvar("flytt",input);throw new Error("Ingen serverhandling i komponentprøven")};', loader: "js" }));
      builder.onResolve({ filter: /^next\/(link|navigation|image)$/ }, ({ path }) => ({ path, namespace: "tn-fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "tn-fixture" }, ({ path }) => ({
        contents: path === "next/image"
          ? 'import {createElement} from "react"; export default function Image({priority,fill,loader,quality,unoptimized,placeholder,blurDataURL,...props}) { return createElement("img",props); }'
          : path === "next/link"
          ? 'import {createElement} from "react"; export default function Link({prefetch,scroll,replace,...props}) { return createElement("a",props); }'
          : 'export const useRouter=()=>({refresh:()=>{window.tnOppfriskinger++},push:(url)=>{window.location.assign(url)}}); import {useSyncExternalStore} from "react"; const listen=(cb)=>{window.addEventListener("popstate",cb);return ()=>window.removeEventListener("popstate",cb)}; export const usePathname=()=>useSyncExternalStore(listen,()=>window.location.pathname); export const useSearchParams=()=>new URLSearchParams(window.location.search);',
        resolveDir: root,
        loader: "js",
      }));
    },
  }],
});

const html = `<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/fixture.css"><style>
*{box-sizing:border-box}body{margin:0} :root{--font-schibsted-grotesk:Arial,sans-serif;--font-ibm-plex-mono:monospace}
.hidden{display:none}.flex{display:flex}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(min-width:1024px){.lg\\:flex{display:flex}.lg\\:hidden{display:none}}
</style><title>TN-18 – syntetisk komponentprøve</title><div id="root"></div><script src="/fixture.js"></script></html>`;
const trainHtml = html.replace('/tokens.css', '/train-tokens.css').replace('/fixture.css', '/trainlock.css').replace('/fixture.js', '/trainlock.js');
const navHtml = trainHtml.replace("/trainlock.css", "/playernav.css").replace("/trainlock.js", "/playernav.js");
const idagHtml = trainHtml.replace("/trainlock.css", "/idag.css").replace("/trainlock.js", "/idag.js").replace("</title>", '</title><link rel="stylesheet" href="/geist.css">');
const planHtml = idagHtml.replaceAll("/idag.", "/plan.");
const wangHtml = html.replace('/tokens.css', '/wang-tokens.css').replace('/fixture.css', '/wang.css').replace('/fixture.js', '/wang.js');
const nextChunks = resolve(root, ".worktrees/portering-kontroll-2026-09-10/.next/static/chunks");
const geistCss = (existsSync(nextChunks) ? readdirSync(nextChunks) : []).filter((file) => file.endsWith(".css")).flatMap((file) =>
  [...readFileSync(resolve(nextChunks, file), "utf8").matchAll(/@font-face\{[^}]*font-family:Geist[^}]+\}/g)].map(([face]) =>
    face.replace(/url\(([^)]+)\)/g, (_, url) => `url(data:font/woff2;base64,${readFileSync(resolve(nextChunks, url.replace(/["']/g, ""))).toString("base64")})`)
  )
).join("\n") + '\n:root{--font-geist-sans:Geist;--font-geist-mono:"Geist Mono"}';
const files = new Map([
  ["/plan.js", [resolve(output, "plan.js"), "text/javascript"]],
  ["/plan.css", [resolve(output, "plan.css"), "text/css"]],
  ["/ph-07-reference.html", [resolve(root, "_archive/design-kilder-2026-09-10/playerhq-train-lock-4/PH-07 Plan v3.dc.html"), "text/html; charset=utf-8"]],
  ["/ph-01-reference.html", [resolve(root, "_archive/design-kilder-2026-09-10/playerhq-train-lock-4/PH-01 I dag v3.dc.html"), "text/html; charset=utf-8"]],
  ["/support.js", [resolve(root, "_archive/design-kilder-2026-09-10/playerhq-train-lock-4/support.js"), "text/javascript"]],
  ["/react18.js", [resolve(output, "vendor/react.production.min.js"), "text/javascript"]],
  ["/react-dom18.js", [resolve(output, "vendor/react-dom.production.min.js"), "text/javascript"]],
  ["/idag.js", [resolve(output, "idag.js"), "text/javascript"]],
  ["/idag.css", [resolve(output, "idag.css"), "text/css"]],
  ["/playernav.js", [resolve(output, "playernav.js"), "text/javascript"]],
  ["/playernav.css", [resolve(output, "playernav.css"), "text/css"]],
  ["/wang.js", [resolve(output, "wang.js"), "text/javascript"]],
  ["/wang.css", [resolve(output, "wang.css"), "text/css"]],
  ["/wang-tokens.css", [resolve(root, "src/styles/wang-tokens.css"), "text/css"]],
  ["/team-wang/wang-crest.svg", [resolve(root, "public/team-wang/wang-crest.svg"), "image/svg+xml"]],
  ["/trainlock.js", [resolve(output, "trainlock.js"), "text/javascript"]],
  ["/trainlock.css", [resolve(output, "trainlock.css"), "text/css"]],
  ["/fixture.js", [resolve(output, "fixture.js"), "text/javascript"]],
  ["/fixture.css", [resolve(output, "fixture.css"), "text/css"]],
  ["/tokens.css", [resolve(root, "src/styles/team-norway-tokens.css"), "text/css"]],
]);
createServer((request, response) => {
  const path = new URL(request.url, "http://127.0.0.1:5441").pathname;
  if (path === "/geist.css") { response.setHeader("Content-Type", "text/css"); response.end(geistCss); return; }
  if (path === "/train-tokens.css") {
    response.setHeader("Content-Type", "text/css");
    response.end(["src/styles/train-lock-tokens.css", "src/styles/train-lock-valgt.css"].map((file) => readFileSync(resolve(root, file), "utf8")).join("\n"));
    return;
  }
  if (path === "/ph-01-reference.html" || path === "/ph-07-reference.html") {
    const source = readFileSync(files.get(path)[0], "utf8").replace('<script src="./support.js"></script>', '<script src="/react18.js"></script><script src="/react-dom18.js"></script><script src="./support.js"></script>');
    response.setHeader("Content-Type", "text/html; charset=utf-8"); response.end(source); return;
  }
  const file = files.get(path);
  response.setHeader("Content-Type", file?.[1] ?? "text/html; charset=utf-8");
  response.end(file ? readFileSync(file[0]) : path.startsWith("/team-norway") ? html : path.startsWith("/team-wang") ? wangHtml : path.startsWith("/player-nav") ? navHtml : path.startsWith("/idag-prove") ? idagHtml : path.startsWith("/plan-prove") ? planHtml : trainHtml);
}).listen(5441, "127.0.0.1", () => console.log("TN-komponentrigg klar på 127.0.0.1:5441"));

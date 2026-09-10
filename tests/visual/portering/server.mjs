/** Lokal komponentrigg. Next-ruting simuleres; appkomponentene importeres uendret. */
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "_archive/portering-kontroll-2026-09-10");
mkdirSync(output, { recursive: true });
await build({
  entryPoints: { playernav: resolve(root, "tests/visual/portering/player-nav-fixture.tsx"), wang: resolve(root, "tests/visual/portering/wang-login-fixture.tsx"), fixture: resolve(root, "tests/visual/portering/tn-tilgang-fixture.tsx"), trainlock: resolve(root, "tests/visual/portering/train-lock-fixture.tsx") },
  outdir: output,
  bundle: true,
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [{
    name: "isoler-next-ruting",
    setup(builder) {
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
const wangHtml = html.replace('/tokens.css', '/wang-tokens.css').replace('/fixture.css', '/wang.css').replace('/fixture.js', '/wang.js');
const files = new Map([
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
  if (path === "/train-tokens.css") {
    response.setHeader("Content-Type", "text/css");
    response.end(["src/styles/train-lock-tokens.css", "src/styles/train-lock-valgt.css"].map((file) => readFileSync(resolve(root, file), "utf8")).join("\n"));
    return;
  }
  const file = files.get(path);
  response.setHeader("Content-Type", file?.[1] ?? "text/html; charset=utf-8");
  response.end(file ? readFileSync(file[0]) : path.startsWith("/team-norway") ? html : path.startsWith("/team-wang") ? wangHtml : path.startsWith("/player-nav") ? navHtml : trainHtml);
}).listen(5441, "127.0.0.1", () => console.log("TN-komponentrigg klar på 127.0.0.1:5441"));

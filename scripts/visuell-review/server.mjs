#!/usr/bin/env node
/**
 * Godkjennings-side: fasit + app ved siden av, kommentar, Fiks.
 * POST /fiks skriver /tmp/ak-visuell-review/fiks.json (jeg leser den).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const DIR = "/tmp/ak-visuell-review";
const PORT = 3847;

const PAR = [
  {
    id: "idag-telefon",
    tittel: "I dag · telefon",
    fasit: "PH-01 I dag",
    app: "/portal",
    bredde: "390",
  },
  {
    id: "idag-ipad",
    tittel: "I dag · iPad",
    fasit: "PH-01 iPad regular",
    app: "/portal",
    bredde: "1180",
  },
  {
    id: "idag-mac",
    tittel: "I dag · Mac",
    fasit: "PH-01 Mac",
    app: "/portal",
    bredde: "1440",
  },
  {
    id: "plan-telefon",
    tittel: "Plan · telefon",
    fasit: "PH-07 Plan",
    app: "/portal/planlegge",
    bredde: "390",
  },
  {
    id: "plan-mac",
    tittel: "Plan · Mac",
    fasit: "P-01 Player Min uke",
    app: "/portal/planlegge",
    bredde: "1440",
  },
  {
    id: "wb-telefon",
    tittel: "Workbench · telefon",
    fasit: "WB-01c Uke iPhone",
    app: "/admin/workbench",
    bredde: "390",
  },
  {
    id: "wb-ipad",
    tittel: "Workbench · iPad",
    fasit: "WB-01b Uke iPad",
    app: "/admin/workbench",
    bredde: "1180",
  },
  {
    id: "wb-mac",
    tittel: "Workbench · Mac",
    fasit: "WB-01a Uke Mac",
    app: "/admin/workbench",
    bredde: "1440",
  },
];

function html() {
  const kort = PAR.map((p) => {
    const fasitPng = fs.existsSync(path.join(DIR, "fasit", `${p.id}.png`));
    const appPng = fs.existsSync(path.join(DIR, "app", `${p.id}.png`));
    const fasitImg = fasitPng
      ? `<img src="/fasit/${p.id}.png" alt="Fasit ${p.fasit}">`
      : `<div class="tom">Mangler fasit-bilde</div>`;
    const appImg = appPng
      ? `<img src="/app/${p.id}.png" alt="App ${p.app}">`
      : `<div class="tom">App-bilde mangler (krevde innlogging). Fasiten til venstre er det appen skal bli.</div>`;
    return `<article class="par" data-id="${p.id}">
      <header>
        <h2>${p.tittel}</h2>
        <p class="meta">${p.fasit} · ${p.bredde} px · rute ${p.app}</p>
      </header>
      <div class="rad">
        <figure><figcaption>Fasit (slik det skal se ut)</figcaption>${fasitImg}</figure>
        <figure><figcaption>App nå</figcaption>${appImg}</figure>
        <aside class="kommentar">
          <label>Hva skal fikses?
            <textarea name="${p.id}" rows="8" placeholder="Skriv her, ved siden av bildene. F.eks. «bunnmenyen er feil», «tittel for liten», «mangler Start økt»."></textarea>
          </label>
          <label class="lik"><input type="checkbox" name="lik-${p.id}"> Denne er lik fasiten — hopp over</label>
        </aside>
      </div>
    </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Godkjenn skjermer · batch 1</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #000; color: #F5F5F5; font-family: ui-sans-serif, system-ui, sans-serif; }
  header.top { position: sticky; top: 0; z-index: 4; background: #000; border-bottom: 1px solid #FFFFFF14; padding: 16px 20px; }
  h1 { margin: 0; font-size: 22px; }
  .lead { margin: 6px 0 0; color: #8E8E93; font-size: 14px; line-height: 1.5; max-width: 52ch; }
  main { padding: 20px; display: flex; flex-direction: column; gap: 28px; max-width: 1600px; margin: 0 auto; }
  .par { background: #161616; border-radius: 20px; padding: 18px; }
  h2 { margin: 0; font-size: 18px; }
  .meta { margin: 4px 0 12px; color: #8E8E93; font-size: 12px; }
  .rad { display: grid; grid-template-columns: 1fr 1fr minmax(240px, 280px); gap: 12px; align-items: start; }
  @media (max-width: 1100px) { .rad { grid-template-columns: 1fr 1fr; } .kommentar { grid-column: 1 / -1; } }
  @media (max-width: 800px) { .rad { grid-template-columns: 1fr; } }
  figure { margin: 0; min-width: 0; }
  figcaption { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #8E8E93; margin-bottom: 8px; }
  img { width: 100%; height: auto; border-radius: 12px; background: #0D0D0D; display: block; cursor: zoom-in; }
  img.stor { position: fixed; inset: 24px; width: auto; height: auto; max-width: calc(100vw - 48px); max-height: calc(100vh - 48px); margin: auto; z-index: 20; cursor: zoom-out; box-shadow: 0 0 0 100vmax #000c; border-radius: 8px; }
  .tom { padding: 24px; color: #8E8E93; font-size: 14px; line-height: 1.5; border: 1px dashed #FFFFFF14; border-radius: 12px; }
  .kommentar { position: sticky; top: 88px; }
  textarea { width: 100%; margin-top: 8px; background: #1C1C1E; color: #F5F5F5; border: 1px solid #FFFFFF14; border-radius: 12px; padding: 12px; font: inherit; min-height: 160px; resize: vertical; }
  .lik { display: flex; gap: 8px; align-items: center; margin-top: 10px; font-size: 14px; color: #8E8E93; }
  .dokk { position: sticky; bottom: 0; background: #1C1C1E; padding: 14px 20px calc(14px + env(safe-area-inset-bottom)); border-top: 1px solid #FFFFFF14; display: flex; gap: 10px; flex-wrap: wrap; }
  button { appearance: none; border: 0; height: 44px; padding: 0 20px; border-radius: 999px; font: 600 15px/1 inherit; cursor: pointer; }
  .prim { background: #fff; color: #000; }
  .dim { background: transparent; color: #8E8E93; box-shadow: inset 0 0 0 1px #FFFFFF14; }
  #status { margin: 0; color: #8E8E93; font-size: 13px; align-self: center; }
</style>
</head>
<body>
<header class="top">
  <h1>Batch 1 · I dag · Plan · Workbench</h1>
  <p class="lead">Venstre er tegningen. Høyre er appen (hvis vi fikk tatt bilde). Skriv hva som er feil ved siden av. Trykk Fiks nederst — da tar jeg jobben.</p>
</header>
<form id="skjema">
<main>${kort}</main>
<div class="dokk">
  <button class="prim" type="submit">Fiks</button>
  <button class="dim" type="button" id="tom">Tøm kommentarer</button>
  <p id="status"></p>
</div>
</form>
<script>
const skjema = document.getElementById("skjema");
const status = document.getElementById("status");
skjema.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(skjema);
  const par = {};
  for (const [k, v] of fd.entries()) par[k] = String(v);
  status.textContent = "Sender …";
  try {
    const res = await fetch("/fiks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ batch: 1, par, tid: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(await res.text());
    status.textContent = "Mottatt. Jeg fikser nå — du kan la denne fanen stå.";
  } catch (err) {
    status.textContent = "Fikk ikke sendt. Si «fiks» i chatten og lim inn kommentarene.";
  }
});
document.getElementById("tom").addEventListener("click", () => {
  skjema.reset();
  status.textContent = "";
});
document.addEventListener("click", (e) => {
  const img = e.target.closest("img");
  if (!img) {
    document.querySelectorAll("img.stor").forEach((el) => el.classList.remove("stor"));
    return;
  }
  img.classList.toggle("stor");
});
</script>
</body>
</html>`;
}

const MIME = { ".png": "image/png", ".html": "text/html; charset=utf-8", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  if (req.method === "POST" && url.pathname === "/fiks") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      fs.mkdirSync(DIR, { recursive: true });
      fs.writeFileSync(path.join(DIR, "fiks.json"), raw);
      fs.writeFileSync(path.join(DIR, "fiks-klar"), "FIKS\n");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      console.log("FIKS_MOTTATT");
    });
    return;
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html());
    return;
  }
  const rel = url.pathname.replace(/^\/+/, "");
  const file = path.join(DIR, rel);
  if (!file.startsWith(DIR)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("ikke funnet");
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${PORT}`);
});

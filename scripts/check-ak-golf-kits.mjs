#!/usr/bin/env node
// AK Golf-vaktene: åpner speilet av masteren (designsystem/ak-golf/) i en
// headless Chromium og måler det som ikke kan leses ut av CSS alene:
//   - ingen konsollfeil, ingen sidefeil
//   - ingen horisontal overflow på 390, 768 og 1440
//   - IBM Plex er lastet (ikke fallback)
//   - ingen lorem ipsum, ingen «angrepsvinkel», ingen utropstegn, ingen emoji
//   - fokusringen finnes: første Tab gir synlig outline
//   - lys OG mørk (data-ak-flate) rendrer uten feil
// Kjør:  node scripts/check-ak-golf-kits.mjs           (alle kits + kort)
//        node scripts/check-ak-golf-kits.mjs --rask    (bare ui_kits)
// Hopper over med advarsel (exit 0) hvis Playwright-nettleseren ikke er
// installert, så `npm run verify` ikke feiler på en maskin uten Chromium.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const rot = resolve("designsystem/ak-golf");
const manifestSti = resolve(rot, "_ds_manifest.json");
if (!existsSync(manifestSti)) { console.error("check-ak-golf-kits: designsystem/ak-golf/_ds_manifest.json mangler — kjør speil-ak-golf først."); process.exit(1); }
const manifest = JSON.parse(readFileSync(manifestSti, "utf8"));
const rask = process.argv.includes("--rask");
const sider = manifest.cards.map((k) => k.path).filter((p) => (rask ? p.startsWith("ui_kits/") : true)).filter((p) => existsSync(resolve(rot, p)));

let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.warn("check-ak-golf-kits: playwright ikke installert — hopper over."); process.exit(0); }
let nettleser;
try { nettleser = await chromium.launch(); } catch (e) { console.warn("check-ak-golf-kits: fant ikke Chromium (npx playwright install chromium) — hopper over."); process.exit(0); }

const FORBUDT = [/lorem ipsum/i, /angrepsvinkel/i, /[!]/, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u];
const BREDDER = rask ? [390, 1440] : [390, 768, 1440];
const brudd = [];
let sjekket = 0;

const jobber = [];
for (const sti of sider) for (const modus of ["lys", "mork"]) for (const bredde of BREDDER) jobber.push({ sti, modus, bredde });

async function sjekk({ sti, modus, bredde }) {
  const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 } });
  const side = await ctx.newPage();
  const feil = [];
  side.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  side.on("pageerror", (e) => feil.push("pageerror: " + e.message));
  const hvor = `${sti} · ${modus} · ${bredde}`;
  try {
    await side.goto(pathToFileURL(resolve(rot, sti)).href, { waitUntil: "load", timeout: 30000 });
    await side.evaluate((m) => document.documentElement.setAttribute("data-ak-flate", m), modus);
    // Kortene kompilerer JSX i nettleseren (Babel) — gi dem et sekund til å tegne.
    await side.waitForTimeout(1200);
    const r = await side.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const t = document.body.innerText || "";
      const fokus = (() => { const e = document.querySelector("button, a[href], input, [tabindex='0']"); if (!e) return "ingen"; e.focus(); const o = getComputedStyle(e); return o.outlineStyle !== "none" && parseFloat(o.outlineWidth) > 0 ? "ok" : "mangler"; })();
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        font: document.fonts && [...document.fonts].some((f) => /IBM Plex/.test(f.family) && f.status === "loaded"),
        tekst: t, fokus,
      };
    });
    sjekket++;
    // Tekstregler og fokus sjekkes bare i lys/1440 så samme tekst ikke telles seks ganger.
    if (modus === "lys" && bredde === 1440) {
      for (const re of FORBUDT) { const m = r.tekst.match(re); if (m) brudd.push(`${hvor}: forbudt tekst «${m[0]}»`); }
      if (r.fokus === "mangler") brudd.push(`${hvor}: fokusring mangler på første fokuserbare element`);
      if (r.font === false) brudd.push(`${hvor}: IBM Plex ikke lastet`);
    }
    if (r.overflow) brudd.push(`${hvor}: horisontal overflow`);
    for (const f of feil) if (!/favicon|ERR_INTERNET|net::ERR|Failed to load resource/.test(f)) brudd.push(`${hvor}: ${f.slice(0, 160)}`);
  } catch (e) { brudd.push(`${hvor}: ${e.message.slice(0, 160)}`); }
  await ctx.close();
}
// Seks sider om gangen — sekvensielt tar 70+ visninger flere minutter.
const koe = [...jobber];
await Promise.all(Array.from({ length: 6 }, async () => { for (let j = koe.shift(); j; j = koe.shift()) await sjekk(j); }));
await nettleser.close();
console.log(`check-ak-golf-kits: ${sider.length} sider × lys/mørk × ${BREDDER.length} bredder = ${sjekket} visninger, ${brudd.length} brudd`);
for (const b of brudd.sort()) console.error("  BRUDD " + b);
process.exit(brudd.length ? 1 : 0);

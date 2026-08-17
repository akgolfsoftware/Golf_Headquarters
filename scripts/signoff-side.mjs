// Bygger ÉN signeringsside av bildene fra signoff-gallery.mjs.
//
// Hvorfor: skjermbilde-gaten (CLAUDE.md §Skjermarbeid) krever at Anders SER hver
// skjerm — mobil 390 først, så desktop, lys og mørk, med fasiten ved siden av.
// Bildene lå spredt som 400+ PNG-er i screenshots/paper/signoff/, som er ubrukelig
// fra en iPhone. Denne lager én selvstendig HTML-fil han kan bla gjennom, krysse
// av i, og få ut en ferdig liste over hva som er signert.
//
// Kjør: node scripts/signoff-side.mjs [ID_CSV] [UT_FIL]
//   ID_CSV = valgfritt filter, f.eks. "PP-1.1,PP-2.2" (default: alle)
//   UT_FIL = default screenshots/paper/signoff-side.html
//
// Krever `sips` (macOS-innebygd) for komprimering — PNG-ene er 36 MB rå, og en
// artifact-side må under 16 MB. JPEG kvalitet 45 gir ~6 MB uten at avvik i layout
// blir usynlige. Trenger du pikselnøyaktig vurdering: åpne rå-PNG-en direkte.
import { readdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);
const INN = "screenshots/paper/signoff";
const UT = process.argv[3] || "screenshots/paper/signoff-side.html";
const FILTER = process.argv[2] ? new Set(process.argv[2].split(",").map((s) => s.trim())) : null;
const KVALITET = 45;
const MAKS_BREDDE = 1100;

// Navnene fra signoff-gallery.mjs SCREENS — kun til visning, ikke fasit.
const NAVN = {
  "PP-1.1": "PlayerHQ chat / hjem", "PP-1.2": "PlayerHQ plan", "PP-1.3": "PlayerHQ analyse",
  "PP-1.4": "PlayerHQ meg", "PP-1.5": "PlayerHQ booking", "PP-1.6": "Innlogging",
  "PP-1.7": "Booking (offentlig)", "PP-2.1": "AgencyOS konsoll", "PP-2.2": "AgencyOS innboks",
  "PP-2.3": "AgencyOS spillere", "PP-2.4": "AgencyOS kalender", "NT-415": "Coach-hub",
  "NT-416a": "Planbibliotek", "NT-416b": "AgencyOS turneringer", "NT-417": "Runde-logg",
  "NT-418a": "Katalog: coacher", "NT-418b": "Katalog: blogg", "NT-418c": "System: 404",
  "NT-419a": "WANG coach-årsplan", "NT-419b": "GFGK kalender", "NT-433": "AgenticOS-hub",
  "NT-435": "Agent-detalj", "W4-437a": "Godkjenninger", "W4-437b": "Handlingssenter",
  "W4-437c": "Oppfølgingskø", "W4-438a": "Bookinger", "W4-438b": "Ny booking",
  "W4-440a": "Grupper", "W4-441a": "Innstillinger/Oppsett", "W4-441b": "GDPR-kø",
  "W4-441c": "Audit-logg", "W4-442a": "Økter", "W4-442b": "Ny planmal",
  "W4-442c": "Ny turnering", "W4-442d": "Turnering-dubletter", "B2-liveb": "Live brief",
  "B2-livea": "Live økt (aktiv)", "B2-lives": "Live summary", "B2-wb": "Spiller-workbench",
  "B2-fangst": "FangstSheet", "B2-forelder": "Foreldreportal", "B3-turnering": "Workbench turnering",
  "B4-live": "AgencyOS Mission Control", "B4-okonomi": "AgencyOS økonomi", "B4-akstigen": "AK-stigen",
  "B4-spillerprofil": "Spillerprofil", "B4b-akstigen": "AK-stigen (bygget)",
  "B4b-okonomi": "Økonomi (bygget)", "B4b-liveokt": "Live-økt coach (ny)",
};

const tmp = await mkdtemp(path.join(os.tmpdir(), "signoff-"));

/** Komprimerer én PNG til base64 JPEG. Returnerer null hvis fila mangler. */
async function komprimer(fil) {
  const kilde = path.join(INN, fil);
  const mål = path.join(tmp, `${fil}.jpg`);
  try {
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", String(KVALITET),
      "-Z", String(MAKS_BREDDE), kilde, "--out", mål]);
    return (await readFile(mål)).toString("base64");
  } catch {
    return null;
  }
}

const filer = await readdir(INN);
const ider = [...new Set(
  filer.filter((f) => f.endsWith("-m390.png") && !f.startsWith("_") && !f.startsWith("vindu-"))
    .map((f) => f.replace("-m390.png", "")),
)].filter((id) => !FILTER || FILTER.has(id)).sort();

if (ider.length === 0) {
  console.error(`Fant ingen bilder i ${INN}. Kjør scripts/signoff-gallery.mjs først.`);
  process.exit(1);
}

const seksjoner = [];
for (const id of ider) {
  const [mobil, desktop, mørk] = await Promise.all([
    komprimer(`${id}-m390.png`),
    komprimer(`${id}-d1280.png`),
    komprimer(`${id}-m390-dark.png`),
  ]);
  if (!mobil && !desktop && !mørk) continue;

  const bilder = [
    mobil && { merke: "Mobil 390 · lys", data: mobil },
    mørk && { merke: "Mobil 390 · mørk", data: mørk },
    desktop && { merke: "Desktop 1280 · lys", data: desktop },
  ].filter(Boolean);

  seksjoner.push(`<section class="skjerm" id="s-${id}">
  <header class="skjermtopp">
    <div><span class="id">${id}</span><h2>${NAVN[id] ?? id}</h2></div>
    <label class="kvitt"><input type="checkbox" data-id="${id}"><span>Godkjent</span></label>
  </header>
  ${bilder.map((b) => `<figure><figcaption>${b.merke}</figcaption>
    <img loading="lazy" alt="${NAVN[id] ?? id} — ${b.merke}" src="data:image/jpeg;base64,${b.data}"></figure>`).join("\n  ")}
</section>`);
  console.log(`OK    ${id} — ${bilder.length} bilder`);
}

const html = `<title>Sign-off · Paper-porten</title>
<style>
  :root {
    --ground:#FAF9F5; --flate:#FFF; --ink:#1D1B18; --ink2:#55514A; --mut:#79746B;
    --linje:#E6E2D8; --clay:#C15F3C; --ok:#4A7C59; --ok-myk:#E4EEE7;
    --sans:"Poppins","Avenir Next","Segoe UI",system-ui,sans-serif;
    --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
    --ground:#131210; --flate:#1C1A17; --ink:#EDE9E1; --ink2:#BCB6AA; --mut:#948E82;
    --linje:#2E2B25; --clay:#E08B66; --ok:#8FBB9C; --ok-myk:#22301F;
  } }
  :root[data-theme="dark"] {
    --ground:#131210; --flate:#1C1A17; --ink:#EDE9E1; --ink2:#BCB6AA; --mut:#948E82;
    --linje:#2E2B25; --clay:#E08B66; --ok:#8FBB9C; --ok-myk:#22301F;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);line-height:1.55}
  .wrap{max-width:1180px;margin:0 auto;padding:24px 16px 64px}
  h1{font-size:clamp(24px,4vw,32px);margin:0 0 6px;font-weight:650}
  .lede{color:var(--ink2);margin:0 0 18px;max-width:60ch}
  .teller{position:sticky;top:0;z-index:10;background:var(--ground);border-bottom:1px solid var(--linje);
    padding:12px 0;margin-bottom:20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .teller strong{font-family:var(--mono);font-size:19px;color:var(--clay)}
  button{font:inherit;font-size:14px;padding:7px 14px;border-radius:6px;border:1px solid var(--linje);
    background:var(--flate);color:var(--ink);cursor:pointer}
  button:hover{border-color:var(--clay)}
  .skjerm{background:var(--flate);border:1px solid var(--linje);border-radius:10px;padding:16px;margin-bottom:22px}
  .skjerm.godkjent{border-color:var(--ok);background:var(--ok-myk)}
  .skjermtopp{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px;flex-wrap:wrap}
  .id{font-family:var(--mono);font-size:11.5px;color:var(--mut);letter-spacing:.05em}
  h2{font-size:17px;margin:2px 0 0;font-weight:620}
  .kvitt{display:flex;align-items:center;gap:8px;font-size:14.5px;cursor:pointer;
    padding:8px 13px;border:1px solid var(--linje);border-radius:6px;background:var(--ground);white-space:nowrap}
  .kvitt input{width:19px;height:19px;accent-color:var(--ok);cursor:pointer}
  figure{margin:0 0 14px}
  figcaption{font-family:var(--mono);font-size:11px;color:var(--mut);text-transform:uppercase;
    letter-spacing:.06em;margin-bottom:5px}
  img{width:100%;height:auto;display:block;border:1px solid var(--linje);border-radius:6px;background:#1a1a18}
  #utdata{width:100%;min-height:110px;font-family:var(--mono);font-size:12.5px;padding:11px;
    border:1px solid var(--linje);border-radius:6px;background:var(--flate);color:var(--ink);margin-top:10px}
  footer{margin-top:34px;padding-top:14px;border-top:1px solid var(--linje);
    font-family:var(--mono);font-size:11.5px;color:var(--mut)}
</style>
<div class="wrap">
  <h1>Sign-off · Paper-porten</h1>
  <p class="lede">Appen til venstre i hvert bilde, Paper-fasiten til høyre. Kryss av det som
  holder. Avkrysningen lagres i nettleseren din, så du kan ta pauser.</p>

  <div class="teller">
    <span><strong id="antall">0</strong> av ${seksjoner.length} godkjent</span>
    <button id="kopier">Kopier liste over godkjente</button>
    <button id="nullstill">Nullstill</button>
  </div>

  <textarea id="utdata" readonly placeholder="Kryss av over — listen dukker opp her, klar til å lime inn i chatten."></textarea>

${seksjoner.join("\n\n")}

  <footer>Generert av scripts/signoff-side.mjs fra screenshots/paper/signoff/ ·
  JPEG kvalitet ${KVALITET}, maks ${MAKS_BREDDE} px · rå PNG-er ligger lokalt for pikselnøyaktig kontroll</footer>
</div>
<script>
  const NØKKEL = "ak-signoff-paper";
  const lagret = new Set(JSON.parse(localStorage.getItem(NØKKEL) || "[]"));
  const bokser = [...document.querySelectorAll('input[type=checkbox][data-id]')];

  function tegn() {
    for (const b of bokser) {
      b.checked = lagret.has(b.dataset.id);
      b.closest('.skjerm').classList.toggle('godkjent', b.checked);
    }
    document.getElementById('antall').textContent = lagret.size;
    const liste = [...lagret].sort();
    document.getElementById('utdata').value = liste.length
      ? 'Godkjent ' + new Date().toLocaleDateString('nb-NO') + ' (' + liste.length + ' skjermer):\\n' + liste.join('\\n')
      : '';
  }

  for (const b of bokser) {
    b.addEventListener('change', () => {
      b.checked ? lagret.add(b.dataset.id) : lagret.delete(b.dataset.id);
      localStorage.setItem(NØKKEL, JSON.stringify([...lagret]));
      tegn();
    });
  }

  document.getElementById('kopier').addEventListener('click', async (e) => {
    const t = document.getElementById('utdata');
    if (!t.value) return;
    try { await navigator.clipboard.writeText(t.value); e.target.textContent = 'Kopiert'; }
    catch { t.select(); e.target.textContent = 'Merket — kopier selv'; }
    setTimeout(() => { e.target.textContent = 'Kopier liste over godkjente'; }, 2000);
  });

  document.getElementById('nullstill').addEventListener('click', () => {
    lagret.clear(); localStorage.setItem(NØKKEL, '[]'); tegn();
  });

  tegn();
</script>
`;

await writeFile(UT, html);
await rm(tmp, { recursive: true, force: true });
const mb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(1);
console.log(`\nSkrev ${UT} — ${seksjoner.length} skjermer, ${mb} MB`);

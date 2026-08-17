// Bygger mobilvennlige signeringssider av bildene fra signoff-gallery.mjs.
//
// Hvorfor: skjermbilde-gaten (CLAUDE.md §Skjermarbeid) krever at Anders SER hver
// skjerm — mobil 390 først, lys og mørk, med fasiten ved siden av. Bildene lå
// spredt som 400+ PNG-er i screenshots/paper/signoff/, som er ubrukelig fra iPhone.
//
// Kjør fra repo-roten: node scripts/signoff-side.mjs
//
// TRE VALG SOM STYRER RESULTATET (lært 17.08.2026 — første forsøk ble ulesbart):
//
// 1. INGEN NEDSKALERING. Første versjon skalerte til 1100 px bredde. d1280-bildene
//    er 2620 px, så teksten ble mos. Bildene beholder nå full oppløsning.
// 2. KVALITET 85, ikke 45. Skjermbilder av UI er småtekst på flate farger — nettopp
//    det JPEG ødelegger først. Kvalitet 85 gir filer på størrelse med PNG-en, og
//    poenget med siden er at man skal kunne LESE den.
// 3. DELT I FLERE SIDER i stedet for komprimert hardere. Én side må under 16 MB.
//    Deler på bruker: coach-flatene (AgencyOS) og spiller-/offentlig-flatene
//    (PlayerHQ) blir hver sin side — samme skille som signeringen uansett følger.
//
// Desktop tas KUN med der skjermen har en egen `-desktop.html`-fasit. For 43 av 49
// skjermer er fasitM === fasitD, og den fasiten er ofte tegnet for 430 px (se
// playerhq-analyse.html sin toppetikett). Å vise app-desktop mot en mobilfasit er
// en sammenligning som ikke kan besvares, så den utelates.
import { readdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);
const INN = "screenshots/paper/signoff";
const GALLERI = "scripts/signoff-gallery.mjs";
const KVALITET = 85;

/** Leser SCREENS-arrayet ut av galleri-skriptet — én kilde til navn/fasit/bruker. */
async function lesSkjermer() {
  const kode = await readFile(GALLERI, "utf8");
  const rader = [...kode.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*navn:\s*"([^"]+)",\s*rute:\s*"([^"]+)",\s*bruker:\s*([^,]+),(?:[^}]*?)fasitM:\s*"([^"]+)",\s*fasitD:\s*"([^"]+)"/g,
  )];
  return rader.map((m) => ({
    id: m[1], navn: m[2], rute: m[3],
    bruker: m[4].trim(),
    egenDesktop: m[5] !== m[6],
  }));
}

const tmp = await mkdtemp(path.join(os.tmpdir(), "signoff-"));

/** Full oppløsning, kvalitet 85. Returnerer {b64, bytes} eller null. */
async function komprimer(fil) {
  const mål = path.join(tmp, `${fil}.jpg`);
  try {
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", String(KVALITET),
      path.join(INN, fil), "--out", mål]);
    const buf = await readFile(mål);
    return { b64: buf.toString("base64"), bytes: buf.length };
  } catch {
    return null;
  }
}

function sideHtml({ tittel, undertittel, seksjoner, nøkkel }) {
  return `<title>${tittel}</title>
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
  .wrap{max-width:1240px;margin:0 auto;padding:22px 14px 64px}
  h1{font-size:clamp(23px,4vw,30px);margin:0 0 6px;font-weight:650}
  .lede{color:var(--ink2);margin:0 0 8px;max-width:62ch}
  .tips{font-size:14px;color:var(--ink2);background:var(--flate);border:1px solid var(--linje);
    border-left:3px solid var(--clay);border-radius:0 8px 8px 0;padding:12px 15px;margin:0 0 18px;max-width:70ch}
  .teller{position:sticky;top:0;z-index:10;background:var(--ground);border-bottom:1px solid var(--linje);
    padding:11px 0;margin-bottom:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .teller strong{font-family:var(--mono);font-size:19px;color:var(--clay)}
  button{font:inherit;font-size:14px;padding:7px 14px;border-radius:6px;border:1px solid var(--linje);
    background:var(--flate);color:var(--ink);cursor:pointer}
  button:hover{border-color:var(--clay)}
  .skjerm{background:var(--flate);border:1px solid var(--linje);border-radius:10px;padding:15px;margin-bottom:20px}
  .skjerm.godkjent{border-color:var(--ok);background:var(--ok-myk)}
  .skjermtopp{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:11px;flex-wrap:wrap}
  .id{font-family:var(--mono);font-size:11.5px;color:var(--mut);letter-spacing:.05em}
  h2{font-size:17px;margin:2px 0 0;font-weight:620}
  .rute{font-family:var(--mono);font-size:11.5px;color:var(--mut)}
  .kvitt{display:flex;align-items:center;gap:8px;font-size:14.5px;cursor:pointer;
    padding:8px 13px;border:1px solid var(--linje);border-radius:6px;background:var(--ground);white-space:nowrap}
  .kvitt input{width:19px;height:19px;accent-color:var(--ok);cursor:pointer}
  figure{margin:0 0 13px}
  figcaption{font-family:var(--mono);font-size:11px;color:var(--mut);text-transform:uppercase;
    letter-spacing:.06em;margin-bottom:5px}
  .ramme{overflow-x:auto;border:1px solid var(--linje);border-radius:6px;background:#1a1a18}
  img{display:block;max-width:100%;height:auto}
  img.bred{max-width:none}
  #utdata{width:100%;min-height:105px;font-family:var(--mono);font-size:12.5px;padding:11px;
    border:1px solid var(--linje);border-radius:6px;background:var(--flate);color:var(--ink);margin-top:10px}
  footer{margin-top:32px;padding-top:14px;border-top:1px solid var(--linje);
    font-family:var(--mono);font-size:11.5px;color:var(--mut)}
</style>
<div class="wrap">
  <h1>${tittel}</h1>
  <p class="lede">${undertittel}</p>
  <p class="tips">Appen er til venstre i hvert bilde, Paper-fasiten til høyre. Bildene er i full
  oppløsning — knip for å zoome på mobil. Desktop-bildet er bredere enn skjermen og kan dras
  sidelengs.</p>

  <div class="teller">
    <span><strong id="antall">0</strong> av ${seksjoner.length} godkjent</span>
    <button id="kopier">Kopier liste over godkjente</button>
    <button id="nullstill">Nullstill</button>
  </div>

  <textarea id="utdata" readonly placeholder="Kryss av over — listen dukker opp her, klar til å lime inn i chatten."></textarea>

${seksjoner.map((s) => s.html).join("\n\n")}

  <footer>Generert av scripts/signoff-side.mjs · full oppløsning, JPEG kvalitet ${KVALITET} ·
  rå PNG-er ligger i ${INN}/</footer>
</div>
<script>
  const NØKKEL = "${nøkkel}";
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
}

const skjermer = await lesSkjermer();
const filer = new Set(await readdir(INN));

const bygget = [];
for (const s of skjermer) {
  const kilder = [
    { fil: `${s.id}-m390.png`, merke: "Mobil 390 · lys", bred: false },
    { fil: `${s.id}-m390-dark.png`, merke: "Mobil 390 · mørk", bred: false },
    ...(s.egenDesktop ? [{ fil: `${s.id}-d1280.png`, merke: "Desktop 1280 · lys", bred: true }] : []),
  ].filter((k) => filer.has(k.fil));

  const bilder = [];
  let bytes = 0;
  for (const k of kilder) {
    const r = await komprimer(k.fil);
    if (!r) continue;
    bytes += r.bytes;
    bilder.push(`<figure><figcaption>${k.merke}</figcaption>
    <div class="ramme"><img loading="lazy" class="${k.bred ? "bred" : ""}"
      alt="${s.navn} — ${k.merke}" src="data:image/jpeg;base64,${r.b64}"></div></figure>`);
  }
  if (bilder.length === 0) continue;

  bygget.push({
    id: s.id, bruker: s.bruker, bytes,
    html: `<section class="skjerm" id="s-${s.id}">
  <header class="skjermtopp">
    <div><span class="id">${s.id}</span><h2>${s.navn}</h2><span class="rute">${s.rute}</span></div>
    <label class="kvitt"><input type="checkbox" data-id="${s.id}"><span>Godkjent</span></label>
  </header>
  ${bilder.join("\n  ")}
</section>`,
  });
  console.log(`OK    ${s.id}  ${bilder.length} bilder  ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

// Coach-flatene (AgencyOS) og spiller-/offentlig-flatene er hver sin side.
const erCoach = (b) => b.bruker === "COACH";
const sider = [
  {
    fil: "screenshots/paper/signoff-playerhq.html",
    tittel: "Sign-off · PlayerHQ og offentlige flater",
    nøkkel: "ak-signoff-playerhq",
    undertittel: "Spillerens flater, innlogging og de offentlige sidene. Disse kan signeres nå.",
    med: bygget.filter((b) => !erCoach(b)),
  },
  {
    fil: "screenshots/paper/signoff-agencyos.html",
    tittel: "Sign-off · AgencyOS",
    nøkkel: "ak-signoff-agencyos",
    undertittel: "Coach-flatene. NB: menyen er ikke portet til fase2-railen ennå — appen har seks "
      + "punkter med gamle navn (Cockpit, Stall), fasiten fire med nye (Konsoll, Spillere). "
      + "Se bort fra menyen, eller vent med disse til S1 er kjørt.",
    med: bygget.filter(erCoach),
  },
];

// En publisert side må under 16 MB, og base64 blåser opp med ~37 %. Deler derfor
// på 10 MB rå bilde-data per side. AgencyOS alene er 18 MB rå og trenger to deler.
const RÅ_BUDSJETT = 10 * 1024 * 1024;

for (const side of sider) {
  if (side.med.length === 0) continue;

  const deler = [[]];
  let brukt = 0;
  for (const b of side.med) {
    if (brukt + b.bytes > RÅ_BUDSJETT && deler.at(-1).length > 0) {
      deler.push([]);
      brukt = 0;
    }
    deler.at(-1).push(b);
    brukt += b.bytes;
  }

  for (const [i, del] of deler.entries()) {
    const flerdelt = deler.length > 1;
    const fil = flerdelt ? side.fil.replace(".html", `-${i + 1}.html`) : side.fil;
    const tittel = flerdelt ? `${side.tittel} (${i + 1} av ${deler.length})` : side.tittel;
    const html = sideHtml({
      tittel,
      undertittel: side.undertittel,
      seksjoner: del,
      // Samme localStorage-nøkkel på tvers av delene: avkryssingen hører til
      // gruppen, ikke til hvilken del du står i. Kopier-lista blir da per del.
      nøkkel: side.nøkkel,
    });
    await writeFile(fil, html);
    console.log(`\nSkrev ${fil} — ${del.length} skjermer, ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB`);
  }
}

await rm(tmp, { recursive: true, force: true });

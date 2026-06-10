/**
 * skjerm-kart.ts — kartmaskinen for AK Golf HQ.
 *
 * Leser HELE koden statisk (kjører ikke appen) og lager ett oversiktskart:
 *  - hvilke skjermer finnes (alle page.tsx → adresse)
 *  - hvilke knapper/lenker leder hvor (href / router.push / redirect / nav-config)
 *  - skjermer som henger i løse lufta (ingen lenke peker dit)  → RØD
 *  - lenker som peker på en skjerm som ikke finnes               → RØD (død lenke)
 *  - skjermer uten tegn på ekte data (demo/uklart)              → GUL
 *  - alt gruppert i produktene PlayerHQ / AgencyOS / Marketing / Booking / Demo
 *
 * Skriver docs/skjerm-kart.html (åpne i nettleser) og en kort oppsummering i terminalen.
 * Kjør:  npm run kart
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, "src", "app");
const NAV_GLOBS = [join(ROOT, "src", "components")]; // nav-config lever her

// ── 1. Finn alle skjermer (page.tsx → adresse) ───────────────────────────────

type Screen = {
  url: string; // normalisert, f.eks. /admin/spillere/[id]
  file: string; // rel sti
  produkt: Produkt;
  harData: boolean;
  inn: string[]; // hvilke filer lenker hit
  ut: string[]; // hvilke adresser denne lenker til
};

type Produkt = "PlayerHQ" | "AgencyOS" | "Marketing" | "Booking" | "Auth" | "Intern" | "Demo/Preview" | "Annet";

function walk(dir: string, filter: (f: string) => boolean): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === "api") continue;
      out.push(...walk(full, filter));
    } else if (filter(e.name)) {
      out.push(full);
    }
  }
  return out;
}

/** src/app/(marketing)/portal/[id]/page.tsx → /portal/[id] (route-grupper strippes) */
function fileTilUrl(file: string): string {
  const rel = relative(APP_DIR, file).replace(/\\/g, "/");
  const segs = rel.split("/");
  segs.pop(); // fjern page.tsx
  const kept = segs.filter((s) => !(s.startsWith("(") && s.endsWith(")")));
  return "/" + kept.join("/");
}

function produktFor(url: string, relFil: string): Produkt {
  if (/-demo\b|-preview\b|\/demo\/|\/(coach|playerhq|agencyos|portal|v2|workbench)-preview\//.test(relFil))
    return "Demo/Preview";
  if (url.startsWith("/portal")) return "PlayerHQ";
  if (url.startsWith("/admin")) return "AgencyOS";
  if (url.startsWith("/booking")) return "Booking";
  if (url.startsWith("/auth") || url.startsWith("/onboard") || url.startsWith("/inviter")) return "Auth";
  if (relFil.includes("/(marketing)/") || url === "/" || url.startsWith("/akgolf")) return "Marketing";
  if (relFil.includes("/(internal)/") || url.startsWith("/intern")) return "Intern";
  return "Annet";
}

/** Tegn på at skjermen henter ekte data (ikke vanntett — gul = "se her"). */
function harDataTegn(tekst: string): boolean {
  return (
    /\bprisma\b/.test(tekst) ||
    /\bawait\s+fetch\(/.test(tekst) ||
    /\bawait\s+load[A-Z]/.test(tekst) ||
    /\bawait\s+get[A-Z]/.test(tekst) ||
    /from\s+["']@\/lib\/(?!utils|design|prisma$)/.test(tekst) || // importerer en lib-lader
    /useQuery|useSWR/.test(tekst) ||
    /\bsearchParams\b/.test(tekst) === false && /export default async function/.test(tekst) && /\bawait\b/.test(tekst)
  );
}

// ── 2. Trekk ut alle lenke-mål fra en tekst ──────────────────────────────────

/** Finner adresser i href="/...", href:'/...', push("/..."), redirect("/..."),
 *  og template-lenker `/x/${id}` (tar prefiks før ${). Returnerer normaliserte URL-er. */
function finnLenker(tekst: string): string[] {
  const treff = new Set<string>();
  const re =
    /(?:href\s*[=:]\s*|router\.push\(\s*|redirect\(\s*|\.replace\(\s*)["'`](\/[^"'`\s>]*)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tekst))) {
    let u = m[1];
    const dollar = u.indexOf("${");
    if (dollar >= 0) u = u.slice(0, dollar).replace(/\/$/, ""); // template → statisk prefiks
    u = u.split("?")[0].split("#")[0]; // dropp query/hash
    if (u.length > 0) treff.add(u);
  }
  return [...treff];
}

/** Matcher en konkret lenke-URL mot en kjent rute-URL (med [param]/[...param]). */
function matcherRute(lenke: string, rute: string): boolean {
  const l = lenke.split("/").filter(Boolean);
  const r = rute.split("/").filter(Boolean);
  for (let i = 0; i < r.length; i++) {
    const rs = r[i];
    if (rs.startsWith("[...")) return true; // catch-all matcher resten
    if (i >= l.length) return false;
    if (rs.startsWith("[")) continue; // [param] matcher ett segment
    if (rs !== l[i]) return false;
  }
  // template-prefiks (lenke kortere enn rute pga ${...}) godtas hvis alt så langt matchet
  return l.length === r.length || (l.length < r.length && r[l.length]?.startsWith("["));
}

// ── 3. Bygg modellen ─────────────────────────────────────────────────────────

const pageFiler = walk(APP_DIR, (f) => f === "page.tsx");
const skjermer = new Map<string, Screen>();

for (const file of pageFiler) {
  const url = fileTilUrl(file);
  const tekst = readFileSync(file, "utf8");
  const relFil = relative(ROOT, file).replace(/\\/g, "/");
  skjermer.set(url, {
    url,
    file: relFil,
    produkt: produktFor(url, relFil),
    harData: harDataTegn(tekst),
    inn: [],
    ut: finnLenker(tekst),
  });
}

// Samle lenker også fra nav-config (sidebar, bottom-nav osv.)
const navFiler = NAV_GLOBS.flatMap((d) => walk(d, (f) => f.endsWith(".tsx")));
const alleLenker: { fra: string; mål: string }[] = [];

for (const [url, s] of skjermer) {
  for (const mål of s.ut) alleLenker.push({ fra: url, mål });
}
for (const nf of navFiler) {
  const tekst = readFileSync(nf, "utf8");
  const rel = relative(ROOT, nf);
  for (const mål of finnLenker(tekst)) alleLenker.push({ fra: `[nav] ${rel}`, mål });
}

// Koble inn-lenker + finn døde lenker
const ruter = [...skjermer.keys()];
const dødeLenker: { fra: string; mål: string }[] = [];

for (const { fra, mål } of alleLenker) {
  const treff = ruter.filter((r) => matcherRute(mål, r));
  if (treff.length === 0) {
    // ignorer eksterne/spesielle
    if (!/^\/(api|_next|#|mailto|tel)/.test(mål)) dødeLenker.push({ fra, mål });
    continue;
  }
  for (const r of treff) skjermer.get(r)!.inn.push(fra);
}

// Inngangspunkter som ALLTID er "koblet" (nås direkte / av rammeverket)
const ROOTS = new Set(["/", "/portal", "/admin", "/admin/agencyos", "/booking", "/auth", "/onboard"]);

function erForeldreNådd(url: string): boolean {
  // dynamisk detalj-side ([id]) regnes nådd hvis foreldre-lista er nådd
  if (!url.includes("[")) return false;
  const foreldre = url.replace(/\/\[[^\]]+\]$/, "");
  const f = skjermer.get(foreldre);
  return !!f && (f.inn.length > 0 || ROOTS.has(foreldre));
}

// ── 4. Klassifiser + tell ─────────────────────────────────────────────────────

type Status = "ok" | "foreldreløs" | "demo";
function statusFor(s: Screen): Status {
  const nådd = s.inn.length > 0 || ROOTS.has(s.url) || erForeldreNådd(s.url);
  if (!nådd) return "foreldreløs";
  if (!s.harData && s.produkt !== "Marketing" && s.produkt !== "Auth") return "demo";
  return "ok";
}

const liste = [...skjermer.values()].sort((a, b) => a.url.localeCompare(b.url));
const tellForeldreløs = liste.filter((s) => statusFor(s) === "foreldreløs").length;
const tellDemo = liste.filter((s) => statusFor(s) === "demo").length;

// ── 5. Skriv HTML-kartet ──────────────────────────────────────────────────────

const PRODUKTER: Produkt[] = ["PlayerHQ", "AgencyOS", "Marketing", "Booking", "Auth", "Intern", "Demo/Preview", "Annet"];
const STATUS_FARGE: Record<Status, { bg: string; kant: string; tekst: string; navn: string }> = {
  ok: { bg: "#EAF3EE", kant: "#1A7D56", tekst: "#0A1F17", navn: "Koblet" },
  foreldreløs: { bg: "#F7E9E9", kant: "#A32D2D", tekst: "#A32D2D", navn: "Henger i løse lufta" },
  demo: { bg: "#FBF3E2", kant: "#B8852A", tekst: "#7a5816", navn: "Demo/uklar data" },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function boks(s: Screen): string {
  const st = statusFor(s);
  const f = STATUS_FARGE[st];
  const innTxt = s.inn.length
    ? s.inn.slice(0, 6).map(esc).join("<br>") + (s.inn.length > 6 ? `<br>+${s.inn.length - 6} flere` : "")
    : "ingen";
  const utTxt = s.ut.length ? s.ut.slice(0, 8).map(esc).join(", ") : "ingen";
  return `<div class="boks" style="background:${f.bg};border-color:${f.kant}">
    <div class="url">${esc(s.url)}</div>
    <div class="badge" style="color:${f.tekst}">${f.navn}</div>
    <div class="meta"><b>Leder hit:</b> ${innTxt}</div>
    <div class="meta"><b>Lenker videre til:</b> ${utTxt}</div>
    <div class="fil">${esc(s.file)}</div>
  </div>`;
}

const seksjoner = PRODUKTER.map((p) => {
  const ipr = liste.filter((s) => s.produkt === p);
  if (ipr.length === 0) return "";
  const fl = ipr.filter((s) => statusFor(s) === "foreldreløs").length;
  const dm = ipr.filter((s) => statusFor(s) === "demo").length;
  return `<section><h2>${p} <span class="cnt">${ipr.length} skjermer · ${fl} løse · ${dm} demo</span></h2>
    <div class="grid">${ipr.map(boks).join("")}</div></section>`;
}).join("");

const dødeListe = dødeLenker
  .sort((a, b) => a.mål.localeCompare(b.mål))
  .map((d) => `<tr><td>${esc(d.mål)}</td><td>${esc(d.fra)}</td></tr>`)
  .join("");

const html = `<!doctype html><html lang="no"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Skjerm-kart — AK Golf HQ</title>
<style>
  :root{--bg:#FAFAF7;--fg:#0A1F17;--card:#fff;--primary:#005840;--accent:#D1F843;--border:#E5E3DD;--muted:#5E5C57}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:Inter,system-ui,sans-serif;font-size:14px}
  header{position:sticky;top:0;background:var(--primary);color:var(--accent);padding:20px 28px;z-index:10}
  header h1{margin:0;font-size:20px;font-weight:700}
  .tall{display:flex;gap:28px;margin-top:10px;color:#fff;font-family:'JetBrains Mono',monospace;font-size:13px;flex-wrap:wrap}
  .tall b{color:var(--accent);font-size:22px;display:block}
  main{padding:24px 28px;max-width:1500px;margin:0 auto}
  section{margin-bottom:36px}
  h2{font-size:16px;border-bottom:2px solid var(--border);padding-bottom:8px}
  .cnt{font-weight:400;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:12px;margin-left:8px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;margin-top:14px}
  .boks{border:2px solid;border-radius:10px;padding:12px 14px}
  .url{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:13px;word-break:break-all}
  .badge{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:4px 0 8px}
  .meta{font-size:12px;color:#333;margin-top:4px;line-height:1.4}
  .meta b{color:var(--fg)}
  .fil{font-size:10px;color:var(--muted);margin-top:8px;font-family:'JetBrains Mono',monospace}
  table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}
  th,td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace}
  th{color:var(--muted)}
  .legend{display:flex;gap:18px;margin-top:12px;font-size:12px;flex-wrap:wrap}
  .dot{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:middle}
</style></head><body>
<header>
  <h1>Skjerm-kart — AK Golf HQ</h1>
  <div class="tall">
    <span><b>${liste.length}</b> skjermer</span>
    <span><b>${tellForeldreløs}</b> henger i løse lufta</span>
    <span><b>${dødeLenker.length}</b> døde lenker</span>
    <span><b>${tellDemo}</b> demo / uklar data</span>
  </div>
  <div class="legend" style="color:#fff">
    <span><span class="dot" style="background:#1A7D56"></span>Koblet</span>
    <span><span class="dot" style="background:#A32D2D"></span>Henger i løse lufta</span>
    <span><span class="dot" style="background:#B8852A"></span>Demo / uklar data</span>
  </div>
</header>
<main>
  ${seksjoner}
  <section><h2>Døde lenker <span class="cnt">${dødeLenker.length} stk — knapp peker på en adresse som ikke finnes</span></h2>
    <table><thead><tr><th>Peker på (finnes ikke)</th><th>Fra</th></tr></thead><tbody>${dødeListe || '<tr><td colspan="2">Ingen 🎉</td></tr>'}</tbody></table>
  </section>
</main></body></html>`;

const utFil = join(ROOT, "docs", "skjerm-kart.html");
writeFileSync(utFil, html, "utf8");

// ── 6. Terminal-oppsummering ──────────────────────────────────────────────────

console.log("\n  SKJERM-KART — AK Golf HQ\n  ────────────────────────");
console.log(`  ${liste.length} skjermer totalt`);
console.log(`  ${tellForeldreløs} henger i løse lufta (rød)`);
console.log(`  ${dødeLenker.length} døde lenker (rød)`);
console.log(`  ${tellDemo} viser demo/uklar data (gul)\n`);
for (const p of PRODUKTER) {
  const n = liste.filter((s) => s.produkt === p).length;
  if (n) console.log(`    ${p.padEnd(14)} ${n}`);
}
console.log(`\n  Åpne kartet:  ${relative(ROOT, utFil)}`);
console.log(`  (dobbeltklikk filen, eller: open ${relative(ROOT, utFil)})\n`);

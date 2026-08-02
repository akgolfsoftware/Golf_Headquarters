/**
 * I8 lag 1 (Bølge 1) — mekanisk lenke-sveip av hele appen.
 *
 * Bygger en liste over alle ekte Next.js-ruter (fra src/app/**\/page.tsx),
 * finner så hver statiske href="..." / <Link href={...}> i src/app og
 * src/components, og bekrefter at hver peker på en rute som faktisk finnes.
 * Utvider metoden fra 12. juli-revisjonen (45 admin-sider/271 mål) til å
 * dekke HELE appen, ikke bare AgencyOS.
 *
 * Rapporterer også (uten å telle som dødlenke, per "no silent caps"):
 *  - eksterne lenker (http/mailto/tel) — hoppet over, ikke vårt ansvar
 *  - dynamiske hrefs (template literal med ${...}) — for usikre til å
 *    statisk verifisere, listet separat så ingen tror de er sjekket
 *
 * Kjør: npx tsx scripts/lenke-sveip-i8-2026-07-14.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, "src/app");
const SCAN_DIRS = [join(ROOT, "src/app"), join(ROOT, "src/components")];

// ---------- 1. Bygg rute-mønstre fra src/app/**/page.tsx ----------

type RuteMonster = { regex: RegExp; kilde: string };

function tilRuteSegment(segment: string): string | null {
  // Route-grupper og parallelle ruter vises ALDRI i URL-en.
  if (segment.startsWith("(") && segment.endsWith(")")) return null;
  if (segment.startsWith("@")) return null;
  if (segment.startsWith("[[...") && segment.endsWith("]]")) return "(?:/.*)?"; // valgfri catch-all
  if (segment.startsWith("[...") && segment.endsWith("]")) return "/.+"; // catch-all
  if (segment.startsWith("[") && segment.endsWith("]")) return "/[^/]+"; // dynamisk segment
  return "/" + segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function samleRuter(dir: string, segments: string[], ut: RuteMonster[]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      samleRuter(full, [...segments, entry.name], ut);
    } else if (
      entry.name === "page.tsx" ||
      entry.name === "page.ts" ||
      entry.name === "route.ts" ||
      entry.name === "route.tsx"
    ) {
      const deler = segments.map(tilRuteSegment).filter((s): s is string => s !== null);
      const pattern = "^" + deler.join("") + "/?$";
      ut.push({ regex: new RegExp(pattern || "^/?$"), kilde: relative(ROOT, full) });
    }
  }
}

const ruter: RuteMonster[] = [];
samleRuter(APP_DIR, [], ruter);
console.log(`Fant ${ruter.length} ekte ruter (page.tsx + route.ts) i src/app/.`);

function ruteFinnes(path: string): boolean {
  if (path === "" || path === "/") return true;
  const normalisert = path.startsWith("/") ? path : "/" + path;
  return ruter.some((r) => r.regex.test(normalisert));
}

// ---------- 2. Finn alle statiske href="..." i kilde-treet ----------

type Treff = { fil: string; linje: number; href: string };

const HREF_STATISK = /href=["']([^"'{}]+)["']/g;
const HREF_TEMPLATE = /href=\{`([^`]*)`\}/g;

const eksterneEllerAnker: Treff[] = [];
const dynamiske: Treff[] = [];
const interne: Treff[] = [];

function erEkstern(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("//")
  );
}

function skanFil(fil: string) {
  const innhold = readFileSync(fil, "utf-8");
  const relFil = relative(ROOT, fil);

  for (const m of innhold.matchAll(HREF_STATISK)) {
    const href = m[1];
    const linje = innhold.slice(0, m.index).split("\n").length;
    const treff: Treff = { fil: relFil, linje, href };
    if (erEkstern(href)) eksterneEllerAnker.push(treff);
    else interne.push(treff);
  }
  for (const m of innhold.matchAll(HREF_TEMPLATE)) {
    const href = m[1];
    const linje = innhold.slice(0, m.index).split("\n").length;
    dynamiske.push({ fil: relFil, linje, href });
  }
}

function skanDir(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      skanDir(full);
    } else if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      skanFil(full);
    }
  }
}

for (const dir of SCAN_DIRS) skanDir(dir);

console.log(`\nFant ${interne.length} interne statiske href, ${eksterneEllerAnker.length} eksterne/anker (hoppet over), ${dynamiske.length} dynamiske template-hrefs (ikke statisk sjekkbare).`);

// ---------- 3. Sjekk hver intern href mot rutelisten ----------

const dode: Treff[] = [];
const sjekket = new Set<string>();

for (const t of interne) {
  const stiUtenQuery = t.href.split("?")[0].split("#")[0];
  const nokkel = `${t.fil}:${stiUtenQuery}`;
  if (sjekket.has(nokkel)) continue;
  sjekket.add(nokkel);
  if (!ruteFinnes(stiUtenQuery)) {
    dode.push(t);
  }
}

console.log(`\n${dode.length} MULIGE dødlenker funnet (statisk href uten matchende page.tsx):\n`);
for (const d of dode) {
  console.log(`  ${d.fil}:${d.linje} → "${d.href}"`);
}

if (dode.length === 0) {
  console.log("Ingen dødlenker funnet i den statiske sveipen.");
}

// ---------- 4. Best-effort sjekk av dynamiske hrefs ----------
// Path-delen (før "?") som IKKE inneholder ${...}: sjekkes direkte.
// Path-delen som INNEHOLDER ${...}: malen sitt statiske segment sjekkes med
// et dummy-segment satt inn der variabelen var — fanger opp feil rute-prefiks
// (f.eks. "/admin/spiler/${id}" — feilstavet) uten å late som vi validerte
// selve id-en.
const dynamiskeUsikre: Treff[] = [];
const dynamiskeOk: Treff[] = [];
const dynamiskeFeil: Treff[] = [];

for (const d of dynamiske) {
  const pathDel = d.href.split("?")[0].split("#")[0];
  const medDummyHele = d.href.replace(/\$\{[^}]*\}/g, "dummy-verdi");
  if (erEkstern(medDummyHele)) {
    dynamiskeOk.push(d);
    continue;
  }
  if (!pathDel.includes("${")) {
    // Ingen dynamikk i selve stien — query-param/hash-variabel, sjekkes direkte.
    if (pathDel === "" || ruteFinnes(pathDel)) dynamiskeOk.push(d);
    else dynamiskeFeil.push(d);
    continue;
  }
  const medDummy = pathDel.replace(/\$\{[^}]*\}/g, "dummy-verdi");
  if (ruteFinnes(medDummy)) dynamiskeOk.push(d);
  else dynamiskeUsikre.push(d);
}

console.log(`\n── Dynamiske hrefs — utvidet sjekk (${dynamiske.length} stk totalt) ──`);
console.log(`  ${dynamiskeOk.length} matcher en kjent rute med dummy-verdi satt inn (OK)`);
console.log(`  ${dynamiskeFeil.length} har statisk sti som IKKE finnes (mulig feil):`);
for (const d of dynamiskeFeil) console.log(`    ${d.fil}:${d.linje} → "${d.href}"`);
console.log(`  ${dynamiskeUsikre.length} kunne ikke matches selv med dummy-verdi (sjekk manuelt):`);
for (const d of dynamiskeUsikre) console.log(`    ${d.fil}:${d.linje} → "${d.href}"`);

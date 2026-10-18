#!/usr/bin/env node
/**
 * Vakt: loading.tsx og alt den importerer skal være ren serverkode.
 *
 * Bakgrunn (gotchas §Bygg og drift, skjermkontrollen 15.10 funn 3): Next lager
 * `<script async src>` UTEN nonce for klient-chunks i en loading-grense. Når
 * fallbacken streames, stopper CSP-en (`'strict-dynamic'`) skriptet. Alt som
 * merkes "use client" i importtreet til en loading.tsx gir en slik chunk, også
 * Nexts egne klientmoduler (`next/link`, `next/image`, `next/navigation`).
 *
 * Skriptet følger importene fra hver loading.tsx under OMRAADER og feiler om
 * det finner en klientmodul. Andre områder rapporteres, men feiler ikke ennå.
 *
 * Bruk: node scripts/check-loading-server.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SRC = join(ROT, "src");
// Feiler verify. Utvid når områdene er rettet.
const OMRAADER = ["src/app/portal"];
const NEXT_KLIENT = new Set(["next/link", "next/image", "next/navigation", "next/dynamic", "next/script", "next/form"]);
const USE_CLIENT = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*["']use client["']/;
const IMPORT = /(?:import|export)\s+(?:type\s+)?(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/g;

function finnLoading(dir, ut = []) {
  for (const navn of readdirSync(dir)) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) finnLoading(sti, ut);
    else if (navn === "loading.tsx" || navn === "loading.ts") ut.push(sti);
  }
  return ut;
}

function los(fra, spesifikator) {
  let base;
  if (spesifikator.startsWith("@/")) base = join(SRC, spesifikator.slice(2));
  else if (spesifikator.startsWith(".")) base = resolve(dirname(fra), spesifikator);
  else return null;
  for (const k of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const s = base + k;
    if (existsSync(s) && statSync(s).isFile()) return s;
  }
  return null;
}

function erTypeImport(kilde, spesifikator) {
  const re = new RegExp(`import\\s+type\\s[^;]*?from\\s+["']${spesifikator.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}["']`);
  return re.test(kilde);
}

/** Returnerer kjeden til første klientmodul, eller null. */
function finnKlient(fil, sett = new Set(), kjede = []) {
  if (sett.has(fil)) return null;
  sett.add(fil);
  const kilde = readFileSync(fil, "utf8");
  const her = [...kjede, relative(ROT, fil)];
  if (USE_CLIENT.test(kilde)) return her;
  for (const m of kilde.matchAll(IMPORT)) {
    const spes = m[1];
    if (spes.endsWith(".css") || erTypeImport(kilde, spes)) continue;
    if (NEXT_KLIENT.has(spes)) return [...her, spes];
    const neste = los(fil, spes);
    if (!neste) continue;
    const funn = finnKlient(neste, sett, her);
    if (funn) return funn;
  }
  return null;
}

let feil = 0;
let varsler = 0;
for (const fil of finnLoading(join(SRC, "app"))) {
  const kjede = finnKlient(fil);
  if (!kjede) continue;
  const rel = relative(ROT, fil);
  const haster = OMRAADER.some((o) => rel.startsWith(o + "/"));
  if (haster) feil++; else varsler++;
  console[haster ? "error" : "warn"](`${haster ? "FEIL" : "obs "} ${rel}\n     ${kjede.join(" → ")}`);
}

if (feil) {
  console.error(`\ncheck-loading-server: ${feil} loading.tsx drar inn klientkode. Bruk serverversjonen (f.eks. PlayerHQSkallLaster) og <a> i stedet for next/link.`);
  process.exit(1);
}
console.log(`check-loading-server: OK (${varsler} utenfor ${OMRAADER.join(", ")} gjenstår)`);

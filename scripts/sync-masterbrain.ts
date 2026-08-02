#!/usr/bin/env tsx
/**
 * Sync-masterbrain — kopierer fasit, RAG-tekster og treningsdata fra den lokale
 * masterbrain-klonen inn i src/lib/masterbrain/ i denne appen.
 *
 * Masterbrain (akgolfsoftware/masterbrain) er kunnskapskilden Anders
 * videreutvikler i; agentene her leser en lokal, versjonert kopi (raskt,
 * ingen nettverkskall i produksjon). Kjør denne etter at masterbrain er
 * oppdatert, for å hente endringene inn:
 *
 *   npx tsx scripts/sync-masterbrain.ts
 *   npm run sync:masterbrain
 *
 * Sti til masterbrain-klonen overstyres med MASTERBRAIN_PATH, ellers
 * antas søsken-mappen ../masterbrain (samme mønster som andre prosjekter
 * under ~/Developer/).
 *
 * Oppdater ALDRI de synkede filene direkte i denne appen — endre kilden i
 * masterbrain-repoet og kjør skriptet på nytt. Kopien overskrives.
 *
 * MERK: rag-corpus kopieres hit, men blir ikke søkbart av seg selv. Chunkene
 * må embeddes til knowledge_chunks (pgvector) med et eget seed-skript før
 * agentenes search_knowledge-tool ser endringene.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

type Kilde = {
  /** Sti i masterbrain-repoet */
  fra: string;
  /** Sti under src/lib/masterbrain/ i denne appen */
  til: string;
  /** Filendelser som kopieres. Alt annet hoppes over. */
  endelser: readonly string[];
  /** Ta med undermapper */
  rekursivt: boolean;
  /** Hva kilden brukes til — vises i loggen */
  hensikt: string;
};

const MASTERBRAIN_PATH = process.env.MASTERBRAIN_PATH ?? resolve(__dirname, "..", "..", "masterbrain");
const MAAL_ROOT = resolve(__dirname, "..", "src", "lib", "masterbrain");

const KILDER: readonly Kilde[] = [
  {
    fra: "knowledge/concepts",
    til: "knowledge/concepts",
    endelser: [".json"],
    rekursivt: false,
    hensikt: "CANON/LTAD/SG-fasit — importeres av src/lib/masterbrain/index.ts",
  },
  {
    fra: "knowledge/entities",
    til: "knowledge/entities",
    endelser: [".json"],
    rekursivt: false,
    hensikt: "MORAD-posisjoner, svingfeil og drills — importeres av index.ts",
  },
  {
    fra: "rag-corpus",
    til: "rag-corpus",
    endelser: [".md", ".json"],
    rekursivt: true,
    hensikt: "RAG-tekster — må embeddes til knowledge_chunks separat",
  },
  {
    fra: "processed/rules",
    til: "processed/rules",
    endelser: [".json", ".md"],
    rekursivt: false,
    hensikt: "MORAD-ordbok, terminologi og diagnostiske regler",
  },
  {
    fra: "training-data",
    til: "training-data",
    endelser: [".jsonl", ".md"],
    rekursivt: true,
    hensikt: "Resonnementseksempler og eval-sett med rubrikk",
  },
] as const;

/** MANIFEST er kartet agentene skal lese først — synkes alltid. */
const MANIFEST = "MANIFEST.md";

function samleFiler(mappe: string, endelser: readonly string[], rekursivt: boolean): string[] {
  const treff: string[] = [];
  for (const navn of readdirSync(mappe)) {
    if (navn.startsWith(".")) continue;
    const full = join(mappe, navn);
    if (statSync(full).isDirectory()) {
      if (rekursivt) treff.push(...samleFiler(full, endelser, true));
      continue;
    }
    if (endelser.some((e) => navn.endsWith(e))) treff.push(full);
  }
  return treff;
}

function main() {
  if (!existsSync(MASTERBRAIN_PATH)) {
    console.error(`Fant ikke masterbrain-klonen: ${MASTERBRAIN_PATH}`);
    console.error("Sett MASTERBRAIN_PATH hvis den ligger et annet sted.");
    process.exit(1);
  }

  const manifestKilde = join(MASTERBRAIN_PATH, MANIFEST);
  if (!existsSync(manifestKilde)) {
    console.error(`Fant ikke ${MANIFEST} i ${MASTERBRAIN_PATH}.`);
    console.error("Peker MASTERBRAIN_PATH på riktig repo?");
    process.exit(1);
  }

  let totalt = 0;
  const manglende: string[] = [];

  for (const kilde of KILDER) {
    const kildeMappe = join(MASTERBRAIN_PATH, kilde.fra);
    if (!existsSync(kildeMappe)) {
      manglende.push(kilde.fra);
      continue;
    }

    const maalMappe = join(MAAL_ROOT, kilde.til);
    // Slett først, ellers blir filer som er fjernet i masterbrain liggende igjen her.
    rmSync(maalMappe, { recursive: true, force: true });
    mkdirSync(maalMappe, { recursive: true });

    const filer = samleFiler(kildeMappe, kilde.endelser, kilde.rekursivt);
    for (const fil of filer) {
      const rel = relative(kildeMappe, fil);
      const maal = join(maalMappe, rel);
      mkdirSync(resolve(maal, ".."), { recursive: true });
      copyFileSync(fil, maal);
    }

    console.log(`${kilde.fra} → ${filer.length} filer`);
    console.log(`  ${kilde.hensikt}`);
    totalt += filer.length;
  }

  copyFileSync(manifestKilde, join(MAAL_ROOT, MANIFEST));
  totalt++;
  console.log(`${MANIFEST} → 1 fil`);
  console.log("  Kart over hva som er fasit — les denne først");

  if (manglende.length > 0) {
    console.warn(`\nAdvarsel: fant ikke ${manglende.join(", ")} i ${MASTERBRAIN_PATH}`);
  }

  console.log(`\nSynket ${totalt} filer fra ${MASTERBRAIN_PATH}`);
  console.log("Husk: rag-corpus må embeddes til knowledge_chunks for at søk skal se endringene.");
}

main();

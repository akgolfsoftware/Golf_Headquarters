/**
 * Design-kanon-QA — håndhever at styringsfilene aldri gjeninnfører gamle designregler.
 * Feiler (exit 1) hvis en styringsfil:
 *   1. Anbefaler «Inter Tight» som gjeldende font (uten deprecated-markør i nærheten).
 *   2. Anbefaler `athletic/` (uten golfdata) som gjeldende komponentkilde
 *      (uten vedlikeholdsmodus-markør i nærheten).
 *   3. Mangler referanse til design-system-regel.md (kanon-pekeren).
 *
 * Whitelist: treff der «utgående», «deprecated», «vedlikeholdsmodus», «legacy»,
 * «arkiv» eller «gammel/gamle» står i samme kontekstvindu regnes som OK.
 *
 * Kjør: npx tsx scripts/design-kanon-qa.ts
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROT = process.cwd();

// Styringsfiler som håndheves (jf. Fase 1-planen)
const STYRINGSFILER: string[] = [
  ...readdirSync(join(ROT, ".claude/rules"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(".claude/rules", f)),
  "docs/platform/AGENT-BRIEF.md",
  "README.md",
  "CLAUDE.md",
  "docs/design-guide-terminologi.md",
];

// Ord som gjør et treff OK når de står i samme kontekstvindu som treffet
const WHITELIST =
  /utgående|utgaaende|deprecated|vedlikeholdsmodus|vedlikehold-modus|legacy|arkiv|gammel|gamle|historisk|fases ut/i;

// Kontekstvindu rundt et treff (tegn før/etter) der whitelist-ord frikjenner
const VINDU = 160;

type Funn = { fil: string; linje: number; regel: string; utdrag: string };
const funn: Funn[] = [];

function kontekstOk(innhold: string, index: number): boolean {
  const start = Math.max(0, index - VINDU);
  const slutt = Math.min(innhold.length, index + VINDU);
  return WHITELIST.test(innhold.slice(start, slutt));
}

function linjeNr(innhold: string, index: number): number {
  return innhold.slice(0, index).split("\n").length;
}

for (const rel of STYRINGSFILER) {
  const sti = join(ROT, rel);
  if (!existsSync(sti)) {
    console.error(`MANGLER: styringsfil finnes ikke: ${rel}`);
    process.exitCode = 1;
    continue;
  }
  const innhold = readFileSync(sti, "utf-8");

  // 1. «Inter Tight» som gjeldende anbefaling
  for (const m of innhold.matchAll(/Inter Tight/g)) {
    if (!kontekstOk(innhold, m.index)) {
      funn.push({
        fil: rel,
        linje: linjeNr(innhold, m.index),
        regel: "«Inter Tight» anbefalt uten deprecated-markør (skal være Familjen Grotesk)",
        utdrag: innhold.slice(m.index, m.index + 60).split("\n")[0],
      });
    }
  }

  // 2. athletic/ som komponentkilde uten golfdata og uten vedlikeholds-markør.
  //    Treffer «src/components/athletic/» og «athletic/»-anbefalinger, men ikke
  //    «athletic/golfdata» (gjeldende kilde).
  for (const m of innhold.matchAll(/(?:src\/components\/)?athletic\/(?!golfdata)/g)) {
    if (!kontekstOk(innhold, m.index)) {
      funn.push({
        fil: rel,
        linje: linjeNr(innhold, m.index),
        regel: "«athletic/» (uten golfdata) anbefalt uten vedlikeholdsmodus-markør",
        utdrag: innhold.slice(m.index, m.index + 60).split("\n")[0],
      });
    }
  }

  // 3. Kanon-referanse må finnes (design-system-regel.md unntas kravet — den ER kanon)
  if (!rel.endsWith("design-system-regel.md") && !innhold.includes("design-system-regel.md")) {
    funn.push({
      fil: rel,
      linje: 1,
      regel: "Mangler referanse til .claude/rules/design-system-regel.md (kanon)",
      utdrag: "",
    });
  }
}

if (funn.length > 0) {
  console.error(`Design-kanon-QA: ${funn.length} brudd i styringsfilene:\n`);
  for (const f of funn) {
    console.error(` - ${f.fil}:${f.linje} — ${f.regel}${f.utdrag ? `\n     «${f.utdrag}»` : ""}`);
  }
  process.exit(1);
}

console.log(`OK: design-kanon-QA — ${STYRINGSFILER.length} styringsfiler sjekket, ingen brudd.`);

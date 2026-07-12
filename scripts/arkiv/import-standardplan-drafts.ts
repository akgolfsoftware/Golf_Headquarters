// Importerer standardplan-utkast forfattet i Claude Code-økt (abonnements-
// veien, ingen API-kostnad). Leser .standardplan-work/draft-<KAT>-<FASE>.json
// og kjører NØYAKTIG samme validering som API-generatoren (standardplan-
// felles.ts): slot-match mot deterministisk skjelett, drill-id-whitelist,
// fagkode-/ordbok-sjekk, minst én putting-økt per uke. Skriver approved:false.
//
//   npx tsx scripts/import-standardplan-drafts.ts            # alle draft-filer
//   npx tsx scripts/import-standardplan-drafts.ts draft-C-GRUNN.json

import * as fs from "node:fs";
import * as dotenv from "dotenv";
import type { NgfKategori, LPhase } from "../src/generated/prisma/client";
import { byggStandardSkjelett } from "../src/lib/plan-engine/standard-fordeling";
import {
  lagPrisma,
  hentDrillKatalog,
  validerSvar,
  skrivUtkast,
  PlanSvarSchema,
  KATEGORIER,
  FASER,
} from "./standardplan-felles";

dotenv.config({ path: ".env.local" });

const prisma = lagPrisma();
const ARBEIDS_DIR = ".standardplan-work";
const FILNAVN = /^draft-([A-L])-(GRUNN|SPESIAL|TURNERING)\.json$/;

async function main() {
  const angitt = process.argv.slice(2);
  const filer = (angitt.length > 0 ? angitt : fs.readdirSync(ARBEIDS_DIR))
    .map((f) => f.replace(/^.*\//, ""))
    .filter((f) => FILNAVN.test(f))
    .sort();
  if (filer.length === 0) throw new Error(`Ingen draft-*.json i ${ARBEIDS_DIR}/`);

  let importert = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const fil of filer) {
    const m = fil.match(FILNAVN)!;
    const kategori = m[1] as NgfKategori;
    const fase = m[2] as LPhase;
    if (!KATEGORIER.includes(kategori) || !FASER.includes(fase)) continue;

    const navn = `Standardplan ${kategori} · ${fase}`;
    const finnes = await prisma.planTemplate.findFirst({ where: { name: navn }, select: { id: true } });
    if (finnes) {
      console.log(`− ${navn}: finnes fra før, hopper over`);
      hoppet++;
      continue;
    }

    const raa = JSON.parse(fs.readFileSync(`${ARBEIDS_DIR}/${fil}`, "utf8"));
    const parsed = PlanSvarSchema.safeParse(raa);
    if (!parsed.success) {
      console.error(`✗ ${navn}: zod-feil — ${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      feilet++;
      continue;
    }

    const skjelett = byggStandardSkjelett(kategori, fase);
    const omrader = [...new Set(skjelett.map((s) => s.pyramidArea))];
    const katalog = await hentDrillKatalog(prisma, kategori, fase, omrader);
    const valideringsFeil = validerSvar(parsed.data, skjelett, katalog);
    if (valideringsFeil.length > 0) {
      console.error(`✗ ${navn}:\n  ${valideringsFeil.slice(0, 8).join("\n  ")}`);
      feilet++;
      continue;
    }

    await skrivUtkast(prisma, kategori, fase, skjelett, parsed.data, "Claude Code-økt");
    console.log(`✓ ${navn}: ${parsed.data.okter.length} økter`);
    importert++;
  }

  console.log(`\nFerdig: ${importert} importert, ${hoppet} fantes fra før, ${feilet} feilet.`);
  if (feilet > 0) process.exit(2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

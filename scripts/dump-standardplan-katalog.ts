// Dumper grunnlaget (skjelett per fase + nivåfiltrert drill-katalog) for
// standardplan-forfatting i Claude Code-økt (abonnements-veien). Én JSON-fil
// per nivå til .standardplan-work/. Filene er arbeidsfiler — slettes etter bruk.
//
//   npx tsx scripts/dump-standardplan-katalog.ts C D E F G H I J K L

import * as fs from "node:fs";
import * as dotenv from "dotenv";
import type { NgfKategori } from "../src/generated/prisma/client";
import { byggStandardSkjelett } from "../src/lib/plan-engine/standard-fordeling";
import { lagPrisma, hentDrillKatalog, KATEGORIER, FASER } from "./standardplan-felles";

dotenv.config({ path: ".env.local" });

const prisma = lagPrisma();
const UT_DIR = ".standardplan-work";

async function main() {
  const valgte = process.argv.slice(2).filter((a): a is NgfKategori =>
    (KATEGORIER as string[]).includes(a),
  );
  if (valgte.length === 0) throw new Error("Angi nivåer, f.eks.: C D E");
  fs.mkdirSync(UT_DIR, { recursive: true });

  for (const kategori of valgte) {
    const faser: Record<string, unknown> = {};
    let katalogRef: unknown = null;
    for (const fase of FASER) {
      const skjelett = byggStandardSkjelett(kategori, fase);
      const omrader = [...new Set(skjelett.map((s) => s.pyramidArea))];
      const katalog = await hentDrillKatalog(prisma, kategori, fase, omrader);
      faser[fase] = {
        skjelett,
        // Kompakt katalog-visning per fase (prioriteringen er fase-avhengig).
        katalog: katalog.map((d) => ({
          id: d.id,
          navn: d.name,
          omrade: d.pyramidArea,
          skillArea: d.skillArea,
          miljo: d.environment,
          varighet: d.durationMin,
          sets: d.defaultSets,
          reps: d.defaultReps,
          csTarget:
            d.csTargetByKategori && typeof d.csTargetByKategori === "object"
              ? ((d.csTargetByKategori as Record<string, number>)[kategori] ?? null)
              : null,
        })),
      };
      katalogRef = faser[fase];
    }
    void katalogRef;
    const sti = `${UT_DIR}/katalog-${kategori}.json`;
    fs.writeFileSync(sti, JSON.stringify({ kategori, faser }, null, 1));
    console.log(`✓ ${sti}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

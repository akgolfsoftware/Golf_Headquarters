/**
 * Kopierer verifiserte expected-to-hole-punkter fra eksisterende sg_baselines
 * til V1-referansesettet. Standardmodus leser bare; --apply publiserer atomisk.
 * Kjør først etter 20261002200000_playerapp_v1_sg i samme database.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SG_BASELINE_VERSION } from "../src/lib/domain/sg-baseline-seed";
import { SG_ENGINE_VERSION } from "../src/lib/domain/sg";
import { mapExistingBaselines, type ExistingExpectedRow } from "../src/lib/domain/sg-reference-import";

const LEVEL_CODE = "PGA_TOUR";
const LABEL = "PGA Tour 2003–2010 · begrenset dekning";
const SOURCE = "Broadie 2011 Appendix A Table 9; AK Golf Team Norway IUP 2025 Ref for green";
const LICENCE_NOTE = "Intern SG-beregning. Offentlig visning av kildekurver og tour-sammenlikning krever egen kilde- og rettighetsavklaring.";

function key(point: { phase: string; lie: string; teePar: number; distanceM: number }) {
  return `${point.phase}:${point.lie}:${point.teePar}:${point.distanceM}`;
}

async function main() {
  const apply = process.argv.includes("--apply");
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });
  try {
    const source = await prisma.sgBaseline.findMany({
      where: { baselineKind: "expected_to_hole", baselineVersion: SG_BASELINE_VERSION },
      select: {
        id: true, baselineKind: true, baselineVersion: true, lieType: true,
        distanceMeters: true, expectedStrokesToHole: true, sourceReference: true,
        quality: true, isSupported: true,
      },
    });
    const rows: ExistingExpectedRow[] = source.map((row) => ({
      ...row,
      distanceMeters: row.distanceMeters == null ? null : Number(row.distanceMeters),
      expectedStrokesToHole: row.expectedStrokesToHole == null ? null : Number(row.expectedStrokesToHole),
    }));
    const planned = mapExistingBaselines(rows);
    if (!apply) {
      console.log(`${rows.length} kildepunkter kontrollert; ${planned.length} støttede V1-punkter klare. Ingen endring gjort.`);
      return;
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.sgReferenceSet.findFirst({
        where: { levelCode: LEVEL_CODE, sourceVersion: SG_BASELINE_VERSION },
      });
      if (existing && (existing.label !== LABEL || existing.source !== SOURCE ||
          existing.licenceNote !== LICENCE_NOTE || existing.engineCompatibleVersion !== SG_ENGINE_VERSION)) {
        throw new Error("Eksisterende SG-referansesett avviker; opprett ny versjon");
      }
      const set = existing ?? await tx.sgReferenceSet.create({
        data: {
          levelCode: LEVEL_CODE, label: LABEL, source: SOURCE,
          sourceVersion: SG_BASELINE_VERSION, licenceNote: LICENCE_NOTE,
          engineCompatibleVersion: SG_ENGINE_VERSION,
        },
      });
      if (!set.publishedAt) {
        for (let offset = 0; offset < planned.length; offset += 100) {
          await tx.strokesGainedBaseline.createMany({
            data: planned.slice(offset, offset + 100).map((point) => ({ ...point, referenceSetId: set.id })),
            skipDuplicates: true,
          });
        }
      }
      const stored = await tx.strokesGainedBaseline.findMany({
        where: { referenceSetId: set.id },
        select: {
          phase: true, lie: true, teePar: true, distanceM: true,
          expectedStrokes: true, sourceRow: true, sourceQuality: true,
        },
      });
      const expected = new Map(planned.map((point) => [key(point), point]));
      if (stored.length !== planned.length || stored.some((point) => {
        const match = expected.get(key(point));
        return !match || point.expectedStrokes !== match.expectedStrokes ||
          point.sourceRow !== match.sourceRow || point.sourceQuality !== match.sourceQuality;
      })) {
        throw new Error("SG-referansesettet er ufullstendig eller har en konflikt");
      }
      if (!set.publishedAt) {
        await tx.sgReferenceSet.update({ where: { id: set.id }, data: { publishedAt: new Date() } });
      }
    }, { timeout: 30_000 });
    console.log(`${planned.length} V1-punkter kontrollert og publisert for intern SG-beregning.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Kopierer verifiserte expected-to-hole-punkter fra eksisterende sg_baselines
 * til V1-referansesettet. Standardmodus leser bare; --apply publiserer atomisk.
 * Kjør først etter 20261002200000_playerapp_v1_sg i samme database.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SG_BASELINE_VERSION } from "../src/lib/domain/sg-baseline-seed";
import { mapExistingBaselines, type ExistingExpectedRow } from "../src/lib/domain/sg-reference-import";

async function main() {
  const apply = process.argv.includes("--apply");
  if (apply) {
    throw new Error(
      "Import/publisering er sperret: dette kilde-/tour-avledede settet mangler dokumentert kommersiell rett til modelltrening og kundevisning.",
    );
  }
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
    console.log(`${rows.length} kildelinjer kontrollert; ${planned.length} støttede V1-punkter identifisert. Ingen endring gjort.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Legger versjonert PGA-kurve i public.sg_baselines. Idempotent: en publisert
 * versjon endres aldri på stedet. Ny kalibrering krever nytt versjonsnavn.
 *
 * Kjør med DIRECT_URL i miljøet:
 *   npx tsx scripts/seed-sg-expected-baselines.ts --apply
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateSgBaselineSeed, SG_BASELINE_VERSION } from "../src/lib/domain/sg-baseline-seed";

async function main() {
  const rows = generateSgBaselineSeed();
  if (!process.argv.includes("--apply")) {
    console.log(`${rows.length} seed-punkter klare for ${SG_BASELINE_VERSION}. Bruk --apply for å skrive.`);
    return;
  }
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });
  try {
    const data = rows.map((row) => ({
      baselineKind: "expected_to_hole",
      baselineVersion: SG_BASELINE_VERSION,
      distanceMeters: row.distanceMeters,
      lieType: row.lieType,
      expectedStrokesToHole: row.expectedStrokes,
      sourceReference: row.sourceReference,
      quality: row.quality,
      isSupported: row.isSupported,
    }));
    await prisma.$transaction(async (tx) => {
      for (let offset = 0; offset < data.length; offset += 100) {
        await tx.sgBaseline.createMany({ data: data.slice(offset, offset + 100), skipDuplicates: true });
      }
      const stored = await tx.sgBaseline.findMany({
        where: { baselineVersion: SG_BASELINE_VERSION },
        select: {
          baselineKind: true,
          distanceMeters: true,
          lieType: true,
          expectedStrokesToHole: true,
          sourceReference: true,
          quality: true,
          isSupported: true,
        },
      });
      if (stored.length !== rows.length) throw new Error(`Seed ufullstendig: ${stored.length}/${rows.length} punkter`);
      const byKey = new Map(rows.map((row) => [`${row.lieType}:${row.distanceMeters}`, row]));
      for (const row of stored) {
        const key = `${row.lieType}:${Number(row.distanceMeters)}`;
        const expected = byKey.get(key);
        if (
          !expected || row.baselineKind !== "expected_to_hole" ||
          (row.expectedStrokesToHole == null ? null : Number(row.expectedStrokesToHole)) !== expected.expectedStrokes ||
          row.sourceReference !== expected.sourceReference || row.quality !== expected.quality ||
          row.isSupported !== expected.isSupported
        ) {
          throw new Error(`Seed-konflikt ved ${key}. Opprett en ny baseline-versjon.`);
        }
      }
    }, { timeout: 30_000 });
    console.log(`SG-seed ${SG_BASELINE_VERSION}: ${rows.length} punkter verifisert.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

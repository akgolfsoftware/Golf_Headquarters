import "./_env";
import { kjorGfgkJuniorBootstrap } from "@/lib/gfgk-junior/bootstrap";
import { prisma } from "@/lib/prisma";

/**
 * Oppretter de 4 GFGK Junior-gruppene med faste ukentlige økter og
 * sesongperioder (delt logikk: src/lib/gfgk-junior/bootstrap.ts — samme
 * bootstrap kan også kjøres fra knappen på /admin/grupper). Idempotent.
 *
 *   npx tsx scripts/opprett-gfgk-junior-grupper.ts
 */

async function main() {
  const r = await kjorGfgkJuniorBootstrap();
  for (const navn of r.grupperOpprettet) console.log(`Opprettet gruppe: ${navn}`);
  for (const navn of r.grupperFantes) console.log(`Gruppe fantes: ${navn}`);
  console.log(`Faste økter opprettet: ${r.okterOpprettet}`);
  console.log(`Sesongperioder opprettet: ${r.perioderOpprettet}`);
  console.log("Ferdig. AgencyOS (/admin/grupper + Workbench) er nå master for planene.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

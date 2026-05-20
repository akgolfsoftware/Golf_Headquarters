/**
 * Seed: GFGK fasiliteter med type, kart-koordinater og indoor-flag.
 *
 * Idempotent — kjør så ofte du vil. Bruker findFirst på (locationId, name)
 * for å unngå duplikater. Eksisterende fasiliteter oppdateres med type/koord;
 * manglende fasiliteter opprettes.
 *
 * Kjør: `npx tsx prisma/seed-gfgk-facilities.ts`
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, FacilityType } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type FacilitySeed = {
  name: string;
  type: FacilityType;
  capacity: number;
  isIndoor: boolean;
  description?: string;
  mapX: number;
  mapY: number;
};

const GFGK_FACILITIES: FacilitySeed[] = [
  {
    name: "Performance Studio",
    type: "STUDIO",
    capacity: 2,
    isIndoor: true,
    description:
      "Innendørs TrackMan-studio med GC Quad. Anders' default-bay for privattimer.",
    mapX: 25,
    mapY: 35,
  },
  {
    name: "Driving Range 1. etg",
    type: "RANGE_1F",
    capacity: 6,
    isIndoor: false,
    description: "Range-matter nederste etasje, 6 stasjoner.",
    mapX: 40,
    mapY: 50,
  },
  {
    name: "Driving Range 2. etg",
    type: "RANGE_2F",
    capacity: 4,
    isIndoor: false,
    description: "Range-matter øvre etasje, 4 stasjoner med utsikt.",
    mapX: 40,
    mapY: 45,
  },
  {
    name: "Putting Green",
    type: "PUTTING_GREEN",
    capacity: 10,
    isIndoor: false,
    description: "Stor puttinggreen ved klubbhuset.",
    mapX: 50,
    mapY: 30,
  },
  {
    name: "Nærspillsområde",
    type: "SHORT_GAME",
    capacity: 6,
    isIndoor: false,
    description: "Chip- og pitch-område med bunker.",
    mapX: 55,
    mapY: 60,
  },
  {
    name: "9-hullsbanen",
    type: "COURSE_9H",
    capacity: 8,
    isIndoor: false,
    description: "Full bane-runde, par 32.",
    mapX: 70,
    mapY: 50,
  },
  {
    name: "Hull 4/5",
    type: "SPECIFIC_HOLES",
    capacity: 4,
    isIndoor: false,
    description: "Scenario-trening på par 3-hull 4 og par 4-hull 5.",
    mapX: 75,
    mapY: 65,
  },
];

async function main() {
  const gfgk = await prisma.location.findFirst({
    where: { name: { contains: "Gamle Fredrikstad", mode: "insensitive" } },
  });

  if (!gfgk) {
    throw new Error(
      "GFGK Location ikke funnet. Kjør hovedseed først: npm run db:seed",
    );
  }

  console.log(`Fant GFGK: ${gfgk.name} (${gfgk.id})`);

  let opprettet = 0;
  let oppdatert = 0;

  for (const seed of GFGK_FACILITIES) {
    const existing = await prisma.facility.findFirst({
      where: { locationId: gfgk.id, name: seed.name },
    });

    if (existing) {
      await prisma.facility.update({
        where: { id: existing.id },
        data: {
          type: seed.type,
          capacity: seed.capacity,
          isIndoor: seed.isIndoor,
          description: seed.description,
          mapX: seed.mapX,
          mapY: seed.mapY,
          active: true,
        },
      });
      oppdatert++;
      console.log(`  ↻ ${seed.name}`);
    } else {
      await prisma.facility.create({
        data: {
          locationId: gfgk.id,
          name: seed.name,
          type: seed.type,
          capacity: seed.capacity,
          isIndoor: seed.isIndoor,
          description: seed.description,
          mapX: seed.mapX,
          mapY: seed.mapY,
          active: true,
        },
      });
      opprettet++;
      console.log(`  + ${seed.name}`);
    }
  }

  console.log(
    `\n✓ GFGK seed ferdig — ${opprettet} opprettet, ${oppdatert} oppdatert.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

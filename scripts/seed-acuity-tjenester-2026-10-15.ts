/**
 * Bookingplanen steg 2 (Anders 15.10.2026): de seks Acuity-tjenestene som data.
 *
 * Lest fra akgolfgroup.as.me 15.10 («Drop in - Privat Coaching», kalenderen
 * «Gamle Fredrikstad Golfklubb - Anders Kristiansen»):
 *   Flex 20 min med Markus 300 kr · Flex 20 min 600 kr · Flex 50 min 1 500 kr ·
 *   Flex Duo 50 min 1 700 kr (2 deltakere) · Flex 90 min 2 500 kr ·
 *   Flex Duo 90 min 2 700 kr (2 deltakere).
 *
 * Idempotent og forsiktig:
 * - Finnes en aktiv tjeneste med samme varighet, pris og deltakerantall (og
 *   samme coach), lages ingen dublett. Eksisterende tjenester beholder navn
 *   og pris; bare sted og kategori fylles inn der de er tomme.
 * - Mangler tjenesten, opprettes den med slug fra navnet.
 * - Priser leses aldri fra kode i UI; dette skriptet er datainnlegging.
 *
 *   npx tsx scripts/seed-acuity-tjenester-2026-10-15.ts            # tørrkjøring
 *   npx tsx scripts/seed-acuity-tjenester-2026-10-15.ts --skriv    # skriv
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { lagTjenesteSlug } from "../src/lib/booking/tjeneste-slug";

const SKRIV = process.argv.includes("--skriv");
const STED_NAVN = "Gamle Fredrikstad GK";

type Acuity = {
  navn: string;
  priceOre: number;
  durationMin: number;
  maxDeltakere: number;
  /** E-post-domenefri identifikasjon av coach: navnet i users, eller null = Anders/felles. */
  coachNavnInneholder: string | null;
  description: string;
};

const ACUITY: Acuity[] = [
  { navn: "Flex 20 min — Markus", priceOre: 30000, durationMin: 20, maxDeltakere: 1, coachNavnInneholder: "Markus", description: "Drop-in privattime 20 minutter med Markus." },
  { navn: "Flex 20 min — Anders", priceOre: 60000, durationMin: 20, maxDeltakere: 1, coachNavnInneholder: null, description: "Drop-in privattime 20 minutter." },
  { navn: "Flex 50 min — Anders", priceOre: 150000, durationMin: 50, maxDeltakere: 1, coachNavnInneholder: null, description: "Drop-in privattime 50 minutter." },
  { navn: "Flex Duo 50 min — Anders", priceOre: 170000, durationMin: 50, maxDeltakere: 2, coachNavnInneholder: null, description: "Drop-in time 50 minutter for to spillere. Én betaler." },
  { navn: "Flex 90 min — Anders", priceOre: 250000, durationMin: 90, maxDeltakere: 1, coachNavnInneholder: null, description: "Drop-in privattime 90 minutter." },
  { navn: "Flex Duo 90 min — Anders", priceOre: 270000, durationMin: 90, maxDeltakere: 2, coachNavnInneholder: null, description: "Drop-in time 90 minutter for to spillere. Én betaler." },
];

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL/DATABASE_URL mangler");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  try {
    const sted = await prisma.location.findFirst({ where: { name: STED_NAVN }, select: { id: true, name: true } });
    if (!sted) throw new Error(`Stedet «${STED_NAVN}» finnes ikke i locations.`);

    const coacher = await prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
      select: { id: true, name: true },
    });
    const finnCoach = (del: string | null) =>
      del ? coacher.find((c) => c.name?.toLowerCase().includes(del.toLowerCase()))?.id ?? null : null;

    const eksisterende = await prisma.serviceType.findMany({ where: { active: true } });

    for (const a of ACUITY) {
      const coachUserId = finnCoach(a.coachNavnInneholder);
      if (a.coachNavnInneholder && !coachUserId) {
        console.log(`HOPPER OVER «${a.navn}»: fant ingen coach med «${a.coachNavnInneholder}» i navnet.`);
        continue;
      }
      const treff = eksisterende.find(
        (e) =>
          e.durationMin === a.durationMin &&
          e.priceOre === a.priceOre &&
          e.maxDeltakere === a.maxDeltakere &&
          (a.coachNavnInneholder ? e.coachUserId === coachUserId : e.coachUserId === null || e.name.toLowerCase().includes("anders")),
      );

      if (treff) {
        const data: { locationId?: string; kategori?: string } = {};
        if (!treff.locationId) data.locationId = sted.id;
        if (!treff.kategori) data.kategori = "drop-in";
        if (Object.keys(data).length === 0) {
          console.log(`OK      «${treff.name}» (${treff.slug}) dekker «${a.navn}» og har alt satt.`);
          continue;
        }
        console.log(`OPPDAT  «${treff.name}» (${treff.slug}) dekker «${a.navn}» → ${JSON.stringify(data)}`);
        if (SKRIV) await prisma.serviceType.update({ where: { id: treff.id }, data });
        continue;
      }

      let slug = lagTjenesteSlug(a.navn);
      let n = 1;
      while (await prisma.serviceType.findUnique({ where: { slug }, select: { id: true } })) {
        n++;
        slug = `${lagTjenesteSlug(a.navn)}-${n}`;
      }
      console.log(`NY      «${a.navn}» (${slug}) ${a.priceOre / 100} kr · ${a.durationMin} min · maks ${a.maxDeltakere} · sted ${sted.name}`);
      if (SKRIV) {
        await prisma.serviceType.create({
          data: {
            slug,
            name: a.navn,
            description: a.description,
            priceOre: a.priceOre,
            durationMin: a.durationMin,
            maxDeltakere: a.maxDeltakere,
            coachUserId,
            locationId: sted.id,
            kategori: "drop-in",
            active: true,
          },
        });
      }
    }

    // Performance-pakkene får kategori «abonnement» der den mangler, så BK-01
    // ikke trenger navnesjekk for dem.
    const abonnement = await prisma.serviceType.findMany({
      where: { kategori: null, name: { contains: "Performance", mode: "insensitive" } },
      select: { id: true, name: true },
    });
    for (const p of abonnement) {
      console.log(`KATEG   «${p.name}» → abonnement`);
      if (SKRIV) await prisma.serviceType.update({ where: { id: p.id }, data: { kategori: "abonnement" } });
    }

    console.log(SKRIV ? "Skrevet." : "Tørrkjøring — legg til --skriv for å skrive.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

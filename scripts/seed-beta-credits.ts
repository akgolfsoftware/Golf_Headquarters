/**
 * scripts/seed-beta-credits.ts — gir beta-puljen (14 spillere) 3 booking-credits hver
 * så de kan teste booking-flyten i beta (gratis-perioden). Idempotent upsert.
 * Kjør: npx tsx scripts/seed-beta-credits.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const BETA_EPOSTER = [
  "fredrik.hovland@akgolf.no", "aksel.lind@akgolf.no", "ludvig.vanberg@akgolf.no",
  "jakob.holm@akgolf.no", "anders.rafshol@akgolf.no", "constanse.hauglid@akgolf.no",
  "viktoria.hammer@akgolf.no", "max.risvag@akgolf.no", "sondre.thogersen@akgolf.no",
  "marius.nesset@akgolf.no", "oskar.hammer@akgolf.no", "karl.braathen@akgolf.no",
  "filip.svendsen@akgolf.no", "elias.fosback@akgolf.no",
];

async function main() {
  const periodeSlutt = new Date();
  periodeSlutt.setMonth(periodeSlutt.getMonth() + 1);
  let ok = 0;
  for (const email of BETA_EPOSTER) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) { console.log(`MANGLER bruker: ${email}`); continue; }
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { status: "ACTIVE", monthlyCredits: 3, creditsRemaining: 3, currentPeriodEnd: periodeSlutt },
      create: { userId: user.id, tier: "GRATIS", status: "ACTIVE", monthlyCredits: 3, creditsRemaining: 3, currentPeriodEnd: periodeSlutt },
    });
    ok++;
  }
  const verifiser = await prisma.subscription.count({
    where: { user: { email: { in: BETA_EPOSTER } }, status: "ACTIVE", creditsRemaining: { gte: 1 } },
  });
  console.log(`Ferdig: ${ok}/${BETA_EPOSTER.length} oppdatert · verifisert med credits: ${verifiser}/14`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

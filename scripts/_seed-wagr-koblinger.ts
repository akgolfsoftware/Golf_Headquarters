import "./_env";
import { prisma } from "@/lib/prisma";
// Kobler demo-stall-spillere til WagrSnapshot (radar/wagr-skjermene trenger data).
const KOBLINGER = [
  { email: "oyvind-rohjan@stall.akgolf.test", slug: "demo-oyvind-rohjan", rank: 842, delta: 12, pts: 1.84 },
  { email: "mia-nilsen@stall.akgolf.test", slug: "demo-mia-nilsen", rank: 415, delta: 4, pts: 2.61 },
  { email: "karl-ludvig@stall.akgolf.test", slug: "demo-karl-ludvig", rank: 1267, delta: -8, pts: 1.12 },
  { email: "sofie-kvam@stall.akgolf.test", slug: "demo-sofie-kvam", rank: 1903, delta: 2, pts: 0.74 },
];
async function main() {
  for (const k of KOBLINGER) {
    const u = await prisma.user.findUnique({ where: { email: k.email }, select: { id: true, name: true } });
    if (!u) { console.log(`hopper over ${k.email} (finnes ikke)`); continue; }
    await prisma.wagrSnapshot.upsert({
      where: { wagrPlayerSlug: k.slug },
      update: { userId: u.id, rank: k.rank, moveDelta: k.delta, ptsAvg: k.pts },
      create: {
        wagrPlayerSlug: k.slug, fullName: u.name, country: "NOR",
        rank: k.rank, moveDelta: k.delta, ptsAvg: k.pts, divisor: 40, userId: u.id,
      },
    });
    console.log(`koblet ${u.name} → #${k.rank}`);
  }
}
main().then(() => prisma.$disconnect());

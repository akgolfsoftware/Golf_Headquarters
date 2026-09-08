import "./_env";
import { config } from "dotenv";

if (!process.env.DATABASE_URL) {
  config({ path: "../akgolf-hq/.env.local" });
}

async function main() {
  const { prisma } = await import("@/lib/prisma");
  const rader = await prisma.datagolfTak.findMany({
    orderBy: { sortOrder: "asc" },
    include: { bands: true },
  });
  for (const t of rader) {
    const fw100 = t.bands.find((b) => b.band === "innspill100" && b.lie === "fairway");
    const prox = fw100?.proximityMeters;
    console.log(
      [
        t.sortOrder,
        t.name,
        t.dgRank,
        t.sgTotal?.toFixed(2),
        t.formLabel,
        prox != null ? `${prox.toFixed(1)} m` : "mangler",
        `${t.bands.length} bånd`,
        t.asOf.toISOString().slice(0, 10),
      ].join(" | "),
    );
  }
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

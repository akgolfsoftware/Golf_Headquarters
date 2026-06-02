import "./_env";
import { prisma } from "@/lib/prisma";

async function main() {
  const all = await prisma.serviceType.findMany({
    orderBy: { slug: "asc" },
    include: { coach: { select: { name: true } } },
  });
  console.table(
    all.map((s) => ({
      slug: s.slug,
      active: s.active,
      coach: s.coach?.name ?? "(felles)",
      kr: s.priceOre / 100,
    })),
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

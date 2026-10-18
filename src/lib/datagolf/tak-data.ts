import { requireDataGolfAnalyst } from "@/lib/datagolf/access";
import { prisma } from "@/lib/prisma";

export async function hentAktiveTak() {
  await requireDataGolfAnalyst();
  return prisma.datagolfTak.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { bands: true },
  });
}

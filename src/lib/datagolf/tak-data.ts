import { prisma } from "@/lib/prisma";

export async function hentAktiveTak() {
  return prisma.datagolfTak.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { bands: true },
  });
}

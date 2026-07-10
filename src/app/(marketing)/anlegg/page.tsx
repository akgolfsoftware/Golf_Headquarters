/**
 * /anlegg — v2. Server-loader gjenbrukt 1:1 fra (mlegacy)/anlegg/page.tsx.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarkedAnleggListeV2, type AnleggLocation } from "@/components/marketing/v2/MarkedAnleggListeV2";

export const metadata: Metadata = {
  title: "Anlegg hos AK Golf Academy",
  description:
    "Hovedanleggene våre: Gamle Fredrikstad Golfklubb, Miklagard Golfklubb og Mulligan Indoor Golf.",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MARKETING_LOCATIONS = ["Gamle Fredrikstad GK", "Miklagard Golfklubb"];

export default async function AnleggListeV2() {
  const locations = await prisma.location.findMany({
    where: {
      active: true,
      name: { in: MARKETING_LOCATIONS },
    },
    include: { facilities: { where: { active: true } } },
    orderBy: { name: "asc" },
  });

  const rows: AnleggLocation[] = locations.map((loc) => ({
    id: loc.id,
    slug: slugify(loc.name),
    name: loc.name,
    address: loc.address,
    facilities: loc.facilities.map((f) => ({ id: f.id, name: f.name, isIndoor: f.isIndoor })),
  }));

  return <MarkedAnleggListeV2 locations={rows} />;
}

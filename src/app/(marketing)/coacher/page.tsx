/**
 * /coacher — v2. Server-loader gjenbrukt 1:1 fra (mlegacy)/coacher/page.tsx
 * (kuratert liste er fasit for HVEM som vises; DB beriker kun profilbilde).
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarkedCoacherListeV2, type CoachKort } from "@/components/marketing/v2/MarkedCoacherListeV2";

export const metadata: Metadata = {
  title: "Coachene våre · AK Golf Academy",
  description:
    "Møt coachene i AK Golf Academy: Anders Kristiansen og Markus Røinås Pedersen.",
};

const FALLBACK_COACHER: CoachKort[] = [
  {
    slug: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · PGA Pro",
    bio: "Bygger Academy rundt målbar fremgang. Mer enn et tiår med spillere på alle nivåer, fra første time til turneringsspill.",
    initialer: "AK",
    foto: null,
    tags: ["Plan & struktur", "Trackman", "Mental"],
  },
  {
    slug: "markus",
    navn: "Markus Røinås Pedersen",
    tittel: "Assistent",
    bio: "Jobber tett med juniorprogrammet og spillere som vil ta neste steg. Sterk på korte slag og putting.",
    initialer: "MR",
    foto: null,
    tags: ["Nærspill", "Putting", "Junior"],
  },
];

function utledSlug(navn: string): string {
  const first = navn.split(" ")[0]?.toLowerCase() ?? "";
  return first
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z]/g, "");
}

export default async function CoacherSideV2() {
  const dbCoacher = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    select: { id: true, name: true, avatarUrl: true },
  });

  const coacher: CoachKort[] = FALLBACK_COACHER.map((f) => {
    const db = dbCoacher.find((u) => u.name === f.navn || utledSlug(u.name) === f.slug);
    return db?.avatarUrl ? { ...f, foto: db.avatarUrl } : f;
  });

  return <MarkedCoacherListeV2 coacher={coacher} />;
}

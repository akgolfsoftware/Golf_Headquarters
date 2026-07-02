import { prisma } from "@/lib/prisma";
import type { SgKategori } from "./fokus";

type SgFelter = {
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

const KATEGORI_FELT: [SgKategori, keyof SgFelter][] = [
  ["OTT", "sgOtt"],
  ["APP", "sgApp"],
  ["ARG", "sgArg"],
  ["PUTT", "sgPutt"],
];

function lavesteKategori(verdier: Partial<Record<SgKategori, number>>): {
  kategori: SgKategori;
  sg: number;
} | null {
  let svakest: { kategori: SgKategori; sg: number } | null = null;
  for (const [kategori] of KATEGORI_FELT) {
    const sg = verdier[kategori];
    if (sg == null) continue;
    if (svakest === null || sg < svakest.sg) svakest = { kategori, sg };
  }
  return svakest;
}

/**
 * Størst SG-gap for en spiller: laveste strokes gained-kategori (OTT/APP/ARG/PUTT).
 * Kilde (samme prioritering som stallen bruker for SG-trend):
 *   1. Nyeste BrukerSgInput med kategoritall (manuell/TrackMan/NLB-import).
 *   2. Ellers snitt per kategori over siste 8 runder (Round.sgOtt osv.).
 * Null når ingen kategori-SG finnes.
 */
export async function beregnSgGap(
  userId: string,
): Promise<{ kategori: SgKategori; sg: number } | null> {
  const harKategoritall = [
    { sgOtt: { not: null } },
    { sgApp: { not: null } },
    { sgArg: { not: null } },
    { sgPutt: { not: null } },
  ];

  const input = await prisma.brukerSgInput.findFirst({
    where: { userId, OR: harKategoritall },
    orderBy: { dato: "desc" },
    select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });
  if (input) {
    const verdier: Partial<Record<SgKategori, number>> = {};
    for (const [kategori, felt] of KATEGORI_FELT) {
      const v = input[felt];
      if (v != null) verdier[kategori] = v;
    }
    return lavesteKategori(verdier);
  }

  const runder = await prisma.round.findMany({
    where: { userId, OR: harKategoritall },
    orderBy: { playedAt: "desc" },
    take: 8,
    select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });
  if (runder.length === 0) return null;

  const snitt: Partial<Record<SgKategori, number>> = {};
  for (const [kategori, felt] of KATEGORI_FELT) {
    const tall = runder.map((r) => r[felt]).filter((v): v is number => v != null);
    if (tall.length > 0) snitt[kategori] = tall.reduce((a, b) => a + b, 0) / tall.length;
  }
  return lavesteKategori(snitt);
}

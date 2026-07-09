/**
 * Data-loader for PlayerHQ DataGolf (v2) — «Deg mot touren».
 *
 * Sammenligner spillerens strokes gained mot en ekte PGA Tour-referansespiller.
 * Kilder (alt ekte, aldri fabrikkert):
 *   - BrukerSammenligning  → lagrede sammenligninger mot en DataGolf-spiller
 *                            (snapshot av gap over tid via sgDiffTotal)
 *   - BrukerSgInput        → spillerens egen SG-fordeling (via relasjonen sgInput)
 *   - PgaPlayerSeason      → referansespillerens SG-fordeling per kategori
 *
 * Ingen sammenligning registrert → harData:false (ærlig tom-tilstand i UI).
 * Ingen utdiktede tall: mangler et felt, blir det null.
 */

import { prisma } from "@/lib/prisma";
import { sammenlignMedReferanse } from "@/lib/stats/sg-estimator";

const MND_KORT = [
  "JAN", "FEB", "MAR", "APR", "MAI", "JUN",
  "JUL", "AUG", "SEP", "OKT", "NOV", "DES",
];

export type DataGolfKode = "OTT" | "APP" | "ARG" | "PUTT";

/** Per SG-kategori: spillerens verdi mot referansespillerens (per runde). */
export type DataGolfKategori = {
  code: DataGolfKode;
  /** Norsk visningsnavn (ordbok: ARG = Nærspill). */
  name: string;
  /** Spillerens SG per runde i kategorien. null = mangler. */
  deg: number | null;
  /** Referansespillerens SG per runde. null = mangler. */
  ref: number | null;
  /** ref − deg (positiv = referansen er bedre = du ligger bak). null = mangler. */
  gap: number | null;
};

export type DataGolfData = {
  /** True kun når minst én registrert sammenligning finnes. */
  harData: boolean;
  /** Referansespillerens navn (fra sammenligningen). */
  refNavn: string | null;
  refAar: number | null;
  refTour: string | null;
  /** Spillerens SG total (per runde) i siste sammenligning. */
  sgTotalDeg: number | null;
  /** Referansespillerens SG total (per runde). */
  sgTotalRef: number | null;
  /** ref − deg for total (positiv = du ligger bak touren). */
  gapTotal: number | null;
  /** Endring i posisjon (deg − ref) fra forrige snapshot til nå. Positiv = nærmere touren. */
  gapDelta: number | null;
  /** Retning for gapDelta til DeltaChip. */
  gapDeltaDir: "up" | "down" | null;
  /** Antall registrerte sammenligninger totalt. */
  antallSnapshots: number;
  /** SG-kategoriene (OTT/APP/ARG/PUTT). */
  kategorier: DataGolfKategori[];
  /** Posisjon mot touren per snapshot (deg − ref = −sgDiffTotal), kronologisk. Negativ = bak. */
  trend: number[];
  /** Akse-etiketter for trend (måned, start/midt/slutt). */
  trendLabels: string[];
  /** Kategorien med størst avstand til touren. */
  storsteGap: { code: DataGolfKode; name: string; gap: number } | null;
  /** ISO-dato for siste sammenligning. */
  sisteDato: string | null;
};

const KAT_NAVN: Record<DataGolfKode, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

const TOM: DataGolfData = {
  harData: false,
  refNavn: null,
  refAar: null,
  refTour: null,
  sgTotalDeg: null,
  sgTotalRef: null,
  gapTotal: null,
  gapDelta: null,
  gapDeltaDir: null,
  antallSnapshots: 0,
  kategorier: [],
  trend: [],
  trendLabels: [],
  storsteGap: null,
  sisteDato: null,
};

export async function hentDataGolf(userId: string): Promise<DataGolfData> {
  // Alle registrerte sammenligninger, kronologisk (eldst først → for trend).
  const sammenligninger = await prisma.brukerSammenligning.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { sgInput: true },
  });

  if (sammenligninger.length === 0) return TOM;

  const siste = sammenligninger[sammenligninger.length - 1];
  const sg = siste.sgInput;

  // Referansespillerens SG-fordeling fra PgaPlayerSeason (nyeste sesong).
  const ref = await prisma.pgaPlayerSeason.findFirst({
    where: { dgPlayerId: siste.refDgPlayerId, tour: siste.refTour },
    orderBy: { year: "desc" },
    select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sgTotal: true },
  });

  const cmp = sammenlignMedReferanse(
    { sgOtt: sg.sgOtt, sgApp: sg.sgApp, sgArg: sg.sgArg, sgPutt: sg.sgPutt, sgTotal: sg.sgTotal },
    {
      sgOtt: ref?.sgOtt ?? null,
      sgApp: ref?.sgApp ?? null,
      sgArg: ref?.sgArg ?? null,
      sgPutt: ref?.sgPutt ?? null,
      sgTotal: ref?.sgTotal ?? null,
    },
  );

  const kategorier: DataGolfKategori[] = (
    [
      { code: "OTT", deg: sg.sgOtt, ref: ref?.sgOtt ?? null, gap: cmp.diff.ott },
      { code: "APP", deg: sg.sgApp, ref: ref?.sgApp ?? null, gap: cmp.diff.app },
      { code: "ARG", deg: sg.sgArg, ref: ref?.sgArg ?? null, gap: cmp.diff.arg },
      { code: "PUTT", deg: sg.sgPutt, ref: ref?.sgPutt ?? null, gap: cmp.diff.putt },
    ] as const
  ).map((k) => ({ code: k.code, name: KAT_NAVN[k.code], deg: k.deg, ref: k.ref, gap: k.gap }));

  // Posisjon mot touren per snapshot = deg − ref = −sgDiffTotal. Negativ = bak.
  const posisjoner = sammenligninger
    .map((s) => (s.sgDiffTotal != null ? -s.sgDiffTotal : null))
    .filter((v): v is number => v != null);

  const trendLabels: string[] =
    sammenligninger.length >= 2
      ? [
          MND_KORT[sammenligninger[0].createdAt.getMonth()],
          MND_KORT[sammenligninger[Math.floor((sammenligninger.length - 1) / 2)].createdAt.getMonth()],
          MND_KORT[sammenligninger[sammenligninger.length - 1].createdAt.getMonth()],
        ]
      : [];

  // gapDelta = endring i posisjon fra nest-siste til siste (positiv = nærmere touren).
  let gapDelta: number | null = null;
  let gapDeltaDir: "up" | "down" | null = null;
  if (posisjoner.length >= 2) {
    gapDelta = posisjoner[posisjoner.length - 1] - posisjoner[posisjoner.length - 2];
    gapDeltaDir = gapDelta >= 0 ? "up" : "down";
  }

  const storsteGap = cmp.storsteGap
    ? {
        code: cmp.storsteGap.kategori.toUpperCase() as DataGolfKode,
        name: KAT_NAVN[cmp.storsteGap.kategori.toUpperCase() as DataGolfKode],
        gap: cmp.storsteGap.diff,
      }
    : null;

  return {
    harData: true,
    refNavn: siste.refPlayerName,
    refAar: siste.refYear,
    refTour: siste.refTour,
    sgTotalDeg: sg.sgTotal,
    sgTotalRef: ref?.sgTotal ?? null,
    gapTotal: cmp.diff.total ?? siste.sgDiffTotal,
    gapDelta,
    gapDeltaDir,
    antallSnapshots: sammenligninger.length,
    kategorier,
    trend: posisjoner,
    trendLabels,
    storsteGap,
    sisteDato: siste.createdAt.toISOString(),
  };
}

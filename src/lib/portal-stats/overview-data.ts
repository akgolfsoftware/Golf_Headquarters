/**
 * Data-loader for /portal/stats — Stats-oversikt (default-tab).
 *
 * Henter ekte data fra:
 *   - User.hcp            → HCP-KPI + Broadie-kontekst
 *   - Round               → runder/snitt/SG-fordeling (siste 90 d) + årets snitt-delta
 *   - BrukerSgInput        → SG-fordeling-fallback når runder mangler SG-felter
 *   - BrukerSammenligning  → HCP-trend (estHcp-snapshots over tid, ekte tidsserie)
 *
 * Alt er null-safe. Mangler data → null/tomt, ALDRI utdiktede tall.
 */

import { prisma } from "@/lib/prisma";
import { aggregateSg, type SgAggregate } from "@/lib/sg";

export type SgKategori = "ott" | "app" | "arg" | "putt";

export type HcpTrendPunkt = {
  /** Kort etikett, f.eks. "MAI" */
  label: string;
  hcp: number;
  /** ISO-dato for popover-detalj */
  dato: string;
};

export type SgFordelingRad = {
  key: SgKategori;
  label: string;
  full: string;
  /** SG-verdi per runde (snitt) — kan være negativ. null = ingen data. */
  verdi: number | null;
};

export type BroadieRad = {
  key: SgKategori;
  label: string;
  /** Andel av totalt SG-tap (0–100). */
  prosent: number;
};

export type StatsOverview = {
  harData: boolean;
  /** Nåværende handicap (User.hcp). */
  hcp: number | null;
  /** Endring i HCP siden første trend-punkt (negativ = forbedring). null hvis < 2 punkter. */
  hcpDeltaIAar: number | null;
  /** Aggregert SG fra runder siste 90 d. */
  sg: SgAggregate;
  /** Trend på SG total: siste vs forrige periode. null hvis utilstrekkelig data. */
  sgTotalDelta: number | null;
  /** Antall runder siste 90 d. */
  runderSiste90: number;
  /** Brutto snittscore siste 90 d. */
  snittSiste90: number | null;
  /** Endring i snittscore mot foregående 90 d (negativ = bedre). */
  snittDelta: number | null;
  /** HCP-trend-punkter (ekte estHcp-snapshots, ev. ett current-punkt). */
  hcpTrend: HcpTrendPunkt[];
  /** SG-fordeling siste 5 runder (eller siste SG-input). */
  sgFordeling: SgFordelingRad[];
  /** Broadie-estimat: HCP → forventet SG total. null hvis ingen HCP. */
  broadieEstSgTotal: number | null;
  /** Hvor du taper mest (prosent-fordeling av negativt SG). Tom hvis ingen data. */
  broadieTap: BroadieRad[];
  /** Antall registreringer totalt (for tomstate-skille). */
  totalRunder: number;
};

const KATEGORIER: { key: SgKategori; label: string; full: string }[] = [
  { key: "ott", label: "OTT", full: "Off the tee" },
  { key: "app", label: "APP", full: "Approach" },
  { key: "arg", label: "ARG", full: "Around the green" },
  { key: "putt", label: "PUTT", full: "Putting" },
];

const MND_KORT = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

function snittAv(verdier: number[]): number | null {
  if (verdier.length === 0) return null;
  return verdier.reduce((s, v) => s + v, 0) / verdier.length;
}

/**
 * Broadie-baseline: forventet SG total mot scratch gitt handicap.
 * Tommelfingerregel — ~−0,95 SG per HCP-slag (Broadie, "Every Shot Counts").
 */
function broadieEstSgTotal(hcp: number): number {
  return -(hcp * 0.95);
}

export async function hentStatsOverview(userId: string): Promise<StatsOverview> {
  const now = new Date();
  const dag90Siden = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const dag180_90 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [
    bruker,
    runderSiste90Rader,
    runderForrige90,
    sammenligninger,
    sisteSgInput,
    totalRunder,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
    // Full Round-rader. Antall begrenset av 90 d-vindu.
    prisma.round.findMany({
      where: { userId, playedAt: { gte: dag90Siden } },
      orderBy: { playedAt: "desc" },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: dag180_90, lt: dag90Siden } },
      select: { score: true, sgTotal: true },
    }),
    // Ekte HCP-tidsserie: estHcp-snapshots fra sammenligninger i år.
    prisma.brukerSammenligning.findMany({
      where: {
        userId,
        estHcp: { not: null },
        createdAt: { gte: new Date(now.getFullYear(), 0, 1) },
      },
      orderBy: { createdAt: "asc" },
      select: { estHcp: true, createdAt: true },
    }),
    prisma.brukerSgInput.findFirst({
      where: { userId },
      orderBy: { dato: "desc" },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sgTotal: true },
    }),
    prisma.round.count({ where: { userId } }),
  ]);

  const hcp = bruker?.hcp ?? null;
  const sg = aggregateSg(runderSiste90Rader);
  const runderSiste90 = runderSiste90Rader.length;
  const snittSiste90 = sg.snittScore;

  // Snittscore-delta mot foregående 90 d
  const snittForrige90 = snittAv(runderForrige90.map((r) => r.score));
  const snittDelta =
    snittSiste90 != null && snittForrige90 != null ? snittSiste90 - snittForrige90 : null;

  // SG total-delta: siste 90 d vs forrige 90 d
  const sgForrige90 = snittAv(
    runderForrige90.map((r) => r.sgTotal).filter((v): v is number => v != null),
  );
  const sgTotalDelta = sg.total != null && sgForrige90 != null ? sg.total - sgForrige90 : null;

  // HCP-trend fra estHcp-snapshots (ekte). Fallback: ett punkt fra current HCP.
  let hcpTrend: HcpTrendPunkt[] = sammenligninger
    .filter((s): s is { estHcp: number; createdAt: Date } => s.estHcp != null)
    .map((s) => ({
      label: MND_KORT[s.createdAt.getMonth()] ?? "",
      hcp: s.estHcp,
      dato: s.createdAt.toISOString(),
    }));
  if (hcpTrend.length === 0 && hcp != null) {
    hcpTrend = [{ label: MND_KORT[now.getMonth()] ?? "", hcp, dato: now.toISOString() }];
  }

  // HCP-delta i år: første trend-punkt vs nåværende (eller siste trend-punkt)
  const hcpNa = hcp ?? hcpTrend[hcpTrend.length - 1]?.hcp ?? null;
  const hcpStart = hcpTrend.length >= 2 ? hcpTrend[0].hcp : null;
  const hcpDeltaIAar = hcpNa != null && hcpStart != null ? hcpNa - hcpStart : null;

  // SG-fordeling: bruk runde-aggregat hvis tilgjengelig, ellers siste SG-input.
  const harRundeSg =
    sg.ott != null || sg.app != null || sg.arg != null || sg.putt != null;
  const sgFordeling: SgFordelingRad[] = KATEGORIER.map((k) => ({
    key: k.key,
    label: k.label,
    full: k.full,
    verdi: harRundeSg ? sg[k.key] : (sisteSgInput?.[`sg${cap(k.key)}` as keyof typeof sisteSgInput] as number | null ?? null),
  }));

  // Broadie: hvor du taper mest (kun negative SG-kategorier).
  const broadieEst = hcp != null ? broadieEstSgTotal(hcp) : null;
  const tapKilder = sgFordeling
    .filter((r) => r.verdi != null && r.verdi < 0)
    .map((r) => ({ key: r.key, label: r.label, tap: Math.abs(r.verdi as number) }));
  const tapSum = tapKilder.reduce((s, t) => s + t.tap, 0);
  const broadieTap: BroadieRad[] =
    tapSum > 0
      ? tapKilder
          .map((t) => ({ key: t.key, label: t.label, prosent: Math.round((t.tap / tapSum) * 100) }))
          .sort((a, b) => b.prosent - a.prosent)
      : [];

  const harData = runderSiste90 > 0 || totalRunder > 0 || hcpTrend.length > 0 || sisteSgInput != null;

  return {
    harData,
    hcp,
    hcpDeltaIAar,
    sg,
    sgTotalDelta,
    runderSiste90,
    snittSiste90,
    snittDelta,
    hcpTrend,
    sgFordeling,
    broadieEstSgTotal: broadieEst,
    broadieTap,
    totalRunder,
  };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

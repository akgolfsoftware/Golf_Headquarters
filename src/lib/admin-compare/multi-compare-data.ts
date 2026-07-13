/**
 * Data-loader for B10 Multi-spiller sammenligning (/admin/talent/sammenligning).
 *
 * Tre nivåer av sammenligning, alle på ekte Prisma-data:
 *   1. Side-om-side — 2-4 valgte spillere (?ids=), SG-kategorier + pyramide-
 *      fordeling + siste test, med "best per metrikk".
 *   2. Kohort-rangering — alle PLAYER rangert på siste SG-total mot null-linjen.
 *   3. Region-fordeling — spillere gruppert på region (talent) / hjemmeklubb.
 *
 * Referanse er PGA Tour-baseline = 0,0 per SG-kategori (kjent ekstern
 * standard for Strokes Gained — ikke oppdiktede spiller-tall). Mangler en
 * spiller SG-input vises tomt/«—», aldri en falsk verdi.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";

export type CompareAxis = "slag" | "tek" | "spill" | "turn" | "fys" | "sg";

/** En SG-metrikk i side-om-side-tabellen. */
export type CompareMetric = {
  key: string;
  axis: CompareAxis;
  label: string;
  sub: string;
  /** Enhet etter tallet (f.eks. "%"), null for rene SG-desimaler. */
  unit: string | null;
  /** Tour-baseline / referanseverdi (null = ingen referanse). */
  reference: number | null;
  referenceLabel: string;
  /** Høyere er bedre? (SG: ja). Styrer best-badge og delta-fortegn-farge. */
  higherIsBetter: boolean;
  /** Antall desimaler ved formatering. */
  decimals: number;
  /** Verdi per valgt spiller (samme rekkefølge som `players`), null = mangler. */
  values: (number | null)[];
};

export type ComparePlayer = {
  id: string;
  userId: string;
  name: string;
  initials: string;
  niva: string | null;
  klubb: string | null;
  hcp: number | null;
  /** Antall planlagte/gjennomførte økter per pyramide-akse. */
  pyramide: { axis: CompareAxis; label: string; count: number }[];
  pyramideTotal: number;
};

export type CohortRow = {
  userId: string;
  name: string;
  initials: string;
  klubb: string | null;
  niva: string | null;
  hcp: number | null;
  sgTotal: number | null;
  /** Er spilleren med i side-om-side-utvalget? */
  selected: boolean;
};

export type RegionRow = {
  region: string;
  count: number;
};

export type MultiCompareData = {
  /** Valgte spillere (?ids=), 0-4. */
  players: ComparePlayer[];
  metrics: CompareMetric[];
  /** Kort verdikt utledet av faktiske tall (eller null hvis < 2 valgt). */
  verdict: string | null;
  cohort: CohortRow[];
  cohortStats: { count: number; avg: number | null; best: number | null; worst: number | null };
  regions: RegionRow[];
  totalPlayers: number;
};

const PYR_LABEL: Record<string, { axis: CompareAxis; label: string }> = {
  FYS: { axis: "fys", label: "FYS" },
  TEK: { axis: "tek", label: "TEK" },
  SLAG: { axis: "slag", label: "SLAG" },
  SPILL: { axis: "spill", label: "SPILL" },
  TURN: { axis: "turn", label: "TURN" },
};
const PYR_ORDER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export async function loadMultiCompare(
  idsRaw: string[],
  viewer: { id: string; role: string },
): Promise<MultiCompareData> {
  const ids = idsRaw
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  // ── Valgte spillere (side-om-side) ─────────────────────────────
  const selected =
    ids.length > 0
      ? await prisma.user.findMany({
          where: { AND: [coachScopedPlayerWhere(viewer), { id: { in: ids } }] },
          select: {
            id: true,
            name: true,
            hcp: true,
            homeClub: true,
            talentTracking: { select: { niva: true, klubb: true, region: true } },
            sgInputs: {
              orderBy: { dato: "desc" },
              take: 1,
              select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
            },
            trainingPlans: {
              select: { sessions: { select: { pyramidArea: true } } },
            },
            testResults: {
              orderBy: { takenAt: "desc" },
              take: 1,
              select: { score: true, test: { select: { name: true, pyramidArea: true } } },
            },
          },
        })
      : [];

  // Bevar URL-rekkefølge
  const orderedUsers = ids
    .map((id) => selected.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const players: ComparePlayer[] = orderedUsers.map((u) => {
    const counts: Record<string, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    for (const plan of u.trainingPlans) {
      for (const s of plan.sessions) counts[s.pyramidArea] = (counts[s.pyramidArea] ?? 0) + 1;
    }
    const pyramide = PYR_ORDER.map((k) => ({
      axis: PYR_LABEL[k]!.axis,
      label: PYR_LABEL[k]!.label,
      count: counts[k] ?? 0,
    }));
    return {
      id: u.id,
      userId: u.id,
      name: u.name,
      initials: initials(u.name),
      niva: u.talentTracking?.niva ?? null,
      klubb: u.talentTracking?.klubb ?? u.homeClub ?? null,
      hcp: u.hcp,
      pyramide,
      pyramideTotal: pyramide.reduce((s, p) => s + p.count, 0),
    };
  });

  // SG-verdier per spiller (siste input)
  const sg = orderedUsers.map((u) => u.sgInputs[0] ?? null);
  const testLatest = orderedUsers.map((u) => u.testResults[0] ?? null);

  // ── Metrikk-rader (side-om-side) ───────────────────────────────
  // PGA Tour-baseline = 0,0 per SG-kategori (kjent ekstern referanse).
  const sgMetric = (
    key: string,
    axis: CompareAxis,
    label: string,
    sub: string,
    pick: (i: NonNullable<(typeof sg)[number]>) => number | null,
  ): CompareMetric => ({
    key,
    axis,
    label,
    sub,
    unit: null,
    reference: 0,
    referenceLabel: "TOUR-BASELINE",
    higherIsBetter: true,
    decimals: 2,
    values: sg.map((s) => (s ? pick(s) : null)),
  });

  const metrics: CompareMetric[] = [];
  if (players.length > 0) {
    metrics.push(
      sgMetric("sg_total", "sg", "SG Total", "per runde · vs Tour-baseline", (s) => s.sgTotal),
      sgMetric("sg_ott", "slag", "SG Off-the-tee", "drive line + carry", (s) => s.sgOtt),
      sgMetric("sg_app", "tek", "SG Approach", "innspill mot green", (s) => s.sgApp),
      sgMetric("sg_arg", "spill", "SG Around-green", "nærspill < 30 m", (s) => s.sgArg),
      sgMetric("sg_putt", "spill", "SG Putt", "alle putter · per runde", (s) => s.sgPutt),
    );
    // Siste test-score (ren verdi — referanse varierer per test, så ingen baseline)
    metrics.push({
      key: "test_latest",
      axis: "turn",
      label: "Siste test",
      sub: "nyeste resultat · score",
      unit: null,
      reference: null,
      referenceLabel: "VARIERER",
      higherIsBetter: true,
      decimals: 1,
      values: testLatest.map((t) => t?.score ?? null),
    });
  }

  // ── Verdikt (utledet, kun hvis >= 2 valgt og minst én har SG) ──
  let verdict: string | null = null;
  if (players.length >= 2) {
    const totals = sg.map((s) => s?.sgTotal ?? null);
    const withVal = totals
      .map((v, i) => ({ v, i }))
      .filter((x): x is { v: number; i: number } => x.v != null);
    if (withVal.length >= 1) {
      const leader = withVal.reduce((a, b) => (b.v > a.v ? b : a));
      const leadCount = metrics
        .filter((m) => m.higherIsBetter)
        .reduce((acc, m) => {
          const vals = m.values.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v != null);
          if (vals.length === 0) return acc;
          const top = vals.reduce((a, b) => (b.v > a.v ? b : a));
          return top.i === leader.i ? acc + 1 : acc;
        }, 0);
      const measured = metrics.filter((m) => m.values.some((v) => v != null)).length;
      verdict = `${firstName(players[leader.i]!.name)} leder ${leadCount} av ${measured} målte metrikker — høyest SG Total i utvalget.`;
    }
  }

  // ── Kohort-rangering (alle PLAYER på siste SG-total) ───────────
  const allPlayers = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: {
      id: true,
      name: true,
      hcp: true,
      homeClub: true,
      talentTracking: { select: { niva: true, klubb: true, region: true } },
      sgInputs: { orderBy: { dato: "desc" }, take: 1, select: { sgTotal: true } },
    },
  });

  const selectedIds = new Set(players.map((p) => p.userId));
  const cohort: CohortRow[] = allPlayers
    .map((u) => ({
      userId: u.id,
      name: u.name,
      initials: initials(u.name),
      klubb: u.talentTracking?.klubb ?? u.homeClub ?? null,
      niva: u.talentTracking?.niva ?? null,
      hcp: u.hcp,
      sgTotal: u.sgInputs[0]?.sgTotal ?? null,
      selected: selectedIds.has(u.id),
    }))
    .sort((a, b) => {
      // Spillere med SG øverst (sortert synkende), de uten verdi nederst.
      if (a.sgTotal == null && b.sgTotal == null) return a.name.localeCompare(b.name, "nb");
      if (a.sgTotal == null) return 1;
      if (b.sgTotal == null) return -1;
      return b.sgTotal - a.sgTotal;
    });

  const measured = cohort.map((c) => c.sgTotal).filter((v): v is number => v != null);
  const cohortStats = {
    count: cohort.length,
    avg: measured.length ? measured.reduce((s, v) => s + v, 0) / measured.length : null,
    best: measured.length ? Math.max(...measured) : null,
    worst: measured.length ? Math.min(...measured) : null,
  };

  // ── Region-fordeling (talent.region ?? hjemmeklubb) ────────────
  const regionMap = new Map<string, number>();
  for (const u of allPlayers) {
    const region = u.talentTracking?.region?.trim() || u.homeClub?.trim() || "Uten region";
    regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
  }
  const regions: RegionRow[] = [...regionMap.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region, "nb"));

  return {
    players,
    metrics,
    verdict,
    cohort,
    cohortStats,
    regions,
    totalPlayers: allPlayers.length,
  };
}

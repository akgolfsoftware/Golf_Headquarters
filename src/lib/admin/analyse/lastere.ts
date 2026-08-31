/**
 * Analyse (Innsikt) — datalastere (MASTERPLAN 15.8).
 *
 * `lastInnsiktHub` og `lastInnsiktStall` er flyttet ORDRETT hit fra de gamle
 * sidene `/admin/analyse/page.tsx` og `/admin/analyse/stall/page.tsx` — ingen
 * spørring eller formel er endret. `lastInnsiktSpillere` er ny (fane
 * «spiller», MASTERPLAN 15.8): en ren spillerliste, ingen SG-/analyse-motor —
 * per-spiller-innsikten selv bor uendret på `/admin/spillere/[id]/analyse`.
 *
 * Compliance-fanen bruker `loadComplianceData` fra
 * `@/lib/admin-compliance/compliance-data` direkte (ikke flyttet — allerede
 * en delt, gjenbrukbar loader).
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, ukenummer } from "@/lib/uke-helpers";
import type { InnsiktHubV2Data, InnsiktHubV2Kategori } from "@/components/admin/v2/InnsiktHubV2";
import type { InnsiktStallV2Data, InnsiktStallV2Kategori } from "@/components/admin/v2/InnsiktStallV2";

const DAG_MS = 86_400_000;

/** «+0,21» / «−0,38» med typografisk minus (fasit-format). */
function fmtSigned(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals).replace(".", ",");
  return `${n < 0 ? "−" : "+"}${s}`;
}

/* ── Fane «stall» (default) — InnsiktHubV2, uendret fra /admin/analyse ── */

const HUB_PERIODE_UKER = 8;
const HUB_KATEGORI_SKALA = 0.8;

function hubKategoriRad(key: string, label: string, verdi: number | null): InnsiktHubV2Kategori | null {
  if (verdi == null) return null;
  return {
    key,
    label,
    verdi: fmtSigned(verdi),
    pct: Math.round(Math.min(Math.abs(verdi), HUB_KATEGORI_SKALA) * (100 / HUB_KATEGORI_SKALA)),
    negativ: verdi < 0,
  };
}

export async function lastInnsiktHub(viewer: { id: string; role: string }): Promise<InnsiktHubV2Data> {
  const naa = new Date();
  const d8u = new Date(naa.getTime() - HUB_PERIODE_UKER * 7 * DAG_MS);
  const ukeStart = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);

  const spillere = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: { id: true },
  });
  const spillerIds = spillere.map((s) => s.id);

  const [sgAgg, okterDenneUken, oktetIDenneUken, trackmanOkter] = await Promise.all([
    prisma.round.aggregate({
      _avg: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      _count: { sgTotal: true },
      where: { userId: { in: spillerIds }, playedAt: { gte: d8u, lte: naa }, sgTotal: { not: null } },
    }),
    prisma.trainingPlanSession.count({
      where: {
        status: "COMPLETED",
        scheduledAt: { gte: ukeStart, lt: ukeSlutt },
        plan: { userId: { in: spillerIds } },
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        status: { not: "CANCELLED" },
        scheduledAt: { gte: ukeStart, lt: ukeSlutt },
        plan: { userId: { in: spillerIds } },
      },
      select: { plan: { select: { userId: true } } },
    }),
    prisma.trackManSession.count({
      where: { userId: { in: spillerIds }, recordedAt: { gte: d8u, lte: naa } },
    }),
  ]);

  const dekketIds = new Set(oktetIDenneUken.map((o) => o.plan.userId));
  const udekket = spillerIds.filter((id) => !dekketIds.has(id)).length;

  const kategorier = [
    hubKategoriRad("tee", "Tee", sgAgg._avg.sgOtt),
    hubKategoriRad("innspill", "Innspill", sgAgg._avg.sgApp),
    hubKategoriRad("rundt", "Rundt", sgAgg._avg.sgArg),
    hubKategoriRad("putt", "Putt", sgAgg._avg.sgPutt),
  ].filter((k): k is InnsiktHubV2Kategori => k != null);

  let lekkasjeTekst: string | null = null;
  if (kategorier.length === 4) {
    const svakest = [...kategorier].sort((a, b) => {
      const av = Number(a.verdi.replace("−", "-").replace(",", "."));
      const bv = Number(b.verdi.replace("−", "-").replace(",", "."));
      return av - bv;
    })[0];
    if (svakest.negativ) {
      lekkasjeTekst = `Lekkasje i stallen: ${svakest.label} er stallens svakeste kategori.`;
    }
  }

  return {
    nSpillere: spillerIds.length,
    periodeLabel: `siste ${HUB_PERIODE_UKER} uker`,
    sgSnitt: sgAgg._count.sgTotal > 0 && sgAgg._avg.sgTotal != null ? fmtSigned(sgAgg._avg.sgTotal) : "—",
    okterDenneUken,
    udekket,
    trackmanOkter,
    kategorier,
    harKategoriData: kategorier.length === 4,
    lekkasjeTekst,
  };
}

/* ── Fane «stall», nestet `?visning=trend` — InnsiktStallV2, uendret fra /admin/analyse/stall ── */

const TREND_UKER = 8;
const STALL_KATEGORI_UKER = 4;
const STALL_KATEGORI_SKALA = 0.8;

function stallKategoriRad(key: string, label: string, verdi: number | null): InnsiktStallV2Kategori | null {
  if (verdi == null) return null;
  return {
    key,
    label,
    verdi: fmtSigned(verdi),
    pct: Math.round(Math.min(Math.abs(verdi), STALL_KATEGORI_SKALA) * (100 / STALL_KATEGORI_SKALA)),
    negativ: verdi < 0,
  };
}

export async function lastInnsiktStall(viewer: { id: string; role: string }): Promise<InnsiktStallV2Data> {
  const naa = new Date();
  const ukeStart = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);
  const kategoriStart = new Date(naa.getTime() - STALL_KATEGORI_UKER * 7 * DAG_MS);
  const trendStart = new Date(naa.getTime() - TREND_UKER * 7 * DAG_MS);

  const spillere = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: { id: true },
  });
  const spillerIds = spillere.map((s) => s.id);

  const [sgUkeAgg, sgKategoriAgg, kategoriRunder, trendRunder] = await Promise.all([
    prisma.round.aggregate({
      _avg: { sgTotal: true },
      _count: { sgTotal: true },
      where: { userId: { in: spillerIds }, playedAt: { gte: ukeStart, lt: ukeSlutt }, sgTotal: { not: null } },
    }),
    prisma.round.aggregate({
      _avg: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      _count: { sgTotal: true },
      where: { userId: { in: spillerIds }, playedAt: { gte: kategoriStart, lte: naa }, sgTotal: { not: null } },
    }),
    prisma.round.findMany({
      where: { userId: { in: spillerIds }, playedAt: { gte: kategoriStart, lte: naa }, sgTotal: { not: null } },
      select: { userId: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    prisma.round.findMany({
      where: { userId: { in: spillerIds }, playedAt: { gte: trendStart, lte: naa }, sgTotal: { not: null } },
      select: { playedAt: true, sgTotal: true },
    }),
  ]);

  const kategorier = [
    stallKategoriRad("utslag", "Utslag", sgKategoriAgg._avg.sgOtt),
    stallKategoriRad("innspill", "Innspill", sgKategoriAgg._avg.sgApp),
    stallKategoriRad("naerspill", "Nærspill", sgKategoriAgg._avg.sgArg),
    stallKategoriRad("putt", "Putt", sgKategoriAgg._avg.sgPutt),
  ].filter((k): k is InnsiktStallV2Kategori => k != null);

  const KATEGORI_FELT: Record<string, "sgOtt" | "sgApp" | "sgArg" | "sgPutt"> = {
    utslag: "sgOtt",
    innspill: "sgApp",
    naerspill: "sgArg",
    putt: "sgPutt",
  };

  let innsiktTekst: string | null = null;
  if (kategorier.length === 4) {
    const svakest = [...kategorier].sort((a, b) => {
      const av = Number(a.verdi.replace("−", "-").replace(",", "."));
      const bv = Number(b.verdi.replace("−", "-").replace(",", "."));
      return av - bv;
    })[0];
    if (svakest.negativ) {
      const felt = KATEGORI_FELT[svakest.key];
      const perSpiller = new Map<string, number[]>();
      for (const r of kategoriRunder) {
        const verdi = r[felt];
        if (verdi == null) continue;
        const arr = perSpiller.get(r.userId) ?? [];
        arr.push(verdi);
        perSpiller.set(r.userId, arr);
      }
      const underNull = [...perSpiller.values()].filter((v) => v.reduce((s, x) => s + x, 0) / v.length < 0).length;
      innsiktTekst = `${svakest.label} er stallens svakeste kategori — ${underNull} av ${perSpiller.size} spillere ligger under null.`;
    }
  }

  // 8 ukentlige SG-snitt (eldst → nyest), Oslo-korrekt uke-inndeling.
  const ukeBoetter: number[][] = Array.from({ length: TREND_UKER }, () => []);
  for (const r of trendRunder) {
    if (r.sgTotal == null) continue;
    const diffMs = naa.getTime() - r.playedAt.getTime();
    const ukerSiden = Math.floor(diffMs / (7 * DAG_MS));
    const idx = TREND_UKER - 1 - ukerSiden;
    if (idx >= 0 && idx < TREND_UKER) ukeBoetter[idx].push(r.sgTotal);
  }
  const trend = ukeBoetter.map((b) => (b.length > 0 ? b.reduce((s, x) => s + x, 0) / b.length : null));
  const harTrend = trend.filter((v) => v != null).length >= 2;
  const trendUtfylt: number[] = [];
  if (harTrend) {
    let forrige = trend.find((v) => v != null) ?? 0;
    for (const v of trend) {
      forrige = v ?? forrige;
      trendUtfylt.push(forrige);
    }
  }

  return {
    ukenummer: ukenummer(naa),
    sgUke: sgUkeAgg._count.sgTotal > 0 && sgUkeAgg._avg.sgTotal != null ? fmtSigned(sgUkeAgg._avg.sgTotal) : "—",
    nSpillere: spillerIds.length,
    kategorier,
    harKategoriData: kategorier.length === 4,
    innsiktTekst,
    trend: trendUtfylt,
    harTrend,
  };
}

/* ── Fane «spiller» — ny (MASTERPLAN 15.8): ren liste, drilner til /admin/spillere/[id]/analyse ── */

export type InnsiktSpillerRad = {
  id: string;
  navn: string;
};

export async function lastInnsiktSpillere(viewer: { id: string; role: string }): Promise<InnsiktSpillerRad[]> {
  const spillere = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return spillere.map((s) => ({ id: s.id, navn: s.name ?? "Uten navn" }));
}

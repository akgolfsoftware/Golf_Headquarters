/**
 * AgencyOS Innsikt · stall — /admin/analyse/stall (T11, 27.08.2026).
 *
 * Fasit: `AG-12 Innsikt stall.dc.html`. Pushet fra AG-07 Innsikt-hub
 * («Stall-innsikt»-raden / «Åpne stall-innsikt»-CTA). `(legacy)/lag-snitt`
 * flettes inn her og redirecter til denne ruten (samme motor: Broadie-SG
 * per pyramide-kategori, tidligere per pyramide-akse).
 *
 * Auth: samme `requirePortalUser`-guard (ADMIN/COACH) + coach-scoping.
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, ukenummer } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnsiktStallV2, type InnsiktStallV2Data, type InnsiktStallV2Kategori } from "@/components/admin/v2/InnsiktStallV2";

export const dynamic = "force-dynamic";

const DAG_MS = 86_400_000;
const TREND_UKER = 8;
const KATEGORI_UKER = 4;
const KATEGORI_SKALA = 0.8;

function fmtSigned(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals).replace(".", ",");
  return `${n < 0 ? "−" : "+"}${s}`;
}

function kategoriRad(key: string, label: string, verdi: number | null): InnsiktStallV2Kategori | null {
  if (verdi == null) return null;
  return {
    key,
    label,
    verdi: fmtSigned(verdi),
    pct: Math.round(Math.min(Math.abs(verdi), KATEGORI_SKALA) * (100 / KATEGORI_SKALA)),
    negativ: verdi < 0,
  };
}

async function loadInnsiktStall(viewer: { id: string; role: string }): Promise<InnsiktStallV2Data> {
  const naa = new Date();
  const ukeStart = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);
  const kategoriStart = new Date(naa.getTime() - KATEGORI_UKER * 7 * DAG_MS);
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
    kategoriRad("utslag", "Utslag", sgKategoriAgg._avg.sgOtt),
    kategoriRad("innspill", "Innspill", sgKategoriAgg._avg.sgApp),
    kategoriRad("naerspill", "Nærspill", sgKategoriAgg._avg.sgArg),
    kategoriRad("putt", "Putt", sgKategoriAgg._avg.sgPutt),
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

export default async function InnsiktStallPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadInnsiktStall(user);
  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <InnsiktStallV2 data={data} />
    </V2Shell>
  );
}

/**
 * AgencyOS Innsikt-hub — /admin/analyse (T11, 27.08.2026).
 *
 * Fasit: `AG-07 Innsikt-hub.dc.html`. Erstatter den gamle v2-preview-siden
 * (AdminAnalyseV2, Paper T.*-tokens) med Train-lock-porten (InnsiktHubV2).
 * Auth uendret: samme `requirePortalUser`-guard (ADMIN/COACH), samme
 * coach-scoping via `coachScopedPlayerWhere`.
 *
 * Motor-skille: alle SG-tall her er Broadie-SG fra `Round` — aldri blandet
 * med DataGolf/TrackMan/PEI (se InnsiktHubV2 filhode).
 *
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnsiktHubV2, type InnsiktHubV2Data, type InnsiktHubV2Kategori } from "@/components/admin/v2/InnsiktHubV2";

export const dynamic = "force-dynamic";

const DAG_MS = 86_400_000;
const PERIODE_UKER = 8;
/** Skala for søylehøyde — typisk SG-kategori-spenn i stallen (§ dokumentert i InnsiktHubV2). */
const KATEGORI_SKALA = 0.8;

/** «+0,21» / «−0,38» med typografisk minus (fasit-format). */
function fmtSigned(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals).replace(".", ",");
  return `${n < 0 ? "−" : "+"}${s}`;
}

function kategoriRad(key: string, label: string, verdi: number | null): InnsiktHubV2Kategori | null {
  if (verdi == null) return null;
  return {
    key,
    label,
    verdi: fmtSigned(verdi),
    pct: Math.round(Math.min(Math.abs(verdi), KATEGORI_SKALA) * (100 / KATEGORI_SKALA)),
    negativ: verdi < 0,
  };
}

async function loadInnsiktHub(viewer: { id: string; role: string }): Promise<InnsiktHubV2Data> {
  const naa = new Date();
  const d8u = new Date(naa.getTime() - PERIODE_UKER * 7 * DAG_MS);
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
        scheduledAt: { gte: ukeStart, lte: ukeSlutt },
        plan: { userId: { in: spillerIds } },
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        status: { not: "CANCELLED" },
        scheduledAt: { gte: ukeStart, lte: ukeSlutt },
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
    kategoriRad("tee", "Tee", sgAgg._avg.sgOtt),
    kategoriRad("innspill", "Innspill", sgAgg._avg.sgApp),
    kategoriRad("rundt", "Rundt", sgAgg._avg.sgArg),
    kategoriRad("putt", "Putt", sgAgg._avg.sgPutt),
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
    periodeLabel: `siste ${PERIODE_UKER} uker`,
    sgSnitt: sgAgg._count.sgTotal > 0 && sgAgg._avg.sgTotal != null ? fmtSigned(sgAgg._avg.sgTotal) : "—",
    okterDenneUken,
    udekket,
    trackmanOkter,
    kategorier,
    harKategoriData: kategorier.length === 4,
    lekkasjeTekst,
  };
}

export default async function V2AdminAnalysePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadInnsiktHub(user);
  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <InnsiktHubV2 data={data} />
    </V2Shell>
  );
}

/**
 * v2-forhåndsvisning — AgencyOS Spiller-fremgang (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + dataloading følger den ekte skjermen
 * src/app/admin/spillere/[id]/fremgang/page.tsx: samme requirePortalUser-guard
 * (ADMIN/COACH), samme runde-/volum-/korrelasjons-loadere og samme ukesnitt-
 * aggregering. Siden har ingen [id] her, så vi henter en EKTE eksempel-spiller
 * fra coachens stall (den med flest SG-runder) — ærlig tom-tilstand hvis ingen.
 *
 * Server component.
 */

import type { SgCategory } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadStallen } from "@/lib/admin/stallen-data";
import { hentTreningsVolum } from "@/lib/training/volum";
import { beregnKorrelasjon } from "@/lib/training/korrelasjon";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { Kort, TomTilstand } from "@/components/v2";
import {
  AdminSpillerFremgangV2,
  type FremgangV2Data,
  type FremgangV2Omrade,
} from "@/components/admin/v2/AdminSpillerFremgangV2";

export const dynamic = "force-dynamic";

/** Norske områdenavn (ordbok: ARG = Nærspill). */
const OMRADE_NAVN: Record<SgCategory, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

/** ISO-ukenummer (identisk med den ekte skjermen). */
function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const year = d.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(uke).padStart(2, "0")}`;
}

const kortUke = (uke: string): string => uke.replace(/^\d{4}-/, "");

export default async function V2SpillerFremgangPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Finn en ekte eksempel-spiller: coachens stall → den med flest SG-runder.
  const stall = await loadStallen({ id: user.id, role: user.role }, {});
  const rosterIds = stall.rows.map((r) => r.id);

  let eksempelId: string | null = null;
  if (rosterIds.length > 0) {
    const grouped = await prisma.round.groupBy({
      by: ["userId"],
      where: { userId: { in: rosterIds }, sgTotal: { not: null } },
      _count: { _all: true },
    });
    if (grouped.length > 0) {
      grouped.sort((a, b) => b._count._all - a._count._all);
      eksempelId = grouped[0].userId;
    } else {
      eksempelId = rosterIds[0];
    }
  }

  if (!eksempelId) {
    return (
      <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
        <Kort>
          <TomTilstand icon="users" title="Ingen spiller å vise" sub="Ingen aktive spillere er koblet til deg ennå." />
        </Kort>
      </V2Shell>
    );
  }

  const spiller = await prisma.user.findUnique({ where: { id: eksempelId }, select: { id: true, name: true } });
  const navn = spiller?.name ?? stall.rows.find((r) => r.id === eksempelId)?.name ?? "Spiller";

  const UKER = 8;
  const grense = new Date();
  grense.setDate(grense.getDate() - UKER * 7);

  const [runder, treningsVolum, korrelasjon] = await Promise.all([
    prisma.round.findMany({
      where: { userId: eksempelId, playedAt: { gte: grense }, sgTotal: { not: null } },
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { playedAt: "asc" },
    }),
    hentTreningsVolum(eksempelId, UKER),
    beregnKorrelasjon(eksempelId, 16),
  ]);

  // Ukesnitt-SG per område (identisk aggregering med den ekte skjermen).
  const omraaderKoder: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
  const ukeMap = new Map<string, Map<SgCategory, { sum: number; count: number }>>();
  for (const r of runder) {
    const uke = isoUkeNummer(r.playedAt);
    if (!ukeMap.has(uke)) ukeMap.set(uke, new Map());
    const entry = ukeMap.get(uke)!;
    const sgVerdier: Record<SgCategory, number | null> = {
      OTT: r.sgOtt,
      APP: r.sgApp,
      ARG: r.sgArg,
      PUTT: r.sgPutt,
    };
    for (const a of omraaderKoder) {
      const sg = sgVerdier[a];
      if (sg == null) continue;
      const prev = entry.get(a) ?? { sum: 0, count: 0 };
      entry.set(a, { sum: prev.sum + sg, count: prev.count + 1 });
    }
  }
  const sorterteUker = Array.from(ukeMap.keys()).sort();
  const sgSerier: Record<SgCategory, { uke: string; snittSg: number }[]> = { OTT: [], APP: [], ARG: [], PUTT: [] };
  for (const uke of sorterteUker) {
    const entry = ukeMap.get(uke)!;
    for (const a of omraaderKoder) {
      const agg = entry.get(a);
      if (agg && agg.count > 0) sgSerier[a].push({ uke, snittSg: agg.sum / agg.count });
    }
  }

  const omrader: FremgangV2Omrade[] = omraaderKoder
    .map((a): FremgangV2Omrade | null => {
      const serie = sgSerier[a];
      if (serie.length === 0) return null;
      const vals = serie.map((s) => s.snittSg);
      return {
        kode: a,
        label: OMRADE_NAVN[a],
        serie: vals,
        ukeLabels: serie.map((s) => kortUke(s.uke)),
        siste: vals[vals.length - 1],
        trend: vals.length > 1 ? vals[vals.length - 1] - vals[vals.length - 2] : null,
      };
    })
    .filter((x): x is FremgangV2Omrade => x !== null);

  // Treningsvolum: ukestotal + fordeling per område.
  const ukerVolum = [...new Set(treningsVolum.map((t) => t.uke))].sort();
  const volumUker = ukerVolum.map((uke) => ({
    uke: kortUke(uke),
    total: treningsVolum.filter((t) => t.uke === uke).reduce((s, t) => s + t.minutter, 0),
  }));
  const volumOmrader = omraaderKoder
    .map((a) => ({
      kode: a,
      label: OMRADE_NAVN[a],
      minutter: treningsVolum.filter((t) => t.sgArea === a).reduce((s, t) => s + t.minutter, 0),
    }))
    .filter((v) => v.minutter > 0);
  const volumTotal = volumOmrader.reduce((s, v) => s + v.minutter, 0);

  const korr = korrelasjon.map((k) => ({
    kode: k.sgArea,
    label: OMRADE_NAVN[k.sgArea],
    r: k.r,
    datapunkter: k.datapunkter,
    tolkning: k.tolkning,
  }));

  const data: FremgangV2Data = {
    navn,
    uker: UKER,
    harRunder: runder.length > 0,
    omrader,
    volumUker,
    volumOmrader,
    volumTotal,
    korrelasjon: korr,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerFremgangV2 data={data} />
    </V2Shell>
  );
}

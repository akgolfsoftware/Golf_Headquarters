/**
 * AgencyOS — Spiller-fremgang (/admin/spillere/[id]/fremgang), v2-design
 * (retning C).
 *
 * Auth + dataloading gjenbrukt 1:1 fra den forrige (legacy) siden: samme
 * requirePortalUser-guard (ADMIN/COACH), samme runde-/volum-/korrelasjons-
 * loadere og samme ukesnitt-aggregering. Spiller-id kommer fra ruten
 * (params.id) — notFound() hvis spilleren ikke finnes.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import type { SgCategory } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentTreningsVolum } from "@/lib/training/volum";
import { beregnKorrelasjon } from "@/lib/training/korrelasjon";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
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

/** ISO-ukenummer (identisk med den forrige skjermen). */
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

export default async function SpillerFremgangPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const spiller = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!spiller) notFound();

  const UKER = 8;
  const grense = new Date();
  grense.setDate(grense.getDate() - UKER * 7);

  const [runder, treningsVolum, korrelasjon] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id, playedAt: { gte: grense }, sgTotal: { not: null } },
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { playedAt: "asc" },
    }),
    hentTreningsVolum(id, UKER),
    beregnKorrelasjon(id, 16),
  ]);

  // Ukesnitt-SG per område (identisk aggregering med den forrige skjermen).
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
    navn: spiller.name,
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

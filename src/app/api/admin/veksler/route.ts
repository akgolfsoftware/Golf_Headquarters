// Roster for spiller↔gruppe-veksleren i AgencyOS-toppraden (D2, bolk 5).
//
// Returnerer coachede spillere (I0-porten: coachScopedPlayerWhere — samme
// filter som /admin/spillere/[id]/workbench-rosteret) + alle grupper.
// Metalinjen følger design-fasiten `ui_kits/v2/agencyos-veksler.jsx`:
// spiller = «Kategori A · HCP +1,2», gruppe = «6 spillere».
//
// Kategori beregnes i bulk med SAMME prioritet som hentSpillerAkKategori
// (WAGR ngfCategory → sesong-snittscore → HCP-estimat) — men uten N+1:
// én groupBy over Round + én findMany over WagrSnapshot for hele rosteret.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { kategoriFraSnittscore, type AkKategori } from "@/lib/domain/ak-kategori";
import { ngfKategoriTilAk } from "@/lib/domain/spiller-kategori";
import type { NgfKategori } from "@/generated/prisma/client";
import { avgScoreFromHcp } from "@/lib/stats/sg-estimator";

export const runtime = "nodejs";

export type VekslerValg = {
  id: string;
  navn: string;
  meta: string;
  avatarUrl: string | null;
};

export type VekslerResponse = {
  spillere: VekslerValg[];
  grupper: VekslerValg[];
};

/** Handicap → visningsstreng: +1,2 (plusshcp) / 2,1 / — (speil av stallen-data.fmtHcp). */
function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

/** WAGR → sesongsnitt → HCP-estimat, ellers null (ærlig tomrom, aldri fabrikkert). */
function utledKategori(
  wagrNgf: string | null | undefined,
  snitt: number | null | undefined,
  hcp: number | null,
): AkKategori | null {
  const fraWagr = wagrNgf?.trim().toUpperCase();
  if (fraWagr && /^[A-KL]$/.test(fraWagr)) return ngfKategoriTilAk(fraWagr as NgfKategori);
  if (snitt != null) return kategoriFraSnittscore(snitt).kategori;
  if (hcp != null) return kategoriFraSnittscore(avgScoreFromHcp(hcp)).kategori;
  return null;
}

export async function GET() {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [players, groups] = await Promise.all([
    prisma.user.findMany({
      // I0 + myk-sletting: samme AND-mønster som workbench-rosteret.
      where: { AND: [coachScopedPlayerWhere(coach), { deletedAt: null }] },
      select: { id: true, name: true, avatarUrl: true, hcp: true },
      orderBy: { name: "asc" },
      take: 400,
    }),
    prisma.group.findMany({
      select: { id: true, name: true, _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const ids = players.map((p) => p.id);
  const sesongStart = new Date(new Date().getFullYear(), 0, 1);
  const [snittRows, wagrRows] = ids.length
    ? await Promise.all([
        prisma.round.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, playedAt: { gte: sesongStart } },
          _avg: { score: true },
        }),
        prisma.wagrSnapshot.findMany({
          where: { userId: { in: ids } },
          select: { userId: true, ngfCategory: true },
        }),
      ])
    : [[], []];

  const snittAvId = new Map(snittRows.map((r) => [r.userId, r._avg.score]));
  const wagrAvId = new Map(wagrRows.map((r) => [r.userId, r.ngfCategory]));

  const spillere: VekslerValg[] = players.map((p) => {
    const kategori = utledKategori(wagrAvId.get(p.id), snittAvId.get(p.id), p.hcp);
    const deler = [
      kategori ? `Kategori ${kategori}` : null,
      p.hcp != null ? `HCP ${fmtHcp(p.hcp)}` : null,
    ].filter(Boolean);
    return {
      id: p.id,
      navn: p.name,
      meta: deler.length > 0 ? deler.join(" · ") : "—",
      avatarUrl: p.avatarUrl,
    };
  });

  const grupper: VekslerValg[] = groups.map((g) => ({
    id: g.id,
    navn: g.name,
    meta: g._count.members === 1 ? "1 spiller" : `${g._count.members} spillere`,
    avatarUrl: null,
  }));

  const response: VekslerResponse = { spillere, grupper };
  return NextResponse.json(response);
}

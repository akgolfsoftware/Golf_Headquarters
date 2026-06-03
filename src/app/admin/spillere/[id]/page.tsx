/**
 * CoachHQ — Spiller-detalj (`/admin/spillere/[id]`) — v10-design.
 *
 * Rendrer <SpillerDetalj> (v10-fasit fra ag-spiller) med EKTE data:
 *   - Identitet (navn/HCP/gruppe/tier/coach) fra User + aktiv enrolling.
 *   - KPI 30 d, mini-pyramide vs plan, uke-oversikt, neste booking og siste
 *     kommunikasjon fra loadSpillerDetaljOversikt (Prisma).
 * mapSpillerDetalj oversetter loader-output → SpillerDetaljData. Tom-tilstander
 * bevares (booking=null, comms=[], pyramid=[]) — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["COACH","ADMIN"] }).
 *
 * Bolk (3. juni): byttet fra DetailShell + SpillerDetaljOversikt (eldre design)
 * til v10 SpillerDetalj.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSpillerDetaljOversikt } from "@/lib/admin-spiller/spiller-detalj-data";
import { SpillerDetalj } from "@/components/admin/spiller-detalj/spiller-detalj";
import { mapSpillerDetalj, type SpillerIdent } from "./map-spiller-detalj";

export const dynamic = "force-dynamic";

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function tierLabel(t: string): string {
  if (t === "PRO") return "PRO";
  if (t === "ELITE") return "ELITE";
  return "GRATIS";
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function SpillerCoachView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      hcp: true,
      tier: true,
      homeClub: true,
      enrollmentsAsPlayer: {
        where: { endedAt: null },
        orderBy: { enrolledAt: "desc" },
        take: 1,
        include: { coach: { select: { name: true } } },
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const oversikt = await loadSpillerDetaljOversikt(player.id);

  const ident: SpillerIdent = {
    id: player.id,
    name: player.name,
    initials: initialsFrom(player.name),
    hcp: formatHcp(player.hcp),
    group: player.homeClub ?? "",
    tierLabel: tierLabel(player.tier),
    coachName: player.enrollmentsAsPlayer[0]?.coach?.name ?? "",
  };

  return <SpillerDetalj data={mapSpillerDetalj(ident, oversikt)} />;
}

/**
 * v2-forhåndsvisning — AgencyOS Plan-maler (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den ekte siden
 * (src/app/admin/plan-templates/page.tsx): samme requirePortalUser-guard
 * (ADMIN/COACH) og samme PlanTemplate-spørring (mest brukt → navn), med
 * usageCount og økt-antall (_count.sessions).
 *
 * Akse-fordeling: disciplinFordeling er en Json-kolonne — validert med zod
 * (safeParse) før visning, aldri `as`-castet. Ugyldig/ manglende blob → ærlig
 * tom fordeling på det kortet.
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminPlanMalerV2,
  type AdminPlanMalerData,
  type PlanMalFordeling,
} from "@/components/admin/v2/AdminPlanMalerV2";
import type { AkseKey } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

// Pyramide-rekkefølge topp→base (TURN øverst, FYS i bunn).
const AKSE_ORDEN: AkseKey[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

// disciplinFordeling: { FYS: 0.15, TEK: 0.25, ... } — andeler (0–1).
const FordelingSchema = z.record(z.string(), z.number());

function tilFordeling(blob: unknown): PlanMalFordeling[] {
  const parsed = FordelingSchema.safeParse(blob);
  if (!parsed.success) return [];
  return AKSE_ORDEN.flatMap((akse) => {
    const andel = parsed.data[akse];
    if (typeof andel !== "number" || !Number.isFinite(andel)) return [];
    return [{ akse, value: Math.round(andel * 100) }];
  });
}

export default async function V2AdminPlanMalerPreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Samme select-kontrakt + sortering som den ekte plan-maler-indeksen.
  const rader = await prisma.planTemplate.findMany({
    orderBy: [{ usageCount: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kategori: true,
      lPhase: true,
      varighetUker: true,
      ukentligOktAntall: true,
      usageCount: true,
      disciplinFordeling: true,
      _count: { select: { sessions: true } },
    },
  });

  const data: AdminPlanMalerData = {
    maler: rader.map((m) => ({
      id: m.id,
      navn: m.name,
      kategori: m.kategori,
      fase: m.lPhase,
      varighetUker: m.varighetUker,
      ukentligOktAntall: m.ukentligOktAntall,
      usageCount: m.usageCount,
      oktAntall: m._count.sessions,
      fordeling: tilFordeling(m.disciplinFordeling),
    })),
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminPlanMalerV2 data={data} />
    </V2Shell>
  );
}

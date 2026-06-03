/**
 * PlayerHQ · Trening · Årsplan (`/portal/tren/aarsplan`) — v10-design.
 *
 * Rendrer <Aarsplan> (v10-fasit fra pl-aarsplan, public/design-handover/
 * _screens/pl-aarsplan.png) med EKTE data fra Prisma (seasonPlan +
 * periodBlocks). mapAarsplanData oversetter seasonPlan-shapen til
 * AarsplanData. Tom-tilstand (faser: []) bevares når ingen sesongplan
 * finnes for året — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout)
 * eier sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 *
 * Bolk (3. juni): byttet fra AarsplanGantt/AarsplanInteraktiv (eldre design)
 * til v10-komponenten <Aarsplan>.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  Aarsplan,
  type AarsplanData,
  type Fase,
  type PyramideAkse,
} from "@/components/portal/aarsplan/aarsplan";
import type { LPhase } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

// GRUNN→FYS (forest), SPESIAL→TEK (gull), TURNERING→TURN (rød) —
// faser farget per pyramide-akse i v10-komponenten.
const LPHASE_TIL_AKSE: Record<LPhase, PyramideAkse> = {
  GRUNN: "FYS",
  SPESIAL: "TEK",
  TURNERING: "TURN",
};

const LPHASE_NAVN: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
};

/** Måned 1–12 fra Date (lokal). */
function maned(d: Date): number {
  return d.getMonth() + 1;
}

export default async function AarsplanPage() {
  const user = await requirePortalUser();

  const ar = new Date().getFullYear();

  const sesongplan = await prisma.seasonPlan.findFirst({
    where: { userId: user.id, year: ar },
    include: {
      periodBlocks: { orderBy: { startDate: "asc" } },
    },
  });

  // periodBlocks → faser. Tom array = tom-tilstand (fasiten).
  const faser: Fase[] = (sesongplan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    akse: LPHASE_TIL_AKSE[b.lPhase],
    navn: LPHASE_NAVN[b.lPhase],
    fraManed: maned(b.startDate),
    tilManed: maned(b.endDate),
  }));

  const data: AarsplanData = {
    aar: ar,
    fornavn: user.name.split(" ")[0],
    faser,
    hrefs: {
      opprett: "/portal/planlegge/workbench",
      faseBase: "/portal/tren/aarsplan/periode",
    },
  };

  return <Aarsplan data={data} />;
}

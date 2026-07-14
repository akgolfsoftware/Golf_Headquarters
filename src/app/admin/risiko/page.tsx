/**
 * AgencyOS — Risiko / stall-kart (`/admin/risiko`), v2.
 * Port av `(legacy)/risiko/page.tsx` (2026-07-14, AgencyOS Bølge 3.17) —
 * risiko-logikken (SKADET/permisjon/dager-siden-økt) er 100% uendret, ny
 * v2-presentasjon i `AdminRisikoV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminRisikoV2, type RisikoNivaaV2, type SpillerRisikoV2 } from "@/components/admin/v2/AdminRisikoV2";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function aarsak(skadet: boolean, harAktivPermisjon: boolean, dagerSidenOkt: number | null, harAktivPlan: boolean): string {
  if (skadet) return "Skade registrert";
  if (harAktivPermisjon) return "Aktiv permisjon";
  if (dagerSidenOkt !== null && dagerSidenOkt > 7 && harAktivPlan) return `${dagerSidenOkt} dg siden økt · under plan`;
  if (dagerSidenOkt !== null && dagerSidenOkt > 3 && harAktivPlan) return `${dagerSidenOkt} dg siden økt · aktiv plan`;
  if (dagerSidenOkt === null) return "Ingen økt registrert";
  return `${dagerSidenOkt} dg siden siste økt`;
}

export default async function RisikoPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const naa = new Date();
  const d30 = new Date(naa.getTime() - 30 * 86_400_000);

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER", deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      userStatus: true,
      leaves: {
        where: { OR: [{ endAt: null }, { endAt: { gt: naa } }], returnedAt: null },
        select: { reason: true, isInjury: true },
        take: 1,
      },
      trainingPlans: {
        where: { status: { in: ["ACTIVE", "ACCEPTED"] } },
        select: { id: true },
        take: 1,
      },
    },
  });

  const spillerIds = spillere.map((s) => s.id);

  const sisteLogger = await prisma.trainingPlanSessionLog.findMany({
    where: { completedAt: { gte: d30 }, session: { plan: { userId: { in: spillerIds } } } },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true, session: { select: { plan: { select: { userId: true } } } } },
  });

  const sisteOktMap = new Map<string, Date | null>();
  for (const l of sisteLogger) {
    const uid = l.session.plan.userId;
    if (!sisteOktMap.has(uid)) sisteOktMap.set(uid, l.completedAt);
  }

  const risikoData: SpillerRisikoV2[] = spillere.map((s) => {
    const skadet = s.userStatus === "SKADET";
    const harAktivPermisjon = s.leaves.length > 0 && !s.leaves[0].isInjury;
    const harAktivPlan = s.trainingPlans.length > 0;
    const sisteOkt = sisteOktMap.get(s.id);
    const dagerSidenOkt = sisteOkt ? Math.floor((naa.getTime() - sisteOkt.getTime()) / 86_400_000) : null;

    let nivaa: RisikoNivaaV2 = 0;
    if (skadet || (s.leaves.length > 0 && s.leaves[0].isInjury)) {
      nivaa = 4;
    } else if (harAktivPermisjon) {
      nivaa = 4;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 7 && harAktivPlan) {
      nivaa = 3;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 3 && harAktivPlan) {
      nivaa = 2;
    } else if (dagerSidenOkt === null && harAktivPlan) {
      nivaa = 1;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 14) {
      nivaa = 1;
    }

    return {
      id: s.id,
      navn: s.name,
      init: initials(s.name),
      nivaa,
      aarsak: aarsak(skadet, harAktivPermisjon, dagerSidenOkt, harAktivPlan),
    };
  });

  risikoData.sort((a, b) => b.nivaa - a.nivaa);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminRisikoV2
        risikoData={risikoData}
        datoTekst={naa.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
      />
    </V2Shell>
  );
}

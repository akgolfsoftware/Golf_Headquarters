/**
 * v2-forhåndsvisning — AgencyOS Treningsplaner (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/admin/plans/page.tsx): samme requirePortalUser-guard (ADMIN/COACH),
 * samme TrainingPlan-spørring, samme template-placeholder-filter, samme
 * fase-bucketing og meta-tekster, og samme Workbench-mål for «Ny plan».
 *
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ukenummer } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminPlansV2,
  type AdminPlansData,
  type AdminPlanKort,
  type PlanFase,
} from "@/components/admin/v2/AdminPlansV2";

export const dynamic = "force-dynamic";

/** Systembruker som eier FYS-malenes bakende-planer — aldri vis i stallen. */
const TEMPLATE_PLACEHOLDER_USER_ID = "template-placeholder";

const TALLORD = [
  "Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni",
  "Ti", "Elleve", "Tolv",
];

function kortDato(d: Date): string {
  return d
    .toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
    .replace(/\.$/, "");
}

export default async function V2AdminPlansPreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [plans, dagensOkt] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: { userId: { not: TEMPLATE_PLACEHOLDER_USER_ID } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        user: { select: { id: true, name: true, role: true } },
        sessions: { select: { status: true } },
      },
      take: 100,
    }),
    // «Ny plan» → Workbench for spilleren med dagens økt (fasit-beslutning).
    prisma.trainingPlanSession.findFirst({
      where: {
        scheduledAt: { gte: dagStart, lt: dagSlutt },
        plan: {
          status: "ACTIVE",
          userId: { not: TEMPLATE_PLACEHOLDER_USER_ID },
          user: coachScopedPlayerWhere(user),
        },
      },
      orderBy: { scheduledAt: "asc" },
      select: { plan: { select: { userId: true } } },
    }),
  ]);

  // Fase-bucketing: Fullført = arkivert/utløpt · Aktiv = i drift · Utkast = resten.
  const fase = (p: (typeof plans)[number]): PlanFase => {
    if (p.status === "ARCHIVED" || (p.endDate && p.endDate.getTime() < now.getTime())) {
      return "fullfort";
    }
    if (p.status === "ACTIVE" || p.status === "ACCEPTED") return "aktiv";
    return "utkast";
  };

  const tilKort = (p: (typeof plans)[number]): AdminPlanKort => {
    const total = p.sessions.length;
    const ferdig = p.sessions.filter((s) => s.status === "COMPLETED").length;
    const pct = total > 0 ? Math.round((ferdig / total) * 100) : 0;
    const ukeFra = ukenummer(p.startDate);

    let meta: string;
    switch (fase(p)) {
      case "aktiv":
        meta = p.endDate
          ? `${pct} % · uke ${ukeFra}–${ukenummer(p.endDate)}`
          : `${pct} % · fra uke ${ukeFra}`;
        break;
      case "fullfort":
        meta = p.endDate ? `Avsluttet ${kortDato(p.endDate)}` : "Arkivert";
        break;
      default:
        meta =
          p.status === "PENDING_PLAYER"
            ? "Venter godkjenning"
            : p.status === "REJECTED"
              ? "Spiller ba om endring"
              : p.status === "PAUSED"
                ? "På pause"
                : total > 0
                  ? `${total} økter · fra uke ${ukeFra}`
                  : `Utkast · fra uke ${ukeFra}`;
    }
    return { id: p.id, navn: p.name, spiller: p.user.name, meta, fase: fase(p) };
  };

  const kort = plans.map(tilKort);

  // Workbench-mål: dagens økt → første aktive spillerplan → første plan.
  const aktivSpillerPlan = plans.find(
    (p) => fase(p) === "aktiv" && p.user.role === "PLAYER",
  );
  const workbenchUserId =
    dagensOkt?.plan.userId ?? aktivSpillerPlan?.user.id ?? plans[0]?.user.id ?? null;
  const nyPlanHref = workbenchUserId
    ? `/admin/spillere/${workbenchUserId}/workbench`
    : "/admin/spillere";

  const antall = plans.length;
  const tittel =
    antall < TALLORD.length ? `${TALLORD[antall]} planer` : `${antall} planer`;

  const data: AdminPlansData = {
    tittel,
    antall,
    utkast: kort.filter((k) => k.fase === "utkast").length,
    aktive: kort.filter((k) => k.fase === "aktiv").length,
    fullfort: kort.filter((k) => k.fase === "fullfort").length,
    nyPlanHref,
    kort,
  };

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/planlegge">Planlegge</TilbakeLenke>
      <AdminPlansV2 data={data} />
    </V2Shell>
  );
}

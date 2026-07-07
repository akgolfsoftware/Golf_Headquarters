/**
 * PlayerHQ · Tren · Årsplan · Ny periode
 *
 * Søsterrute til `/periode/[id]/rediger` — samme skjema, ingen id i url.
 * `seasonPlanId` tas fra `?seasonPlanId=`, ellers brukerens nyeste sesongplan.
 */
import { Calendar } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { PeriodeForm } from "../periode-form";

export default async function NyPeriodePage({
  searchParams,
}: {
  searchParams: Promise<{ seasonPlanId?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { seasonPlanId: seasonPlanIdParam } = await searchParams;
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const seasonPlan = seasonPlanIdParam
    ? await prisma.seasonPlan.findUnique({
        where: { id: seasonPlanIdParam },
        select: { id: true, userId: true },
      })
    : await prisma.seasonPlan.findFirst({
        where: { userId: user.id },
        orderBy: { year: "desc" },
        select: { id: true, userId: true },
      });

  const harTilgang = seasonPlan && (isCoach || seasonPlan.userId === user.id);

  if (!harTilgang) {
    return (
      <div className="space-y-8 pb-32">
        <PageHeader eyebrow="PlayerHQ · Tren · Årsplan" titleLead="Ny" titleItalic="periode" />
        <EmptyState
          icon={Calendar}
          titleItalic="Ingen sesongplan"
          titleTrail="funnet"
          sub="Du trenger en sesongplan før du kan legge til perioder. Opprett en årsplan først."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <PageHeader eyebrow="PlayerHQ · Tren · Årsplan" titleLead="Ny" titleItalic="periode" />
      <PeriodeForm mode="ny" seasonPlanId={seasonPlan.id} />
    </div>
  );
}

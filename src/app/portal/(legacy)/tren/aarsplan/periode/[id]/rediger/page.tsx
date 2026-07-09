/**
 * PlayerHQ · Tren · Årsplan · Rediger periode
 *
 * Migrert fra public/design/batch3/arsplan-periode-rediger.html.
 * Lar coach/spiller justere én periodeblokk: meta, fokus, intensitet, vedlegg.
 */
import { Calendar } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { PeriodeForm } from "../../periode-form";

export default async function PeriodeRedigerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { id } = await params;

  const periodeRaw = await prisma.periodBlock.findUnique({
    where: { id },
    include: { seasonPlan: { select: { userId: true, name: true } } },
  });

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const periode =
    periodeRaw && (isCoach || periodeRaw.seasonPlan.userId === user.id) ? periodeRaw : null;

  if (!periode) {
    return (
      <div className="space-y-8 pb-32">
        <PageHeader
          eyebrow="PlayerHQ · Tren · Årsplan"
          titleLead="Rediger"
          titleItalic="periode"
        />
        <EmptyState
          icon={Calendar}
          titleItalic="Periode"
          titleTrail="ble ikke funnet"
          sub="Perioden er enten slettet eller du har ikke tilgang til den."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <PageHeader
        eyebrow="PlayerHQ · Tren · Årsplan"
        titleLead="Rediger"
        titleItalic="periode"
        actions={
          <span className="rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Periode-ID <strong className="text-foreground">{id.slice(0, 12)}</strong>
          </span>
        }
      />
      <PeriodeForm
        mode="rediger"
        periodeId={id}
        initial={{
          focus: periode.focus,
          notes: periode.notes,
          startDate: periode.startDate.toISOString().slice(0, 10),
          endDate: periode.endDate.toISOString().slice(0, 10),
          lPhase: periode.lPhase,
          weeklyVolMin: periode.weeklyVolMin,
          weeklyVolMax: periode.weeklyVolMax,
        }}
      />
    </div>
  );
}

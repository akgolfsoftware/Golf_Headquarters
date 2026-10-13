/**
 * AgencyOS Gruppe-årsplan — samme kalenderkjerne (hentGruppeKalenderData +
 * GruppeKalenderWrapper) som den offentlige /team-wang-siden, koblet inn i
 * gruppeplanleggingen. Skole/samling/kompetansemål-innhold er identisk mellom
 * flatene — ingen personlig spillerdata her heller.
 */

import { Sidehode, KnappLenke } from "@/components/precision/pa";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { gruppeInnsynWhere } from "@/lib/workbench/group-scope";
import { GroupContextShell } from "@/components/admin/precision/grupper/GroupContextShell";
import { TlTilbake } from "@/components/admin/precision/grupper/group-kit";
import { GruppeFaner } from "@/components/admin/v2/GruppeFaner";
import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import { GruppeKalenderWrapper } from "@/components/gruppe-kalender/gruppe-kalender-wrapper";
import { TrinnFilter } from "@/components/gruppe-kalender/trinn-filter";
import { TurneringPlan } from "@/components/gruppe-kalender/turnering-plan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Årsplan · Grupper · AgencyOS" };

export default async function GruppeArsplanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trinn?: string }>;
}) {
  // G6: årsplan-flaten er lesevisning av gruppeplanen → VIEW_GROUP_PLANS.
  const user = await requireCapability(Capability.VIEW_GROUP_PLANS);
  const { id } = await params;
  const { trinn } = await searchParams;

  const gruppe = await prisma.group.findFirst({ where: { id, ...gruppeInnsynWhere(user) }, select: { id: true, name: true, slug: true, program: true } });
  if (!gruppe) notFound();

  const data = await hentGruppeKalenderData(gruppe.name);
  const basePath = `/admin/grupper/${id}/arsplan`;

  return (
    <GroupContextShell group={gruppe} user={user}>
      <TlTilbake href={`/admin/grupper/${id}`}>Gruppe</TlTilbake>

      <div className="flex flex-col gap-4">
        <GruppeFaner groupId={id} aktiv="arsplan" />

        <Sidehode title="Årsplan" kicker={gruppe.name} />
        <KnappLenke variant="secondary" href={`${basePath}/skoledata`}>Legg inn skoledata</KnappLenke>

        {data ? (
          <div className="space-y-4">
            <TrinnFilter basePath={basePath} aktivtTrinn={trinn ?? null} />
            <GruppeKalenderWrapper data={data} classYear={trinn ?? null} />
            <TurneringPlan turneringer={data.turneringer} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fant ingen kalenderdata for «{gruppe.name}» — gruppen mangler faste treningstider/perioder i systemet.
          </p>
        )}
      </div>
    </GroupContextShell>
  );
}

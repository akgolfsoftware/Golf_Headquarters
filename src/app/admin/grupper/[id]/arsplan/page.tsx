/**
 * AgencyOS Gruppe-årsplan — samme kalenderkjerne (hentGruppeKalenderData +
 * GruppeKalenderWrapper) som den offentlige /team-wang-siden, koblet inn i
 * gruppeplanleggingen. Skole/samling/kompetansemål-innhold er identisk mellom
 * flatene — ingen personlig spillerdata her heller.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
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

  const gruppe = await prisma.group.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!gruppe) notFound();

  const data = await hentGruppeKalenderData(gruppe.name);
  const basePath = `/admin/grupper/${id}/arsplan`;

  return (
    <V2Shell bredde="kolonne" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TlTilbake href={`/admin/grupper/${id}`}>Gruppe</TlTilbake>

      <div className="flex flex-col gap-4">
        <GruppeFaner groupId={id} aktiv="arsplan" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {gruppe.name}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Årsplan</h1>
          </div>
          <Link href={`${basePath}/skoledata`} className="font-mono text-[11px] font-semibold text-primary hover:underline">
            Legg inn skoledata →
          </Link>
        </div>

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
    </V2Shell>
  );
}

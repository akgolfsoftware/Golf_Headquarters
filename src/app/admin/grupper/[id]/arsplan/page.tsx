/**
 * AgencyOS Gruppe-årsplan — samme kalenderkjerne (hentGruppeKalenderData +
 * GruppeKalenderWrapper) som den offentlige /team-wang-siden, koblet inn i
 * gruppeplanleggingen. Skole/samling/kompetansemål-innhold er identisk mellom
 * flatene — ingen personlig spillerdata her heller.
 *
 * 19.10.2026: i AgencyOSSkall med sidehodet fra nytt design (som Skoledata),
 * i stedet for V2Shell og GruppeFaner fra det gamle designet.
 */

import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { gruppeInnsynWhere } from "@/lib/workbench/group-scope";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
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

  const gruppe = await prisma.group.findFirst({ where: { id, ...gruppeInnsynWhere(user) }, select: { id: true, name: true } });
  if (!gruppe) notFound();

  const data = await hentGruppeKalenderData(gruppe.name);
  const basePath = `/admin/grupper/${id}/arsplan`;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: `/admin/grupper/${id}`, tekst: "Gruppa" }} dato={`${gruppe.name} · årsplan`} tittel="Årsplan"
          handlinger={<KnappLenke href={`${basePath}/skoledata`}>Legg inn skoledata</KnappLenke>} />
        {data ? (
          <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
            <TrinnFilter basePath={basePath} aktivtTrinn={trinn ?? null} />
            <GruppeKalenderWrapper data={data} classYear={trinn ?? null} />
            <TurneringPlan turneringer={data.turneringer} />
          </div>
        ) : (
          <Tom tittel="Ingen kalenderdata" tekst={`«${gruppe.name}» mangler faste treningstider eller perioder i systemet.`}
            handling={<KnappLenke href={`/admin/grupper/${id}/timeplan`}>Legg inn faste tider</KnappLenke>} />
        )}
      </div>
    </AgencyOSSkall>
  );
}

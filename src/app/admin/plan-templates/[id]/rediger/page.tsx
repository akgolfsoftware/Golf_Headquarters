/**
 * AgencyOS — Plan-mal-editor (/admin/plan-templates/[id]/rediger) i Precision
 * Athletics, under Plan-hub (AG-14). Auth-guard, Prisma-spørringer og server
 * actions (inkl. masseredigering) er uendret; visningen er AG14MalRediger i
 * AgencyOSSkall. Volum-beregningen bor fortsatt i src/lib/plan-templates/.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG14MalRediger, type RedigerDrillValg, type RedigerMal, type RedigerOkt } from "@/components/admin/precision/AG14MalRediger";
import {
  readDrills,
  readFordeling,
} from "@/components/admin/plan-templates/shared";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function PlanTemplateEditorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [template, drillDefs] = await Promise.all([
    prisma.planTemplate.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: [{ ukeNr: "asc" }, { dagNr: "asc" }] },
      },
    }),
    prisma.exerciseDefinition.findMany({
      orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        pyramidArea: true,
        skillArea: true,
      },
    }),
  ]);

  if (!template) notFound();

  const sessions: RedigerOkt[] = template.sessions.map((s) => ({
    id: s.id,
    ukeNr: s.ukeNr,
    dagNr: s.dagNr,
    title: s.title,
    varighetMin: s.varighetMin,
    pyramidArea: s.pyramidArea,
    skillArea: s.skillArea,
    environment: s.environment,
    focus: s.focus,
    notes: s.notes,
    drills: readDrills(s.drillsJson),
  }));

  const data: RedigerMal = {
    id: template.id,
    name: template.name,
    description: template.description,
    kategori: template.kategori,
    lPhase: template.lPhase,
    varighetUker: template.varighetUker,
    ukentligOktAntall: template.ukentligOktAntall,
    fordeling: readFordeling(template.disciplinFordeling),
    minAlder: template.minAlder,
    maxAlder: template.maxAlder,
    approved: template.approved,
    sessions,
  };

  const drillOptions: RedigerDrillValg[] = drillDefs.map((d) => ({
    id: d.id,
    name: d.name,
    pyramidArea: d.pyramidArea,
    skillArea: d.skillArea,
  }));

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG14MalRediger template={data} drillOptions={drillOptions} />
    </AgencyOSSkall>
  );
}

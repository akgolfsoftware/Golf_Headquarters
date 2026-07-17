/**
 * AgencyOS — Plan-mal-detalj (/admin/plan-templates/[id]) — v2.
 * v2-port 17. juli 2026 (Team F1): `AdminPlanMalDetaljV2` erstatter
 * template-detail, ruten flyttet ut av (legacy). Auth-guard (COACH + ADMIN),
 * Prisma-queries (mal + økter + drill-navn-oppslag) og datamapping er
 * uendret — kun presentasjonslaget er nytt.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminPlanMalDetaljV2,
  type PlanMalDetalj,
  type PlanMalOkt,
} from "@/components/admin/v2/AdminPlanMalDetaljV2";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  readDrills,
  readFordeling,
} from "@/components/admin/plan-templates/shared";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function PlanTemplateDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.planTemplate.findUnique({
    where: { id },
    include: {
      sessions: {
        orderBy: [{ ukeNr: "asc" }, { dagNr: "asc" }],
      },
    },
  });

  if (!template) notFound();

  // Hent alle drill-IDer for å resolve navn
  const drillIds = new Set<string>();
  for (const s of template.sessions) {
    for (const d of readDrills(s.drillsJson)) {
      drillIds.add(d.exerciseId);
    }
  }
  const drillDefs =
    drillIds.size > 0
      ? await prisma.exerciseDefinition.findMany({
          where: { id: { in: Array.from(drillIds) } },
          select: { id: true, name: true },
        })
      : [];
  const drillNavn = new Map(drillDefs.map((d) => [d.id, d.name]));

  const sessions: PlanMalOkt[] = template.sessions.map((s) => {
    const drills = readDrills(s.drillsJson);
    return {
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
      drills: drills.map((d) => ({
        ...d,
        exerciseName: drillNavn.get(d.exerciseId) ?? null,
      })),
    };
  });

  const data: PlanMalDetalj = {
    id: template.id,
    name: template.name,
    description: template.description,
    kategori: template.kategori,
    lPhase: template.lPhase,
    varighetUker: template.varighetUker,
    ukentligOktAntall: template.ukentligOktAntall,
    fordeling: readFordeling(template.disciplinFordeling),
    anbefaltFordeling: ANBEFALT_FORDELING_PER_KATEGORI[template.kategori],
    minAlder: template.minAlder,
    maxAlder: template.maxAlder,
    approved: template.approved,
    usageCount: template.usageCount,
    effectivenessAvg: template.effectivenessAvg,
    sessions,
  };

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/plan-templates">Plan-maler</TilbakeLenke>
      <AdminPlanMalDetaljV2 template={data} />
    </V2Shell>
  );
}

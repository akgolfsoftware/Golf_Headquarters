/**
 * /admin/plan-templates/[id] — Mal-detalj.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import {
  TemplateDetail,
  type SessionData,
  type TemplateData,
} from "@/components/admin/plan-templates/template-detail";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  FASE_LABEL,
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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
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

  const sessions: SessionData[] = template.sessions.map((s) => {
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

  const data: TemplateData = {
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

  // Splitt navn: siste ord italic
  const parts = template.name.split(" ");
  const titleItalic = parts[parts.length - 1];
  const titleLead = parts.slice(0, parts.length - 1).join(" ");

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <Link
        href="/admin/plan-templates"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tilbake til biblioteket
      </Link>

      <PageHeader
        eyebrow={`NGF-KATEGORI ${template.kategori} · ${FASE_LABEL[template.lPhase].toUpperCase()} · ${template.varighetUker} UKER`}
        titleLead={titleLead || undefined}
        titleItalic={titleItalic}
        sub={template.description ?? "Ingen beskrivelse lagt til ennå."}
      />

      <TemplateDetail template={data} />
    </div>
  );
}

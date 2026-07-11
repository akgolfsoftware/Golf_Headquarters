/**
 * /admin/plan-templates/[id]/rediger — Editor.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import {
  TemplateEditor,
  type DrillOption,
  type EditorTemplate,
  type EditorSession,
} from "@/components/admin/plan-templates/template-editor";
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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
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

  const sessions: EditorSession[] = template.sessions.map((s) => ({
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

  const data: EditorTemplate = {
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

  const drillOptions: DrillOption[] = drillDefs.map((d) => ({
    id: d.id,
    name: d.name,
    pyramidArea: d.pyramidArea,
    skillArea: d.skillArea,
  }));

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <Link
        href={`/admin/plan-templates/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tilbake til mal-detalj
      </Link>
      <PageHeader
        eyebrow="REDIGERER"
        titleLead="Rediger:"
        titleItalic={template.name}
        sub="Endringer på innstillinger må lagres separat. Endringer på enkeltøkter lagres når du klikker «Lagre endring»."
      />
      <TemplateEditor template={data} drillOptions={drillOptions} />
    </div>
  );
}

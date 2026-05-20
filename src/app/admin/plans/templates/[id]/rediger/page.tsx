/**
 * CoachHQ — Rediger plan-mal.
 *
 * Server-component som henter PlanTemplate og rendrer klient-editor med 6
 * seksjoner (periode, faser, allokering, ukentlig template, drill-bibliotek,
 * notater). Actions ligger i ../rediger/actions.ts.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanTemplatePayloadSchema } from "@/lib/ai-plan/json-schemas";
import { TemplateEditor, type EditorInitialData } from "./rediger-client";

const STANDARD_ALLOKERING = {
  FYS: 20,
  TEK: 30,
  SLAG: 25,
  SPILL: 20,
  TURN: 5,
} as const;

const STANDARD_UKE = { okterPerUke: 3, varighetMin: 75 } as const;

export default async function RedigerMalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const mal = await prisma.planTemplate.findUnique({ where: { id } });
  if (!mal) notFound();

  // Vi forsøker å parse payload mot zod-schema. Hvis det feiler, faller vi
  // tilbake på standardverdier slik at editoren kan gjenoppbygge en gyldig
  // payload ved lagring.
  const parsed = PlanTemplatePayloadSchema.safeParse(mal.disciplinFordeling);
  const payloadObj =
    mal.disciplinFordeling && typeof mal.disciplinFordeling === "object" && !Array.isArray(mal.disciplinFordeling)
      ? (mal.disciplinFordeling as Record<string, unknown>)
      : {};

  const initial: EditorInitialData = {
    id: mal.id,
    navn: mal.name,
    beskrivelse: mal.description ?? "",
    weeks: mal.varighetUker,
    active: mal.approved,
    isDefault: payloadObj.isDefault === true,
    notater: typeof payloadObj.notater === "string" ? payloadObj.notater : "",
    allokering: parsed.success ? parsed.data.allokering : { ...STANDARD_ALLOKERING },
    ukeSkjema: parsed.success ? parsed.data.ukeSkjema : { ...STANDARD_UKE },
    sessionsCount: parsed.success ? parsed.data.sessions.length : 0,
    createdAt: mal.createdAt.toISOString(),
    updatedAt: mal.updatedAt.toISOString(),
    payloadValid: parsed.success,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans/templates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Maler
      </Link>

      <TemplateEditor initial={initial} />
    </div>
  );
}

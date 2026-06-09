/**
 * CoachHQ · Live-økt brief — coach-perspektiv
 *
 * Coach ser sesjonens detaljer og kan legge til et fokuspunkt
 * som vises til spilleren før økten starter.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Clock } from "lucide-react";
import { BriefSend } from "./_brief-send";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

const MILJO_LABEL: Record<string, string> = {
  M0: "Innendørs",
  M1: "Driving range",
  M2: "Korte banen",
  M3: "Banen",
  M4: "Turnering",
};

const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokkpraksis",
  RANDOM: "Tilfeldig",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

export default async function CoachLiveBriefPage({ params }: Props) {
  const { sessionId } = await params;
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
  });

  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({
        where: { id: session.studentId },
        select: { id: true, name: true },
      })
    : null;
  const startTid = new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(session.startTime);
  const sluttTid = new Intl.DateTimeFormat("nb-NO", {
    timeStyle: "short",
  }).format(session.endTime);

  // Les ev. tidligere sendt brief-melding fra completedSummary.coachBrief.
  const rawSummary: unknown = session.completedSummary;
  const summaryObj =
    rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
      ? (rawSummary as Record<string, unknown>)
      : {};
  const briefObj =
    summaryObj.coachBrief &&
    typeof summaryObj.coachBrief === "object" &&
    !Array.isArray(summaryObj.coachBrief)
      ? (summaryObj.coachBrief as Record<string, unknown>)
      : {};
  const initialBrief =
    typeof briefObj.melding === "string" ? briefObj.melding : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos"}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {spiller?.name ?? "Spiller"}
          </Link>
        </div>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Coach · Live-brief
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
            {session.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {MILJO_LABEL[session.miljo] ?? session.miljo} ·{" "}
              {PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {startTid} – {sluttTid}
            </span>
          </div>
        </div>

        {session.notes && (
          <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Notater
            </p>
            <p className="text-sm text-foreground">{session.notes}</p>
          </div>
        )}

        <BriefSend sessionId={sessionId} initialMelding={initialBrief} />

        <div className="mt-6">
          <Link
            href={`/admin/live/${sessionId}/active`}
            className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start live-monitoring →
          </Link>
        </div>
      </div>
    </div>
  );
}

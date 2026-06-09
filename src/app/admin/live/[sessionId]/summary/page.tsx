/**
 * CoachHQ · Live-økt summary — coach-perspektiv
 *
 * Post-økt sammendrag: coach vurderer øktens kvalitet,
 * skriver observasjoner og lagrer til spillerprofilen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { CoachSummaryForm } from "./_coach-summary-form";

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

export default async function CoachLiveSummaryPage({ params }: Props) {
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

  // Les ev. eksisterende coach-vurdering fra completedSummary-JSON.
  const rawSummary: unknown = session.completedSummary;
  const summaryObj =
    rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
      ? (rawSummary as Record<string, unknown>)
      : {};
  const initialRating =
    typeof summaryObj.coachRating === "number" ? summaryObj.coachRating : null;
  const initialNotat = session.notes ?? "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos"}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til {spiller?.name ?? "spiller"}
          </Link>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Coach · Økt fullført
          </p>
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {session.title} — sammendrag
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{startTid}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Miljø
            </p>
            <p className="mt-2 font-semibold text-foreground">
              {MILJO_LABEL[session.miljo] ?? session.miljo}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Økttype
            </p>
            <p className="mt-2 font-semibold text-foreground">
              {PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Status
            </p>
            <p className="mt-2 font-semibold text-success">Fullført</p>
          </div>
        </div>

        <CoachSummaryForm
          sessionId={sessionId}
          initialRating={initialRating}
          initialNotat={initialNotat}
        />

        <div className="mt-6 flex gap-3">
          <Link
            href={spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos"}
            className="flex-1 rounded-lg border border-border px-6 py-3 text-center text-sm text-muted-foreground hover:bg-muted"
          >
            Til spillerprofil
          </Link>
          <Link
            href="/admin/agencyos"
            className="flex-1 rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tilbake til AgencyOS
          </Link>
        </div>
      </div>
    </div>
  );
}

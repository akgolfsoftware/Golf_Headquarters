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
import { ArrowLeft, MessageSquare, Target, Clock } from "lucide-react";

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

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            <MessageSquare className="inline h-3.5 w-3.5 mr-1" />
            Coach-kommentar til spilleren
          </h2>
          <textarea
            rows={4}
            placeholder="Skriv en kommentar eller fokuspunkt til spilleren før økten starter..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Vises til spiller i brief-skjermen
            </p>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Send til spiller
            </button>
          </div>
        </div>

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

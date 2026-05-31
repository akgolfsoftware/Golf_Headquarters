/**
 * CoachHQ · Live-økt active — coach-perspektiv
 *
 * Coach følger spillerens pågående økt i sanntid.
 * Kan sende raske meldinger og se øktens status.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokkpraksis",
  RANDOM: "Tilfeldig",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

export default async function CoachLiveActivePage({ params }: Props) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/admin/live/${sessionId}/brief`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Brief
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 font-mono text-xs font-semibold uppercase text-destructive">
            <Activity className="h-3 w-3 animate-pulse" />
            LIVE
          </span>
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Coach · Pågående økt
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          {spiller?.name ?? "Spiller"} — {session.title}
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Status
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {STATUS_LABEL[session.status] ?? session.status}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sist oppdatert nå
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Økttype
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(
                session.startTime
              )}{" "}
              –{" "}
              {new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(
                session.endTime
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            <MessageSquare className="inline h-3.5 w-3.5 mr-1" />
            Send melding til spiller
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Skriv en rask melding..."
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Send
            </button>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/admin/live/${sessionId}/summary`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-3 font-medium text-primary hover:bg-primary/5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Avslutt og se sammendrag
          </Link>
        </div>
      </div>
    </div>
  );
}

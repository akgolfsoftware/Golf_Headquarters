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
import { ArrowLeft, CheckCircle2, Star, FileText } from "lucide-react";

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

        <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-6">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              <Star className="inline h-3.5 w-3.5 mr-1" />
              Coach-vurdering
            </h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="h-8 w-8 rounded-md border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  {n}
                </button>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                Økt-kvalitet (1–5)
              </span>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              <FileText className="inline h-3.5 w-3.5 mr-1" />
              Coach-notat
            </label>
            <textarea
              rows={4}
              placeholder="Observasjoner, fremgang, fokus til neste økt..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Lagre vurdering
            </button>
          </div>
        </div>

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

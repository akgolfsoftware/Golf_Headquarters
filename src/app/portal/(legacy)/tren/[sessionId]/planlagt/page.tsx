/**
 * PlayerHQ · Tren · Økt-detalj (planlagt)
 *
 * Pre-økt-visning med drills, beskrivelse og varighet. Henter ekte data fra
 * TrainingSessionV2 + TrainingDrillV2. Tom-state hvis økt mangler eller
 * ikke finnes. Portet til hybrid design system 2026-06-17.
 */
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Target,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { ParticipantsList } from "@/components/portal/workbench/participants-list";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "i dag";
  if (diffDays === 1) return "i går";
  if (diffDays > 1) return `${diffDays} dager siden`;
  const futureDays = Math.ceil(-diffMs / (1000 * 60 * 60 * 24));
  if (futureDays === 1) return "i morgen";
  return `om ${futureDays} dager`;
}

export default async function OktPlanlagtPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: {
        orderBy: { sortOrder: "asc" },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!session) notFound();

  // Tilgangs-sjekk: spilleren selv, gruppen, coach/admin, eller invitert deltaker
  const erDeltaker = session.participants.some((p) => p.userId === user.id);
  const harTilgang =
    session.studentId === user.id ||
    session.coachId === user.id ||
    session.hostId === user.id ||
    erDeltaker ||
    user.role === "ADMIN" ||
    user.role === "COACH";
  if (!harTilgang) notFound();

  const varighet = minutesBetween(session.startTime, session.endTime);
  const totalDrillMin = session.drills.reduce(
    (sum, d) => sum + (d.durationMinutes ?? 0),
    0,
  );

  // Timing-logikk
  const now = new Date();
  const sessionDay = new Date(session.startTime);
  sessionDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = sessionDay.getTime() === today.getTime();
  const isOverdue = session.startTime < now && !isToday;
  const isFuture = session.startTime > now && !isToday;

  // Trene sammen-data: er denne brukeren host og kan invitere?
  const erHost = session.hostId === user.id;
  const kanInvitere =
    erHost &&
    session.isShared &&
    (session.maxParticipants == null ||
      session.participants.length < session.maxParticipants);

  // Hent potensielle spillere å invitere (kun hvis host og delt økt)
  type Inviterbar = {
    id: string;
    name: string;
    avatarUrl: string | undefined;
    hcp: number | null;
    gruppe: string | undefined;
  };
  let inviterbareSpillere: Inviterbar[] = [];
  if (kanInvitere) {
    const inviterte = new Set(session.participants.map((p) => p.userId));
    inviterte.add(user.id); // host kan ikke invitere seg selv
    const kandidater = await prisma.user.findMany({
      where: {
        role: "PLAYER",
        deletedAt: null,
        id: { notIn: Array.from(inviterte) },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        hcp: true,
        homeClub: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });
    inviterbareSpillere = kandidater.map((k) => ({
      id: k.id,
      name: k.name,
      avatarUrl: k.avatarUrl ?? undefined,
      hcp: k.hcp,
      gruppe: k.homeClub ?? undefined,
    }));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-6 pb-12">

        {/* Tilbake-knapp */}
        <Link
          href="/portal/tren"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Tilbake
        </Link>

        {/* Hero */}
        <section className="space-y-3">
          {/* Eyebrow — timing-avhengig */}
          {isToday && (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em]">
              I dag · {formatDateLong(session.startTime)}
            </span>
          )}
          {isFuture && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Planlagt · {formatDateLong(session.startTime)}
            </span>
          )}
          {isOverdue && (
            <span className="inline-flex items-center gap-2 rounded-full bg-warning/15 text-warning px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em]">
              Ikke startet · {formatDateLong(session.startTime)}
            </span>
          )}

          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
            {session.title}
          </h1>

          {/* Meta-rad */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <Clock size={13} strokeWidth={1.75} />
              {varighet} min · {formatTime(session.startTime)}
            </span>
            {session.drills.length > 0 && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <Target size={13} strokeWidth={1.75} />
                {session.drills.length} drills
              </span>
            )}
            {session.miljo && (
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]">
                {session.miljo}
              </span>
            )}
          </div>
        </section>

        {/* Coach InsightCard — kun hvis det finnes notater */}
        {session.notes && (
          <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              {/* Coach avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <span className="font-mono text-[10px] font-bold text-accent">AK</span>
              </div>
              <div className="min-w-0">
                <p className="font-display text-[14px] font-bold leading-tight text-foreground">
                  Anders Kristiansen
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Coach-notat · {relativeTime(session.updatedAt ?? session.startTime)}
                </p>
              </div>
            </div>
            <p className="text-[13.5px] leading-[1.55] text-foreground whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        )}

        {/* Drill-liste */}
        {session.drills.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                Drills i planen
                {totalDrillMin > 0 && (
                  <span className="ml-2 text-muted-foreground/60">· {totalDrillMin} min</span>
                )}
              </span>
            </div>
            <div className="divide-y divide-border">
              {session.drills.map((drill) => (
                <div key={drill.id} className="flex items-start gap-3 px-4 py-3">
                  {/* Dot */}
                  <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold leading-snug text-foreground">
                      {drill.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {drill.durationMinutes && `${drill.durationMinutes} min`}
                      {drill.repetitions ? ` · ${drill.repetitions} reps` : ""}
                    </p>
                  </div>
                  {drill.pyramide && (
                    <span className="shrink-0 rounded-full bg-primary/8 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                      {drill.pyramide}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tom drill-state */}
        {session.drills.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
            <Target size={16} strokeWidth={1.5} />
            Ingen drills er lagt til denne økten ennå.
          </div>
        )}

        {/* Trene sammen — kun for delte økter */}
        {session.isShared && (
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-display text-[18px] font-semibold tracking-tight text-foreground">
                Trene sammen{" "}
                <span className="font-mono text-sm font-normal text-muted-foreground">
                  ·{" "}
                  {session.participants.length}
                  {session.maxParticipants != null
                    ? ` av ${session.maxParticipants}`
                    : ""}
                </span>
              </h2>
              {kanInvitere && (
                <InviteFriendTrigger
                  sessionId={session.id}
                  hostId={user.id}
                  maxParticipants={session.maxParticipants ?? 8}
                  currentParticipants={session.participants.length}
                  spillere={inviterbareSpillere}
                  label="Inviter kompis"
                />
              )}
            </div>
            {session.participants.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
                <Users size={16} strokeWidth={1.5} aria-hidden />
                Ingen er invitert ennå.
                {erHost && " Trykk «Inviter kompis» for å invitere noen."}
              </div>
            ) : (
              <ParticipantsList
                participants={session.participants.map((p) => ({
                  participantId: p.id,
                  user: {
                    id: p.user.id,
                    name: p.user.name,
                    avatarUrl: p.user.avatarUrl,
                  },
                  status: p.status,
                }))}
              />
            )}
          </section>
        )}

        {/* CTA-knapper */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/portal/tren/${sessionId}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Start økt
          </Link>
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed"
          >
            Utsett til i morgen
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * PlayerHQ · Tren · Økt-detalj (planlagt)
 *
 * Pre-økt-visning med drills, beskrivelse og varighet. Henter ekte data fra
 * TrainingSessionV2 + TrainingDrillV2. Tom-state hvis økt mangler eller
 * ikke finnes.
 */
import Link from "next/link";
import {
  Clock,
  MapPin,
  Pencil,
  Play,
  Target,
  X,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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
    },
  });

  if (!session) notFound();

  // Tilgangs-sjekk: spilleren selv, gruppen, eller coach/admin
  const harTilgang =
    session.studentId === user.id ||
    session.coachId === user.id ||
    user.role === "ADMIN" ||
    user.role === "COACH";
  if (!harTilgang) notFound();

  const varighet = minutesBetween(session.startTime, session.endTime);
  const totalDrillMin = session.drills.reduce(
    (sum, d) => sum + (d.durationMinutes ?? 0),
    0,
  );

  return (
    <div className="space-y-8 pb-32">
      {/* Hero */}
      <section className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Planlagt {formatTime(session.startTime)} ·{" "}
          {formatDateLong(session.startTime)}
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
          <em className="italic text-primary">{session.title}</em>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-foreground px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
            {session.practiceType}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.75} />
            <strong className="font-mono uppercase tracking-[0.06em] text-foreground">
              {varighet} min
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.75} />
            <strong className="font-mono uppercase tracking-[0.06em] text-foreground">
              {session.miljo}
            </strong>
          </span>
        </div>
      </section>

      {/* Notater fra coach */}
      {session.notes && (
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
            Notater
          </h2>
          <div className="rounded-lg border border-border border-l-[3px] border-l-primary bg-card p-5">
            <p className="whitespace-pre-wrap italic text-foreground">
              &ldquo;{session.notes}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* Drills */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Øvelser{" "}
          {session.drills.length > 0 && (
            <span className="font-mono text-sm font-normal text-muted-foreground">
              · {session.drills.length} drills · {totalDrillMin} min
            </span>
          )}
        </h2>
        {session.drills.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
            <Target size={16} strokeWidth={1.5} />
            Ingen drills er lagt til denne økten ennå.
          </div>
        ) : (
          <div className="space-y-2">
            {session.drills.map((drill, idx) => (
              <details
                key={drill.id}
                open={idx === 0}
                className="group rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-display text-sm font-semibold">
                    {drill.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {drill.durationMinutes} min
                    {drill.repetitions ? ` · ${drill.repetitions} reps` : ""}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {drill.pyramide}
                  </span>
                </summary>
                {drill.description && (
                  <div className="grid grid-cols-1 gap-4 border-t border-border px-4 py-4 sm:grid-cols-[120px_1fr]">
                    <div className="flex h-20 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Play size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {drill.description}
                    </p>
                  </div>
                )}
              </details>
            ))}
          </div>
        )}
      </section>

      {/* Action bar */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card px-4 py-3 sm:px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground sm:inline">
            Starter{" "}
            <strong className="text-foreground">
              {formatTime(session.startTime)} · {formatDateLong(session.startTime)}
            </strong>
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground opacity-60"
            >
              <Pencil size={12} strokeWidth={1.75} /> Endre tid
            </button>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-destructive/30 bg-card px-3 py-2 text-xs font-semibold text-destructive opacity-60"
            >
              <X size={12} strokeWidth={1.75} /> Avlys
            </button>
            <Link
              href={`/portal/tren/${sessionId}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 sm:flex-initial"
            >
              <Play size={14} strokeWidth={2} /> Start økt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

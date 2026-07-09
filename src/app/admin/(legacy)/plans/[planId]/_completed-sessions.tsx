import Link from "next/link";
import type { PyramidArea } from "@/generated/prisma/client";
import { PYR_COLOR } from "./_pyr-color";
import { FeedbackModal } from "./feedback-modal";

export type CompletedSession = {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  log: {
    startedAt: Date | null;
    completedAt: Date | null;
    csAchieved: number | null;
    rating: number | null;
    coachFeedback: string | null;
    coachFeedbackAt: Date | null;
  } | null;
};

export function CompletedSessions({
  sessions,
  playerName,
}: {
  sessions: CompletedSession[];
  playerName: string;
}) {
  if (sessions.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-[16px] font-semibold leading-snug">
            Fullførte økter
          </h3>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Send feedback til spiller direkte fra raden
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {sessions.length}
        </span>
      </div>

      <ul className="divide-y divide-border">
        {sessions.map((s) => {
          const dato = s.scheduledAt.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "short",
          });
          const varighet =
            s.log?.completedAt && s.log?.startedAt
              ? Math.max(
                  1,
                  Math.round(
                    (s.log.completedAt.getTime() -
                      s.log.startedAt.getTime()) /
                      60000,
                  ),
                )
              : null;
          return (
            <li
              key={s.id}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-4 py-2.5"
            >
              <div className="font-mono text-[11px] font-semibold leading-tight">
                {dato}
                <span className="mt-1 block font-sans text-[10px] font-normal text-muted-foreground">
                  {varighet != null
                    ? `${varighet} min`
                    : `${s.durationMin} min`}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{
                      background: PYR_COLOR[s.pyramidArea],
                    }}
                  />
                  <Link
                    href={`/portal/tren/${s.id}`}
                    className="truncate text-[13px] font-medium text-foreground hover:text-primary"
                  >
                    {s.title}
                  </Link>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground tabular-nums">
                  <span>{s.pyramidArea}</span>
                  {s.log?.csAchieved != null && (
                    <>
                      <span>·</span>
                      <span>{s.log.csAchieved} % godkjent</span>
                    </>
                  )}
                  {s.log?.rating != null && (
                    <>
                      <span>·</span>
                      <span>{s.log.rating}/5</span>
                    </>
                  )}
                  {s.log?.coachFeedback && (
                    <>
                      <span>·</span>
                      <span className="text-primary">Feedback sendt</span>
                    </>
                  )}
                </div>
              </div>
              <FeedbackModal
                sessionId={s.id}
                sessionTitle={s.title}
                playerName={playerName}
                existingFeedback={s.log?.coachFeedback ?? null}
                existingFeedbackAt={
                  s.log?.coachFeedbackAt
                    ? s.log.coachFeedbackAt.toISOString()
                    : null
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

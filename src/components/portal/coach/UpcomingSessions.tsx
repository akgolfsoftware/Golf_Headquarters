import Link from "next/link";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { AthleticCard } from "@/components/athletic/card";
import type { UpcomingSessionItem } from "@/app/portal/coach/actions";

type UpcomingSessionsProps = {
  sessions: UpcomingSessionItem[];
};

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <AthleticCard
      label="Kommende sesjoner"
      action={
        <Link
          href="/portal/booking"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          Book ny
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      }
    >
      {sessions.length === 0 ? (
        <div className="py-6 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">Ingen kommende coaching-timer eller planlagte økter.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition hover:border-primary/30"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                <Calendar className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold leading-tight">{s.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {formatSessionTime(s.startAt, s.endAt)}
                  </span>
                  {s.locationName && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3 w-3" strokeWidth={1.5} />
                      {s.locationName}
                    </span>
                  )}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {statusLabel(s.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AthleticCard>
  );
}

function formatSessionTime(start: Date, end: Date) {
  const sameDay = start.toDateString() === end.toDateString();
  if (!sameDay) {
    return `${start.toLocaleDateString("nb-NO")} – ${end.toLocaleDateString("nb-NO")}`;
  }
  return `${start.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })}, ${start.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PLANNED: "Planlagt",
    ACTIVE: "Aktiv",
    PAUSED: "Pause",
    COMPLETED: "Fullført",
    ABANDONED: "Avbrutt",
    SKIPPED: "Hoppet over",
    CANCELLED: "Kansellert",
    PENDING: "Venter",
    CONFIRMED: "Bekreftet",
  };
  return map[status] ?? status;
}

import { Calendar, Clock, MapPin } from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";

export type IdagOktStatus =
  | "PLANNED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type IdagOkt = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  pyramidArea?: string;
  location?: string;
  status: IdagOktStatus;
  drills: Array<{ title: string; sets?: number; reps?: number }>;
  notes?: string;
};

export type IdagPanelProps = {
  spillerId: string;
  spillerNavn?: string;
  okter: IdagOkt[];
};

const STATUS_LABEL: Record<IdagOktStatus, string> = {
  PLANNED: "Ikke bekreftet",
  CONFIRMED: "Booket",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
};

const STATUS_VARIANT: Record<
  IdagOktStatus,
  "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok"
> = {
  PLANNED: "warn",
  CONFIRMED: "primary",
  COMPLETED: "ok",
  CANCELLED: "urgent",
};

function formatTid(dato: Date): string {
  return dato.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDrill(drill: IdagOkt["drills"][number]): string {
  const sets = drill.sets;
  const reps = drill.reps;
  if (sets != null && reps != null) {
    return `${drill.title} (${sets}x${reps})`;
  }
  if (sets != null) {
    return `${drill.title} (${sets} sett)`;
  }
  return drill.title;
}

/**
 * IdagPanel — viser dagens økter for en spiller i Coach Workbench.
 *
 * Pure presentational. Data-fetching gjøres i koordinator-komponent.
 */
export function IdagPanel({ spillerId: _spillerId, spillerNavn, okter }: IdagPanelProps) {
  if (okter.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Ingen økter planlagt i dag"
        description={
          spillerNavn
            ? `${spillerNavn} har ingen treningsøkter i dag.`
            : "Spilleren har ingen treningsøkter i dag."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em]">
          Dagens økter
          {spillerNavn ? ` for ${spillerNavn}` : ""}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
          {okter.length} {okter.length === 1 ? "økt" : "økter"}
        </span>
      </div>

      <div className="space-y-3">
        {okter.map((okt) => (
          <OktKort key={okt.id} okt={okt} />
        ))}
      </div>
    </div>
  );
}

function OktKort({ okt }: { okt: IdagOkt }) {
  const isCancelled = okt.status === "CANCELLED";

  return (
    <AthleticCard className={isCancelled ? "opacity-60" : undefined}>
      <div className="space-y-3">
        {/* Header: tid + pyramid-area */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold tabular-nums">
              {formatTid(okt.startAt)} – {formatTid(okt.endAt)}
            </span>
            {okt.pyramidArea && (
              <AthleticEyebrow>{okt.pyramidArea}</AthleticEyebrow>
            )}
          </div>
          <AthleticBadge variant={STATUS_VARIANT[okt.status]}>
            {STATUS_LABEL[okt.status]}
          </AthleticBadge>
        </div>

        {/* Tittel */}
        <h3 className="font-display text-base font-semibold leading-tight">
          {okt.title}
        </h3>

        {/* Lokasjon */}
        {okt.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={14} strokeWidth={1.75} aria-hidden />
            <span>{okt.location}</span>
          </div>
        )}

        {/* Drills */}
        {okt.drills.length > 0 && (
          <div className="space-y-1.5">
            <AthleticEyebrow>Drills ({okt.drills.length})</AthleticEyebrow>
            <ul className="space-y-1 text-sm">
              {okt.drills.map((drill, i) => (
                <li
                  key={`${drill.title}-${i}`}
                  className="flex items-start gap-2 text-foreground"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                  />
                  <span>{formatDrill(drill)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notater */}
        {okt.notes && (
          <div className="rounded-md border-l-2 border-accent bg-muted/40 px-3 py-2 text-sm italic text-foreground">
            &ldquo;{okt.notes}&rdquo;
          </div>
        )}

        {/* Actions */}
        {!isCancelled && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {okt.status === "PLANNED" ? (
              <>
                <AthleticButton size="sm" variant="lime">
                  Bekreft
                </AthleticButton>
                <AthleticButton size="sm" variant="ghost-light">
                  Avlys
                </AthleticButton>
              </>
            ) : okt.status === "CONFIRMED" ? (
              <>
                <AthleticButton size="sm" variant="ghost-light">
                  <Clock size={14} strokeWidth={1.75} aria-hidden />
                  Endre tid
                </AthleticButton>
                <AthleticButton size="sm" variant="ghost-light">
                  Avlys
                </AthleticButton>
              </>
            ) : null}
          </div>
        )}
      </div>
    </AthleticCard>
  );
}

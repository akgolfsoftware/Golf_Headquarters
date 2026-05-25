import { Calendar, Download, Edit3, Sparkles } from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type PlanUkeAdherence = {
  uke: number;
  fullfort: number;
  total: number;
};

export type PlanUkasOkt = {
  id: string;
  title: string;
  dato: Date;
  status: string;
};

export type AktivPlan = {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  adherence: number; // 0-1
  ukentligAdherence: PlanUkeAdherence[];
  ukasOkter: PlanUkasOkt[];
};

export type PlanPanelProps = {
  spillerId: string;
  aktivPlan?: AktivPlan;
};

function formatDato(dato: Date): string {
  return dato.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "short",
  });
}

function ukerMellom(start: Date, slutt: Date): number {
  const MS_PER_UKE = 7 * 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((slutt.getTime() - start.getTime()) / MS_PER_UKE));
}

function statusToVariant(
  status: string,
): "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok" {
  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "FULLFORT") return "ok";
  if (s === "CONFIRMED" || s === "BOOKET") return "primary";
  if (s === "PLANNED" || s === "IKKE_BEKREFTET") return "warn";
  if (s === "CANCELLED" || s === "AVLYST" || s === "SKIPPED") return "urgent";
  return "neutral";
}

function statusLabel(status: string): string {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    PLANNED: "Planlagt",
    CONFIRMED: "Bekreftet",
    IN_PROGRESS: "Pågår",
    COMPLETED: "Fullført",
    CANCELLED: "Avlyst",
    SKIPPED: "Hoppet over",
  };
  return map[s] ?? status;
}

/**
 * PlanPanel — viser aktiv treningsplan med adherence-tracking.
 *
 * Pure presentational. Data-fetching gjøres i koordinator-komponent.
 */
export function PlanPanel({ spillerId: _spillerId, aktivPlan }: PlanPanelProps) {
  if (!aktivPlan) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Ingen aktiv plan"
        description="Spilleren har ingen aktiv treningsplan. Generer en med AI eller bygg en manuelt."
        action={
          <AthleticButton size="md" variant="lime">
            <Sparkles size={16} strokeWidth={1.75} aria-hidden />
            Generer plan med AI
          </AthleticButton>
        }
      />
    );
  }

  const adherencePct = Math.round(aktivPlan.adherence * 100);
  const totalUker = aktivPlan.endDate
    ? ukerMellom(aktivPlan.startDate, aktivPlan.endDate)
    : null;

  return (
    <div className="space-y-4">
      {/* Plan-header */}
      <AthleticCard>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <AthleticEyebrow>Aktiv plan</AthleticEyebrow>
              <h2 className="font-display text-xl font-bold tracking-[-0.015em]">
                {aktivPlan.name}
              </h2>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatDato(aktivPlan.startDate)}
                {aktivPlan.endDate
                  ? ` – ${formatDato(aktivPlan.endDate)} (${totalUker} uker)`
                  : " – pågående"}
              </p>
            </div>
            <AthleticBadge variant="ok">Aktiv</AthleticBadge>
          </div>

          {/* Adherence-bar */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <AthleticEyebrow>
                Adherence siste {aktivPlan.ukentligAdherence.length} uker
              </AthleticEyebrow>
              <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                {adherencePct}%
              </span>
            </div>
            <ProgressBar
              value={adherencePct}
              variant={
                adherencePct >= 80
                  ? "primary"
                  : adherencePct >= 50
                    ? "warning"
                    : "danger"
              }
              size="lg"
            />
          </div>

          {/* Ukentlig adherence */}
          <div className="space-y-1.5">
            {aktivPlan.ukentligAdherence.map((u) => {
              const pct = u.total > 0 ? (u.fullfort / u.total) * 100 : 0;
              const isLow = pct < 80;
              return (
                <div
                  key={u.uke}
                  className="flex items-center gap-3 text-xs"
                >
                  <span className="w-16 shrink-0 font-mono uppercase tracking-[0.06em] text-muted-foreground">
                    Uke {u.uke}
                  </span>
                  <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn(
                        "h-full rounded-full transition-all",
                        isLow ? "bg-warning" : "bg-primary",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-24 shrink-0 text-right font-mono font-semibold tabular-nums">
                    {Math.round(pct)}% ({u.fullfort}/{u.total})
                    {isLow && (
                      <span className="ml-1 text-warning" aria-label="Lav adherence">
                        !
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </AthleticCard>

      {/* Ukas økter */}
      <AthleticCard label="Ukas plan">
        {aktivPlan.ukasOkter.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Ingen planlagte økter denne uken.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {aktivPlan.ukasOkter.map((okt) => (
              <li
                key={okt.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    size={14}
                    strokeWidth={1.75}
                    className="text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDato(okt.dato)}
                  </span>
                  <span className="font-medium text-foreground">{okt.title}</span>
                </div>
                <AthleticBadge variant={statusToVariant(okt.status)}>
                  {statusLabel(okt.status)}
                </AthleticBadge>
              </li>
            ))}
          </ul>
        )}
      </AthleticCard>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <AthleticButton size="md" variant="lime">
          <Sparkles size={16} strokeWidth={1.75} aria-hidden />
          Generer ny plan (AI)
        </AthleticButton>
        <AthleticButton size="md" variant="ghost-light">
          <Download size={16} strokeWidth={1.75} aria-hidden />
          Eksportér plan
        </AthleticButton>
        <AthleticButton size="md" variant="ghost-light">
          <Edit3 size={16} strokeWidth={1.75} aria-hidden />
          Rediger
        </AthleticButton>
      </div>
    </div>
  );
}

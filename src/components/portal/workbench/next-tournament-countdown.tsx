/**
 * NextTournamentCountdown — viser dager til neste turnering + forberedelse-sjekkliste.
 *
 * Bruk i Player Workbench (PlayerHQ Hjem). Tar imot ferdigformaterte props
 * fra sidekomponenten (se /portal/page.tsx). Tournament-modellen i Prisma har
 * id/name/startDate/endDate/location/format, så vi maple direkte.
 *
 * Referanse: Spor C i Sprint 1 (Player Workbench v2).
 */
import Link from "next/link";
import { ArrowRight, Check, Circle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type TournamentForCountdown = {
  id: string;
  navn: string;
  startDato: Date;
  sluttDato: Date;
  sted: string;
  format?: string;
};

export type TournamentForberedelse = {
  planOppdatert: boolean;
  reiseBooket: boolean;
  baneRecon: boolean;
  mentalForberedelse: boolean;
};

export type NextTournamentCountdownProps = {
  turnering: TournamentForCountdown | null;
  forberedelse?: TournamentForberedelse;
  browseHref?: string;
  className?: string;
};

// ---------- Helpers ----------

function daysUntil(start: Date, now: Date): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(start);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDateRange(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endStr = end.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  return `${startStr} – ${endStr}`;
}

function countdownLabel(days: number, sluttDato: Date, now: Date): {
  big: string;
  small: string;
  tone: "default" | "warning" | "past";
} {
  if (days === 0) return { big: "I DAG", small: "Turnering starter", tone: "warning" };
  if (days < 0) {
    if (sluttDato >= now) return { big: "PÅGÅR", small: "Turnering aktiv", tone: "warning" };
    return { big: "FERDIG", small: "Avsluttet", tone: "past" };
  }
  if (days === 1) return { big: "1", small: "dag igjen", tone: "warning" };
  if (days <= 7) return { big: String(days), small: "dager igjen", tone: "warning" };
  return { big: String(days), small: "dager igjen", tone: "default" };
}

// ---------- Komponent ----------

const DEFAULT_FORBEREDELSE: TournamentForberedelse = {
  planOppdatert: false,
  reiseBooket: false,
  baneRecon: false,
  mentalForberedelse: false,
};

export function NextTournamentCountdown({
  turnering,
  forberedelse = DEFAULT_FORBEREDELSE,
  browseHref = "/portal/tren/turneringer",
  className,
}: NextTournamentCountdownProps) {
  // Empty state — ingen turnering
  if (!turnering) {
    return (
      <section
        className={cn(
          "rounded-lg border border-border bg-card p-4 sm:p-6",
          className
        )}
        aria-labelledby="next-tournament-heading"
      >
        <h2
          id="next-tournament-heading"
          className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Neste turnering
        </h2>
        <div className="rounded-md border border-dashed border-border bg-secondary/40 p-6 text-center">
          <Calendar
            className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            Ingen turneringer registrert
          </p>
          <Link
            href={browseHref}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Bla i turneringer
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const now = new Date();
  const days = daysUntil(turnering.startDato, now);
  const cd = countdownLabel(days, turnering.sluttDato, now);

  const checklist: Array<{
    key: keyof TournamentForberedelse;
    label: string;
    hint?: string;
  }> = [
    { key: "planOppdatert", label: "Plan oppdatert" },
    { key: "reiseBooket", label: "Reise booket" },
    {
      key: "baneRecon",
      label: "Bane-recon",
      hint: "anbefalt 1 uke før",
    },
    {
      key: "mentalForberedelse",
      label: "Mental forberedelse",
      hint: "anbefalt 3 dager før",
    },
  ];

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className
      )}
      aria-labelledby="next-tournament-heading"
    >
      <h2
        id="next-tournament-heading"
        className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
      >
        Neste turnering
      </h2>

      {/* Turnering-info */}
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold leading-tight text-foreground">
          {turnering.navn}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateRange(turnering.startDato, turnering.sluttDato)}
          {" · "}
          {turnering.sted}
          {turnering.format ? ` · ${turnering.format}` : ""}
        </p>
      </div>

      {/* Stort countdown-tall */}
      <div
        className={cn(
          "mb-6 flex items-baseline gap-3 border-y border-border py-4",
          cd.tone === "warning" && "border-destructive/30",
          cd.tone === "past" && "opacity-60"
        )}
      >
        <span
          className={cn(
            "font-display text-5xl font-bold leading-none tabular-nums tracking-tight",
            cd.tone === "warning" && "text-destructive",
            cd.tone === "default" && "text-foreground",
            cd.tone === "past" && "text-muted-foreground"
          )}
        >
          {cd.big}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          {cd.small}
        </span>
      </div>

      {/* Forberedelse-sjekkliste */}
      <div className="mb-4">
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Forberedelse
        </p>
        <ul className="space-y-1.5">
          {checklist.map((item) => {
            const done = forberedelse[item.key];
            return (
              <li
                key={item.key}
                className="flex items-center gap-2 text-sm"
              >
                {done ? (
                  <Check
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-label="Ferdig"
                  />
                ) : (
                  <Circle
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-label="Ikke ferdig"
                  />
                )}
                <span
                  className={cn(
                    "text-foreground",
                    !done && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
                {item.hint ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({item.hint})
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href={`/portal/tren/turneringer/${turnering.id}`}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
      >
        Se turnering
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

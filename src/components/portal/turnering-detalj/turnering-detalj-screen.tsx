/**
 * PlayerHQ · Tren · Turnering — detalj-skjerm (mobile-first 430px).
 *
 * Port av public/design-handover/playerhq/components-turnering-detalj.html.
 * Server component — kun den avkryssbare checklisten er klient
 * (<ForberedelseChecklist/>).
 *
 * Ærlige avvik fra FASIT (manglende data i schemaet):
 *  - Bane-foto: ingen foto-URL → stripet forest-banner-placeholder, ingen
 *    påstand om et faktisk bilde.
 *  - Starttid ("Fredag 11:24"): intet felt → utelatt.
 *  - Tee + Forv. HCP-fliser: ingen felt → utelatt. «Din status»-griden viser
 *    kun celler vi har ekte data for.
 *  - Historikk: rendres kun når spilleren faktisk har resultater.
 *
 * DS-tokens hele veien. Ingen hardkodet hex. Ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  ExternalLink,
  History,
  Trophy,
  X,
} from "lucide-react";
import { AthleticBadge } from "@/components/athletic";
import { cn } from "@/lib/utils";
import type {
  EntryState,
  HistoricResult,
  TurneringDetalj,
} from "@/lib/portal-turnering/turnering-detalj-data";
import { ForberedelseChecklist } from "./forberedelse-checklist";

const ENTRY_BADGE: Record<EntryState["tone"], "ok" | "neutral" | "warn" | "urgent"> = {
  ok: "ok",
  neutral: "neutral",
  warn: "warn",
  urgent: "urgent",
};

/** Én celle i «Din status»-griden. */
function StatusCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card px-3 py-2.5">
      <div className="font-mono text-[8.5px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-[15px] font-extrabold leading-tight tracking-[-0.01em]",
          accent ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function HistoryRow({ result }: { result: HistoricResult }) {
  const detail =
    result.position != null
      ? { lead: "plass", value: `${result.position}.` }
      : result.score != null
        ? { lead: "score", value: String(result.score) }
        : { lead: "fullført", value: "—" };

  return (
    <li className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0">
      <span className="font-mono text-xs font-extrabold tabular-nums text-foreground">
        {result.year}
      </span>
      <span className="ml-auto font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
        {detail.lead}{" "}
        <b className="font-extrabold text-foreground">{detail.value}</b>
      </span>
    </li>
  );
}

export function TurneringDetaljScreen({ data }: { data: TurneringDetalj }) {
  const { entry } = data;
  // Din-status-fliser: kun celler vi har ekte data for. Tee og forventet HCP
  // finnes ikke i schemaet og utelates bevisst.
  const statusCells: { label: string; value: string; accent?: boolean }[] = [];
  if (entry?.category) {
    statusCells.push({ label: "Klasse", value: entry.category });
  }
  if (data.format) {
    statusCells.push({ label: "Format", value: data.format });
  }
  if (data.tour) {
    statusCells.push({ label: "Tour", value: data.tour });
  }

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {/* Topbar */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Link
            href="/portal/tren/turneringer"
            className="inline-flex items-center gap-1.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Turneringer
          </Link>
        </div>

        {/* Featured banner — stripet forest-placeholder (ingen foto-data) */}
        <div className="relative flex h-[150px] items-end bg-primary [background-image:repeating-linear-gradient(135deg,hsl(var(--accent)/0.10)_0_14px,transparent_14px_28px)]">
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 to-70% to-transparent" />
          <div className="relative px-4 py-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-accent">
              <Trophy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {data.tour ?? "Turnering"}
            </span>
            <h1 className="mt-1.5 font-display text-[21px] font-bold leading-tight tracking-[-0.02em] text-background">
              {data.name}
            </h1>
            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-background/80">
              {data.dateCompact}
              {data.venue ? ` · ${data.venue}` : ""}
            </div>
          </div>
        </div>

        {/* Status-rad */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          {entry ? (
            <AthleticBadge variant={ENTRY_BADGE[entry.state.tone]}>
              {entry.state.label}
            </AthleticBadge>
          ) : (
            <AthleticBadge variant="neutral">Ikke påmeldt</AthleticBadge>
          )}
          {data.status && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              {data.status.label}
            </span>
          )}
          {entry && (
            <span className="ml-auto text-right font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              Påmeldt
              <b className="block text-[13px] font-extrabold text-foreground">
                {entry.registeredLong}
              </b>
            </span>
          )}
        </div>

        {/* Din status — kun celler med ekte data */}
        {statusCells.length > 0 && (
          <section className="px-4 py-4">
            <div className="mb-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Din status
            </div>
            <div
              className={cn(
                "grid gap-px overflow-hidden rounded-xl border border-border bg-border",
                statusCells.length === 1
                  ? "grid-cols-1"
                  : statusCells.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3",
              )}
            >
              {statusCells.map((c) => (
                <StatusCell
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  accent={c.accent}
                />
              ))}
            </div>
          </section>
        )}

        {/* Forberedelse-checklist (klient) */}
        <ForberedelseChecklist />

        {/* Dine notater (TournamentEntry.notes — trygg fritekst) */}
        {entry?.notes && (
          <section className="border-t border-border px-4 py-4">
            <div className="mb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Dine notater
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
              {entry.notes}
            </p>
          </section>
        )}

        {/* Historikk — kun når spilleren har resultater */}
        {data.history.length > 0 && (
          <section className="border-t border-border px-4 py-4">
            <div className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              <History className="h-3 w-3" strokeWidth={2} aria-hidden />
              Tidligere år
            </div>
            <ul className="overflow-hidden rounded-xl border border-border">
              {data.history.map((r) => (
                <HistoryRow key={r.id} result={r} />
              ))}
            </ul>
          </section>
        )}

        {/* Footer-CTA — kun ekte handlinger (ingen falske løfter) */}
        <div className="flex gap-2.5 border-t border-border px-4 py-4">
          {entry?.state.active ? (
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-card font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-destructive hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Avmeld
            </Link>
          ) : (
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Turneringsplan
            </Link>
          )}
          {data.officialUrl && (
            <a
              href={data.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent shadow-[0_8px_20px_hsl(var(--primary)/0.18)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Offisiell side
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TestUkeTrigger — coach-view: ukeribbon + berørte spillere + handlinger.
 *
 * Vises øverst på /admin/tester når en testuke nærmer seg (≤ 14 dager).
 * Returnerer null hvis countdown === null (ingen testuke planlagt).
 *
 * Krever TestWeek-modell for full aktivering (Bolk 3 TODO).
 */
import { CalendarDays, Send } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export type RibbonWeek = {
  label: string;
  dateRange: string;
  role: "past" | "now" | "pre" | "test" | "eval";
};

export type AffectedPlayer = {
  initials: string;
  name: string;
  hcp: number | null;
  club: string;
  readiness: "KLAR" | "DELVIS" | "UTSATT";
  testsBooked: number;
  testsTotal: number;
};

type Props = {
  countdown: number | null;
  triggeredAt?: string;
  weeks: RibbonWeek[];
  players: AffectedPlayer[];
};

const ROLE_STYLE: Record<RibbonWeek["role"], string> = {
  past: "bg-card border border-border text-muted-foreground",
  now: "bg-warning/10 border-2 border-warning text-foreground",
  pre: "border border-dashed border-border text-muted-foreground",
  test: "bg-primary/8 border-2 border-primary text-foreground",
  eval: "border border-dashed border-border text-muted-foreground",
};

const ROLE_TAG: Record<RibbonWeek["role"], string> = {
  past: "FORRIGE",
  now: "NÅ · VARSEL",
  pre: "FOR-UKE",
  test: "TEST",
  eval: "EVAL · NY PLAN",
};

const READINESS_STYLE: Record<AffectedPlayer["readiness"], string> = {
  KLAR: "bg-success/10 text-success",
  DELVIS: "bg-warning/10 text-warning",
  UTSATT: "bg-destructive/10 text-destructive",
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function TestUkeTrigger({ countdown, triggeredAt, weeks, players }: Props) {
  if (countdown === null) return null;

  const synligeSpillere = players.slice(0, 4);
  const skjulte = players.length - synligeSpillere.length;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-warning/40 bg-warning/5">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-warning/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
          </span>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-warning">
            TESTUKE NÆRMER SEG
          </span>
        </div>
        {triggeredAt && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            UTLØST {triggeredAt} · {countdown} DAGER IGJEN
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Heading */}
        <h2 className="font-display text-[20px] font-bold leading-snug tracking-tight text-foreground">
          Testuke starter{" "}
          <em className="not-italic text-primary">om {countdown} dager</em>.
        </h2>
        <p className="mt-1.5 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
          Spillerne dine med konkurranseprofil skal kjøre full test-rekke. Send varsel og bekreft
          fasilitets-tider.
        </p>

        {/* Week ribbon */}
        {weeks.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {weeks.map((w, i) => (
              <div
                key={i}
                className={`flex min-w-[100px] flex-col items-center rounded-xl px-3 py-2.5 ${ROLE_STYLE[w.role]}`}
              >
                <span className="font-mono text-[13px] font-extrabold tracking-tight">
                  {w.label}
                </span>
                <span className="mt-0.5 text-center font-mono text-[9px] font-bold leading-tight text-muted-foreground">
                  {w.dateRange}
                </span>
                <span
                  className={`mt-1.5 rounded px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.08em] ${
                    w.role === "test"
                      ? "bg-primary text-primary-foreground"
                      : w.role === "now"
                        ? "bg-warning/20 text-warning"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {ROLE_TAG[w.role]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Affected players */}
        {players.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              {players.length} SPILLERE BERØRT · BEREDSKAP
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {synligeSpillere.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  {/* Avatar */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-mono text-[11px] font-extrabold text-foreground">
                    {initials(p.name)}
                  </span>
                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {p.name}
                    </div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      {p.hcp != null ? `HCP ${p.hcp.toFixed(1)} · ` : ""}
                      {p.club}
                    </div>
                  </div>
                  {/* Readiness + tests */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] ${READINESS_STYLE[p.readiness]}`}
                    >
                      {p.readiness}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-muted-foreground">
                      <b className="text-foreground">{p.testsBooked}/{p.testsTotal}</b> tester
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {skjulte > 0 && (
              <button className="mt-2 w-full rounded-xl border border-border bg-card py-2.5 text-center font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground">
                VIS DE ANDRE {skjulte} SPILLERNE
              </button>
            )}
          </div>
        )}

        {/* Action strip */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={agBtnClass("primary")}>
            <Send size={14} strokeWidth={1.5} />
            Varsle alle {players.length} spillere
          </button>
          <button className={agBtnClass("secondary")}>
            <CalendarDays size={14} strokeWidth={1.5} />
            Bekreft fasilitets-tider
          </button>
        </div>
      </div>

      {/* prefers-reduced-motion: ping-animasjonen stoppes */}
      <style>{`@media(prefers-reduced-motion:reduce){.animate-ping{animation:none}}`}</style>
    </section>
  );
}

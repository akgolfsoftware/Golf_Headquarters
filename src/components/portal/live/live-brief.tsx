/**
 * PlayerHQ · Live-økt — Økt-intro / brief (skjerm 1).
 *
 * Fullscreen forest-flate (#005840), cream tekst, lime accent. Preview før
 * start: eyebrow (dato · tid · akse), display-italic tittel, meta-rad, drill-
 * plan-liste, mål-seksjon, og en stor lime START-pill nederst. Wake-lock-hint.
 *
 * Presentasjonskomponent (server-render) — navigasjon via <Link>. Tilgang /
 * tier-gating gjøres i page.tsx; her styres bare visning av CTA.
 */

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, X, Zap } from "lucide-react";
import type { LiveSessionData } from "@/lib/portal-live/types";
import { AXIS_LABEL, formatDateTimeEyebrow } from "@/lib/portal-live/data";
import { AXIS_SHORT, axisDotColor } from "./axis";

export function LiveBrief({
  data,
  canStart,
  blockReason,
}: {
  data: LiveSessionData;
  canStart: boolean;
  /** Hvorfor start er sperret (vises i stedet for CTA). */
  blockReason: "completed" | "tier" | null;
}) {
  const eyebrow = `${formatDateTimeEyebrow(data.scheduledAtISO)} · ${AXIS_LABEL[data.axis].toUpperCase()}`;
  const goalLines = (data.rationale ?? "")
    .split(/\n|•|·/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-primary text-background"
      style={{ isolation: "isolate" }}
    >
      {/* topbar */}
      <header
        className="flex flex-shrink-0 items-center justify-between gap-3 px-4"
        style={{ height: 60, paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <Link
          href={`/portal/tren/${data.sessionId}`}
          aria-label="Tilbake til økt-detalj"
          className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </Link>
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/80">
          Økt-intro
        </span>
        <Link
          href={`/portal/tren/${data.sessionId}`}
          aria-label="Lukk"
          className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </Link>
      </header>

      {/* scroll-innhold */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        {/* hero */}
        <div className="px-5 pb-2 pt-5">
          <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </div>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.05] -tracking-[0.02em] text-background">
            {data.title}
          </h1>
          <div className="mt-4 font-mono text-[14px] font-semibold tabular-nums text-background/65">
            {data.durationMin} min · {data.drills.length}{" "}
            {data.drills.length === 1 ? "drill" : "drills"}
            {data.totalPlannedReps > 0 ? ` · ${data.totalPlannedReps} reps planlagt` : ""}
          </div>
        </div>

        {/* PLAN */}
        <div className="px-5 pb-2 pt-6">
          <SectionHead label="Plan" />
          {data.drills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-background/20 px-6 py-10 text-center text-[14px] text-background/60">
              Ingen drills lagt til.
            </div>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {data.drills.map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-background/[0.07] px-4 py-4">
                  <span
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg font-display text-[18px] font-bold text-primary"
                    style={{ background: axisDotColor(d.axis) }}
                  >
                    {d.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-background/55">
                      {AXIS_SHORT[d.axis]}
                      {d.lPhase ? ` · ${d.lPhase}` : ""}
                    </div>
                    <div className="truncate font-display text-[16px] font-semibold -tracking-[0.01em] text-background">
                      {d.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-background/55">
                      {d.repsLabel} reps{d.csTarget != null ? ` · CS ${d.csTarget}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* MÅL */}
        {goalLines.length > 0 && (
          <div className="px-5 pb-2 pt-6">
            <SectionHead label="Mål for økta" />
            <ul className="flex flex-col gap-2.5">
              {goalLines.map((line, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-background/85">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* footer CTA */}
      <footer
        className="flex-shrink-0 px-5 pt-4"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
          borderTop: "1px solid hsl(var(--background) / 0.1)",
          background: "hsl(var(--primary))",
        }}
      >
        {canStart ? (
          <>
            <Link
              href={`/portal/live/${data.sessionId}/active`}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
              style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
            >
              Start økt
              <Zap className="h-4 w-4 fill-current" strokeWidth={2} aria-hidden />
            </Link>
            <div className="mt-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-background/45">
              Spar batteri · wake-lock på
            </div>
          </>
        ) : (
          <div className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-background/25 font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-background/65">
            {blockReason === "completed" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
                Økten er fullført
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
                Live krever PRO
              </>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/60">
        {label}
      </span>
      <span className="h-px flex-1 bg-background/12" aria-hidden />
    </div>
  );
}

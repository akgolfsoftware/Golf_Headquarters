/**
 * PlayerHQ · Live-økt (preview) — Oppsummering (skjerm 3).
 *
 * Fasit: public/design-handover/_screens/pl-live-summary.png.
 * Fullscreen forest-flate. Topbar (kun lukk), sjekk-sirkel, lime eyebrow,
 * display-tittel "Økt loggført i dag." (lime italic), TOTAL 2x2 KPI (røde
 * delta-tekster der under plan), PER DRILL-rad, og footer "Ferdig"-CTA.
 *
 * Preview-fasiten viser low-compliance-tilstanden (0 reps logget): outline-
 * sjekk + "Økt loggført" + røde under-plan-delta. Presentasjonelt (server).
 * Faktiske verdier kommer som props (i ekte app fra live-snapshot).
 */

import Link from "next/link";
import { ArrowRight, Check, Send, Star, X } from "lucide-react";
import { type LiveSessionDemo, axisColor, fmtMSS, totalPlannedReps } from "./types";

export function LiveSummary({
  data,
  result,
  closeHref,
  doneHref,
}: {
  data: LiveSessionDemo;
  /** Faktisk resultat fra økta (preview-demo). */
  result: {
    /** Faktiske reps per drill (samme rekkefølge/lengde som data.drills). */
    actualRepsPerDrill: number[];
    /** Faktisk total tid i sekunder. */
    totalSec: number;
    /** Antall drills markert fullført. */
    completedDrills: number;
  };
  /** Lukk (topbar X). */
  closeHref: string;
  /** Ferdig → tilbake til indeks. */
  doneHref: string;
}) {
  const plannedTotal = totalPlannedReps(data);
  const totalActualReps = result.actualRepsPerDrill.reduce((s, n) => s + n, 0);
  const repDelta = plannedTotal > 0 ? totalActualReps - plannedTotal : 0;
  const compliance =
    plannedTotal > 0 ? Math.round((totalActualReps / plannedTotal) * 100) : null;
  const lowCompliance = compliance != null && compliance < 70;

  const heroTitle = lowCompliance ? "Økt loggført" : "Økt fullført";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-primary text-background"
      style={{ isolation: "isolate" }}
    >
      {/* topbar — kun lukk */}
      <header
        className="flex-shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <div className="mx-auto flex h-[60px] w-full max-w-[520px] items-center justify-end px-4">
          <Link
            href={closeHref}
            aria-label="Lukk oppsummering"
            className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </header>

      {/* scrollbart innhold */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        <div className="mx-auto w-full max-w-[520px]">
          {/* hero */}
          <div className="flex flex-col items-center px-5 pb-2 pt-4 text-center">
            {lowCompliance ? (
              <span
                className="grid h-24 w-24 place-items-center rounded-full border-2 border-background/30 text-background/70"
                aria-hidden
              >
                <Check className="h-12 w-12" strokeWidth={2} />
              </span>
            ) : (
              <span
                className="grid h-24 w-24 place-items-center rounded-full bg-accent text-primary motion-safe:animate-pulse"
                style={{ boxShadow: "0 0 0 10px hsl(var(--accent) / 0.15)" }}
                aria-hidden
              >
                <Star className="h-12 w-12 fill-current" strokeWidth={1.5} />
              </span>
            )}
            <span className="mt-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
              {data.dateEyebrow}
            </span>
            <h1 className="mt-2 font-display text-[40px] font-bold leading-[1.02] -tracking-[0.02em] text-background">
              {heroTitle} <em className="font-normal italic text-accent/90">i dag.</em>
            </h1>
          </div>

          {/* TOTAL KPI 2x2 */}
          <Section label="Total">
            <div className="grid grid-cols-2 gap-3">
              <Kpi
                label="Tid"
                value={fmtMSS(result.totalSec)}
                sub={`av ${data.durationMin}:00 plan`}
                tone="flat"
              />
              <Kpi
                label="Reps"
                value={`${totalActualReps}${plannedTotal > 0 ? ` / ${plannedTotal}` : ""}`}
                sub={
                  plannedTotal > 0
                    ? repDelta >= 0
                      ? `↑ +${repDelta} over plan`
                      : `${repDelta} under plan`
                    : "logget"
                }
                tone={plannedTotal > 0 ? (repDelta >= 0 ? "up" : "down") : "flat"}
              />
              <Kpi
                label="Compliance"
                value={compliance != null ? `${compliance} %` : "—"}
                sub={compliance != null ? (compliance >= 100 ? "↑ over mål" : "av mål") : "ingen rep-mål"}
                tone={compliance != null ? (compliance >= 100 ? "up" : compliance >= 70 ? "flat" : "down") : "flat"}
              />
              <Kpi
                label="Drills"
                value={`${result.completedDrills} / ${data.drills.length}`}
                sub={result.completedDrills === data.drills.length ? "Alle fullført" : "fullført"}
                tone="flat"
              />
            </div>
          </Section>

          {/* PER DRILL */}
          <Section label="Per drill">
            <div className="overflow-hidden rounded-xl bg-background/[0.07]">
              {data.drills.map((d, i) => {
                const actual = result.actualRepsPerDrill[i] ?? 0;
                const dCompliance =
                  d.plannedReps > 0 ? Math.round((actual / d.plannedReps) * 100) : null;
                const completed = i < result.completedDrills;
                return (
                  <div
                    key={d.index}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      i > 0 ? "border-t border-background/10" : ""
                    }`}
                  >
                    <span
                      className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md font-mono text-[12px] font-extrabold text-primary"
                      style={{ background: axisColor(d.axis) }}
                    >
                      {d.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[15px] font-semibold -tracking-[0.01em] text-background">
                        {d.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums text-background/55">
                        {actual}
                        {d.plannedReps > 0 ? `/${d.plannedReps}` : ""} reps
                        {dCompliance != null ? ` · CS ${dCompliance}` : ""}
                      </div>
                    </div>
                    {completed && (
                      <Check className="h-4 w-4 flex-shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="h-2" />
        </div>
      </div>

      {/* footer CTA */}
      <footer
        className="flex-shrink-0"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
          paddingTop: 16,
          borderTop: "1px solid hsl(var(--background) / 0.1)",
          background: "hsl(var(--primary))",
        }}
      >
        <div className="mx-auto w-full max-w-[520px] px-5">
          <Link
            href={doneHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
            style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
          >
            <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
            Ferdig
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pb-2 pt-5">
      <div className="mb-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/60">
        {label}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "up" | "down" | "flat";
}) {
  const subColor =
    tone === "up" ? "text-accent" : tone === "down" ? "text-destructive" : "text-background/55";
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-background/[0.07] px-4 py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/50">
        {label}
      </span>
      <span className="font-mono text-[28px] font-extrabold leading-none tabular-nums text-accent">
        {value}
      </span>
      <span className={`font-mono text-[11px] font-semibold ${subColor}`}>{sub}</span>
    </div>
  );
}

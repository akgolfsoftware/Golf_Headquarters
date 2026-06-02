"use client";

/**
 * PlayerHQ · Live-økt — Oppsummering (skjerm 4).
 *
 * Fullscreen forest-flate. Feirende men profesjonell: lime stjerne, TOTAL
 * 2x2 KPI, achievements (kun hvis utløst), per-drill-tabell, neste-økt-kort,
 * "LAGRE OG DEL MED COACH"-CTA.
 *
 * Datakilde: planlagte verdier fra coach-plan (LiveSessionData). Faktiske
 * reps/tid hentes fra `sessionStorage`-snapshot lagt av aktiv-skjermen
 * (offline-først, ingen persistert per-drill-faktisk i denne modellen).
 * Finnes ingen snapshot (direkte navigasjon) vises planen — ALDRI falske tall.
 */

import { useMemo, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Send, Star, Trophy, Video, X } from "lucide-react";
import type { LiveSessionData } from "@/lib/portal-live/types";
import { fmtMSS, formatDateEyebrow, AXIS_LABEL } from "@/lib/portal-live/format";
import { AXIS_SHORT, axisDotColor } from "./axis";
import { liveSnapshotKey, type LiveSnapshot } from "./snapshot";
import { completeSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

export function LiveSummary({ data }: { data: LiveSessionData }) {
  const router = useRouter();
  // Les snapshot fra sessionStorage via useSyncExternalStore — hydration-trygt
  // (server: null, client: rå string), ingen synkron setState-i-effect.
  const rawSnap = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(liveSnapshotKey(data.sessionId));
      } catch {
        return null;
      }
    },
    () => null,
  );
  const snap = useMemo<LiveSnapshot | null>(() => {
    if (!rawSnap) return null;
    try {
      return JSON.parse(rawSnap) as LiveSnapshot;
    } catch {
      return null;
    }
  }, [rawSnap]);

  // Per-drill faktisk: foretrekk DB-snapshot (durabelt), fall tilbake til
  // sessionStorage, ellers 0-logget.
  const perDrill = useMemo(() => {
    const live = data.liveSnapshot?.drills ?? snap?.drills ?? [];
    return data.drills.map((d) => {
      const logged = live.find((x) => x.drillId === d.id);
      return {
        ...d,
        actualReps: logged?.reps ?? 0,
        elapsedSec: logged?.elapsedSec ?? 0,
        completed: logged?.status === "done",
      };
    });
  }, [data.drills, data.liveSnapshot, snap]);

  const totalActualReps = perDrill.reduce((s, d) => s + d.actualReps, 0);
  const totalElapsedSec =
    data.liveSnapshot?.totalSec ?? snap?.totalSec ?? perDrill.reduce((s, d) => s + d.elapsedSec, 0);
  const completedDrills = perDrill.filter((d) => d.completed).length;
  const repDelta = data.totalPlannedReps > 0 ? totalActualReps - data.totalPlannedReps : 0;

  // Compliance: faktisk vs planlagt reps (kun hvis vi har et plan-grunnlag).
  const compliance =
    data.totalPlannedReps > 0 ? Math.round((totalActualReps / data.totalPlannedReps) * 100) : null;
  const lowCompliance = compliance != null && compliance < 70;

  // Achievements — kun ekte, utløst av faktiske data.
  const achievements: { icon: React.ReactNode; title: string; sub: string; cta?: boolean }[] = [];
  if (!lowCompliance && repDelta > 0) {
    achievements.push({
      icon: <Trophy className="h-7 w-7" strokeWidth={1.5} aria-hidden />,
      title: "Over planlagt volum",
      sub: `${totalActualReps} reps logget — ${repDelta} over plan`,
    });
  }
  if ((snap?.videoCount ?? 0) > 0) {
    achievements.push({
      icon: <Video className="h-7 w-7" strokeWidth={1.5} aria-hidden />,
      title: "Video-logg lagret",
      sub: "Send til coach for tilbakemelding?",
      cta: true,
    });
  }

  const dateEyebrow = `${formatDateEyebrow(data.scheduledAtISO)} · ${AXIS_LABEL[data.axis].toUpperCase()}`;
  const heroTitle = lowCompliance ? "Økt loggført" : "Økt fullført";

  const [pending, startTransition] = useTransition();

  // Fullfør økta: fryser aggregat til DB og nuller snapshot (completeSession
  // redirigerer til økt-detalj eller feiring).
  function handleComplete() {
    try {
      sessionStorage.removeItem(liveSnapshotKey(data.sessionId));
    } catch {
      /* ignore */
    }
    startTransition(async () => {
      await completeSession({ sessionId: data.sessionId });
    });
  }

  // Lukk uten å fullføre — økta forblir aktiv/resumbar.
  function close() {
    router.push("/portal/tren");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-primary text-background"
      style={{ isolation: "isolate" }}
    >
      {/* topbar — kun lukk */}
      <header
        className="flex flex-shrink-0 items-center justify-end px-4"
        style={{ height: 60, paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Lukk oppsummering"
          className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </header>

      {/* scrollbart innhold */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
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
            {dateEyebrow}
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
              value={fmtMSS(totalElapsedSec)}
              sub={`av ${data.durationMin}:00 plan`}
              tone="flat"
            />
            <Kpi
              label="Reps"
              value={`${totalActualReps}${data.totalPlannedReps > 0 ? ` / ${data.totalPlannedReps}` : ""}`}
              sub={
                data.totalPlannedReps > 0
                  ? repDelta >= 0
                    ? `↑ +${repDelta} over plan`
                    : `${repDelta} under plan`
                  : "logget"
              }
              tone={data.totalPlannedReps > 0 ? (repDelta >= 0 ? "up" : "down") : "flat"}
            />
            <Kpi
              label="Compliance"
              value={compliance != null ? `${compliance} %` : "—"}
              sub={compliance != null ? (compliance >= 100 ? "↑ over mål" : "av mål") : "ingen rep-mål"}
              tone={compliance != null ? (compliance >= 100 ? "up" : compliance >= 70 ? "flat" : "down") : "flat"}
            />
            <Kpi
              label="Drills"
              value={`${completedDrills} / ${data.drills.length}`}
              sub={completedDrills === data.drills.length ? "Alle fullført" : "fullført"}
              tone="flat"
            />
          </div>
        </Section>

        {/* ACHIEVEMENTS (kun hvis utløst) */}
        {achievements.length > 0 && (
          <Section label="Achievements">
            <div className="flex flex-col gap-3">
              {achievements.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-xl bg-background/[0.07] px-4 py-4 ${
                    a.cta ? "border-l-2 border-accent" : ""
                  }`}
                >
                  <span className="flex-shrink-0 text-accent">{a.icon}</span>
                  <div className="min-w-0">
                    <div className="font-display text-[16px] font-semibold -tracking-[0.01em] text-background">
                      {a.title}
                    </div>
                    <div className="mt-0.5 text-[14px] text-background/60">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* PER DRILL */}
        <Section label="Per drill">
          <div className="overflow-hidden rounded-xl bg-background/[0.07]">
            {perDrill.map((d, i) => {
              const dCompliance =
                d.plannedReps > 0 ? Math.round((d.actualReps / d.plannedReps) * 100) : null;
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-background/10" : ""
                  }`}
                >
                  <span
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md font-mono text-[12px] font-extrabold text-primary"
                    style={{ background: axisDotColor(d.axis) }}
                  >
                    {d.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[15px] font-semibold -tracking-[0.01em] text-background">
                      {d.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums text-background/55">
                      {d.actualReps}
                      {d.plannedReps > 0 ? `/${d.plannedReps}` : ""} reps
                      {d.elapsedSec > 0 ? ` · ${fmtMSS(d.elapsedSec)}` : ""}
                      {dCompliance != null ? ` · CS ${dCompliance}` : ""}
                    </div>
                  </div>
                  {d.completed && (
                    <Check className="h-4 w-4 flex-shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* NESTE ØKT (kun hvis finnes) */}
        {data.nextSession && (
          <Section label="Neste økt">
            <div className="flex items-center gap-3 rounded-xl bg-background/[0.07] px-4 py-4">
              <span
                className="h-9 w-1 flex-shrink-0 rounded-full"
                style={{ background: axisDotColor(data.nextSession.axis) }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-background/55">
                  {`${formatDateEyebrow(data.nextSession.scheduledAtISO)} · ${AXIS_SHORT[data.nextSession.axis]}`}
                </div>
                <div className="truncate font-display text-[16px] font-semibold -tracking-[0.01em] text-background">
                  {data.nextSession.title}
                </div>
              </div>
              <span className="flex-shrink-0 font-mono text-[12px] font-bold tabular-nums text-background/60">
                {data.nextSession.durationMin} min
              </span>
            </div>
          </Section>
        )}
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
        <button
          type="button"
          onClick={handleComplete}
          disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground disabled:opacity-60"
          style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
          {pending ? "Lagrer …" : "Lagre og del med coach"}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={pending}
          className="mt-3 inline-flex h-11 w-full items-center justify-center font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-background/55 hover:text-background disabled:opacity-60"
        >
          Bare lagre
        </button>
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

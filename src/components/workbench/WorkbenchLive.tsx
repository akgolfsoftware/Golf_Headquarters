"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AREA_LABEL, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { Drill, WorkbenchSession } from "@/lib/domain/workbench/types";
import { completeSession, saveWorkbenchLiveSnapshot, startNextWorkbenchLiveSession } from "@/lib/workbench/wb-actions";
import type { WorkbenchLiveData, WorkbenchLiveSnapshot } from "@/lib/workbench/live";
import { VisningPiller } from "./VisningPiller";

const ENVIRONMENT: Record<string, string> = {
  RANGE: "Treningsområde",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjemme",
  SIMULATOR: "Simulator",
  GYM: "Treningsrom",
  INNENDORS: "Innendørs",
  TRENINGSOMRADE: "Treningsområde",
  KONKURRANSE: "Konkurranse",
};
const MOTORIKK: Record<string, string> = { UTEN_BALL: "Uten ball", LAV_HAST: "Lav hastighet", AUTO: "Automatikk" };
const PRESS: Record<string, string> = { ALENE: "Alene", OBSERVERT: "Observert", KONKURRANSE: "Konkurranse", TURNERING: "Turnering" };

function clock(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function startTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function elapsed(snapshot: WorkbenchLiveSnapshot): number {
  const sinceStart = Math.floor((Date.now() - new Date(snapshot.startedAtISO).getTime()) / 1000);
  return Math.max(snapshot.totalSec, Number.isFinite(sinceStart) ? sinceStart : 0);
}

function dateLabel(session: WorkbenchSession): string {
  const date = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date(`${session.date}T12:00:00Z`));
  return `${date} · ${session.durationMinutes} min`;
}

function formula(session: WorkbenchSession, drill: Drill | undefined) {
  const f = drill?.akFormel ?? session.drills[0]?.akFormel;
  return [
    { label: UI.pyramid, value: PYRAMID_LABEL[session.pyramid] },
    { label: UI.drillArea, value: f ? AREA_LABEL[f.area] : session.skillArea ?? "—" },
    { label: UI.formelMotorikk, value: f?.motorikk ? MOTORIKK[f.motorikk] : "—" },
    { label: UI.formelBelastning, value: f?.belastning ? ENVIRONMENT[f.belastning] : session.environment ? ENVIRONMENT[session.environment] : "—" },
    { label: UI.formelPress, value: f?.press ? PRESS[f.press] : session.pressureLevel ?? "—" },
    { label: UI.formelHensikt, value: session.pyramid === "FYS" ? session.rationale ?? "—" : "—" },
    { label: UI.formelMate, value: drill?.description ?? "—" },
    { label: UI.formelMal, value: drill?.techniqueFocus ?? session.maalsetning ?? "—" },
  ];
}

function NextSession({ session, pending, onStart }: { session: WorkbenchSession | null; pending: boolean; onStart: () => void }) {
  if (!session) {
    return <section className="wb-live-next"><span className="wb-kicker">Neste i planen</span><h2>Ingen publisert økt</h2><p>Publiser en økt i ukevisningen når planen er klar.</p></section>;
  }
  const rows = formula(session, session.drills[0]);
  return (
    <section className="wb-live-next">
      <span className="wb-kicker">Neste i planen</span>
      <h2>{session.title}</h2>
      <p>{dateLabel(session)}</p>
      <dl>{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd data-empty={row.value === "—"}>{row.value}</dd></div>)}</dl>
      <button type="button" className="wb-publish" disabled={pending} onClick={onStart}>{pending ? "Starter …" : "START ØKT"}</button>
    </section>
  );
}

export function WorkbenchLive({ playerId, spillerNavn, data }: { playerId: string; spillerNavn: string; data: WorkbenchLiveData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [snapshot, setSnapshot] = useState(data.snapshot);
  const snapshotRef = useRef(data.snapshot);
  const saveQueue = useRef(Promise.resolve());
  const [seconds, setSeconds] = useState(() => data.snapshot?.totalSec ?? 0);

  useEffect(() => {
    if (!snapshotRef.current) return;
    setSeconds(elapsed(snapshotRef.current));
    const timer = window.setInterval(() => {
      const current = snapshotRef.current;
      if (current) setSeconds(elapsed(current));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const current = data.current;
  const activeIndex = snapshot?.drills.findIndex((drill) => drill.status === "active") ?? -1;
  const activeDrill = current?.drills[activeIndex >= 0 ? activeIndex : 0];
  const activeState = snapshot?.drills[activeIndex >= 0 ? activeIndex : 0];
  const targetSeries = activeDrill && snapshot ? snapshot.seriesTargets[activeDrill.id] ?? 3 : 3;
  const reps = activeState?.reps ?? 0;
  const currentSeries = Math.min(targetSeries, Math.floor(reps / 12) + 1);
  const allDone = Boolean(snapshot?.drills.length && snapshot.drills.every((drill) => drill.status === "done"));
  function queueSave(next: WorkbenchLiveSnapshot) {
    if (!current) return;
    const payload = { ...next, sessionId: current.id, totalSec: elapsed(next) };
    saveQueue.current = saveQueue.current.then(async () => {
      const result = await saveWorkbenchLiveSnapshot(payload);
      if (!result.ok) toast.error(result.error);
    }).catch(() => { toast.error("Live-statusen kunne ikke lagres."); });
  }

  function commit(next: WorkbenchLiveSnapshot) {
    const withTime = { ...next, totalSec: elapsed(next), updatedAtISO: new Date().toISOString() };
    snapshotRef.current = withTime;
    setSnapshot(withTime);
    setSeconds(withTime.totalSec);
    queueSave(withTime);
  }

  function changeReps(delta: number) {
    const source = snapshotRef.current;
    if (!source || activeIndex < 0) return;
    commit({
      ...source,
      drills: source.drills.map((drill, index) => index === activeIndex ? { ...drill, reps: Math.max(0, Math.min(5000, drill.reps + delta)) } : drill),
    });
  }

  function changeSeries(delta: number) {
    const source = snapshotRef.current;
    if (!source || !activeDrill) return;
    commit({
      ...source,
      seriesTargets: { ...source.seriesTargets, [activeDrill.id]: Math.max(1, Math.min(12, targetSeries + delta)) },
    });
  }

  function chooseDrill(index: number) {
    const source = snapshotRef.current;
    if (!source) return;
    const clicked = source.drills[index];
    const nextIndex = clicked.status === "active" ? index + 1 : index;
    commit({
      ...source,
      drills: source.drills.map((drill, drillIndex) => ({
        ...drill,
        status: drillIndex < nextIndex ? "done" : drillIndex === nextIndex ? "active" : "queued",
      })),
    });
  }

  function startNext() {
    if (!data.next) return;
    startTransition(async () => {
      await saveQueue.current;
      const result = await startNextWorkbenchLiveSession({ currentSessionId: current?.id, nextSessionId: data.next!.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Økten er startet");
      router.refresh();
    });
  }

  function finishCurrent() {
    if (!current) return;
    startTransition(async () => {
      await saveQueue.current;
      const result = await completeSession(current.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Økten er fullført");
      router.refresh();
    });
  }

  return (
    <div className="wb-layout wb-live-layout">
      <main className="wb-main">
        <div className="wb-pills"><VisningPiller playerId={playerId} visning="live" uke={data.from} maned={data.from.slice(0, 7)} aar={data.from.slice(0, 4)} surface="live" /></div>
        <div className="wb-body wb-live-body">
          {!current || !snapshot ? (
            <section className="wb-live-empty"><span className="wb-kicker">Live</span><h1>Ingen økt pågår</h1><p>Start den neste publiserte økten fra panelet.</p></section>
          ) : (
            <>
              <header className="wb-live-heading">
                <div><span className="wb-kicker">Økt pågår</span><h1>{current.title}</h1></div>
                <span className="wb-live-meta">{spillerNavn} · start {startTime(current.startMinute)} · {current.location ?? (current.environment ? ENVIRONMENT[current.environment] : "—")}</span>
                <span className="wb-live-clock" aria-label={`Tid brukt ${clock(seconds)}`}>{clock(seconds)}</span>
              </header>

              {current.drills.length === 0 ? (
                <section className="wb-live-empty"><span className="wb-kicker">Øvelser i økten</span><h2>Ingen øvelser lagt inn</h2><p>Åpne økten og legg til øvelser før gjennomføring.</p></section>
              ) : <><div className="wb-live-grid">
                <section className="wb-live-card">
                  <span className="wb-kicker">Øvelse {Math.max(1, activeIndex + 1)} av {current.drills.length}</span>
                  <h2>{activeDrill?.title ?? "Ingen øvelse"}</h2>
                  <p>{activeDrill?.techniqueFocus ?? activeDrill?.description ?? current.maalsetning ?? "—"}</p>
                  {activeDrill ? <><div className="wb-live-counter"><button type="button" aria-label="Trekk fra ett slag" onClick={() => changeReps(-1)}>−</button><strong>{reps}</strong><button type="button" aria-label="Legg til ett slag" onClick={() => changeReps(1)}>+</button></div><span className="wb-live-counter-label">slag i serie {currentSeries} av {targetSeries}</span></> : null}
                </section>

                <section className="wb-live-card">
                  <span className="wb-kicker">Serier</span>
                  <div className="wb-live-series">
                    {Array.from({ length: targetSeries }, (_, index) => {
                      const count = Math.max(0, Math.min(12, reps - index * 12));
                      const status = count >= 12 ? "Gjennomført" : index === currentSeries - 1 ? "Pågår" : "Ikke startet";
                      return <div key={index}><b>Serie {index + 1}</b><span>{count > 0 ? `${count} slag` : "—"}</span><em>{status}</em></div>;
                    })}
                  </div>
                  <div className="wb-live-actions"><button type="button" onClick={() => changeSeries(1)}>Legg til serie</button><button type="button" disabled={targetSeries <= 1} onClick={() => changeSeries(-1)}>Fjern serie</button></div>
                </section>
              </div>

              <section className="wb-live-exercises">
                <span className="wb-kicker">Øvelser i økten</span>
                <div>{current.drills.map((drill, index) => {
                  const state = snapshot.drills[index];
                  const label = state?.status === "done" ? "Gjennomført" : state?.status === "active" ? "Pågår" : "Ikke startet";
                  return <button key={drill.id} type="button" aria-current={state?.status === "active" ? "step" : undefined} aria-label={`${drill.title}: ${label}. Klikk for å gå videre.`} onClick={() => chooseDrill(index)}><span>{index + 1}</span><b>{drill.title}</b><small>{drill.durationMinutes} min</small><em>{label}</em></button>;
                })}</div>
                {allDone ? <button type="button" className="wb-live-finish" disabled={pending} onClick={finishCurrent}>{pending ? "Fullfører …" : "Fullfør økt"}</button> : null}
              </section></>}
            </>
          )}
        </div>
      </main>

      <aside className="wb-inspector wb-live-inspector"><NextSession session={data.next} pending={pending} onStart={startNext} /></aside>
      <aside className="wb-mobile-summary wb-live-mobile" aria-label="Neste i planen"><div className="wb-grip" aria-hidden /><NextSession session={data.next} pending={pending} onStart={startNext} /></aside>
    </div>
  );
}

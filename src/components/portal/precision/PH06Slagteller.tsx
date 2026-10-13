"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Undo2 } from "lucide-react";
import { Knapp } from "@/components/precision/pa";
import { Dialogboks } from "@/components/precision/pa-a4";
import { type SlagtellerData, beregnProsent, formatDesimal } from "@/lib/portal-live/ph04-07-data";
import { leggIKo, listTapperKo, tomKo } from "@/lib/offline-queue/tapper-queue";
import { saveTapperCounts, finishTapperSession } from "@/app/portal/(fullscreen)/live/[sessionId]/tapper/actions";
import "@/styles/precision-athletics.css";
import "@/styles/precision-live.css";

interface PH06SlagtellerProps {
  data: SlagtellerData;
  onAddShot?: (club: string, count: number) => void;
  onFinish?: () => void;
}

export function PH06Slagteller({ data, onAddShot, onFinish }: PH06SlagtellerProps) {
  const router = useRouter();
  const [club, setClub] = useState(data.selectedClub);
  const [counts, setCounts] = useState<Record<string, number>>(() => data.countsByClub ?? Object.fromEntries(data.counts?.map((i) => [i.club, i.count]) ?? []));
  const countsRef = useRef(counts);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const finishRef = useRef(false);
  const [endOpen, setEndOpen] = useState(false);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const current = counts[club] ?? 0;
  const goal = data.totalShotsGoal;
  const clubs = Array.from(new Set([...data.bagClubs, ...Object.keys(counts)]));
  const payload = () => Object.entries(countsRef.current).map(([c, count]) => ({ club: c, count }));

  const persist = useCallback(async (send = true) => {
    if (!data.eierUserId) return false;
    const snapshot = Object.entries(countsRef.current).map(([c, count]) => ({ club: c, count }));
    const stored = await leggIKo(data.eierUserId, data.sessionId, snapshot);
    if (!send) return stored;
    if (!navigator.onLine) { setFeedback(stored ? "Lagret på denne enheten. Venter på nett." : "Ikke lagret. Hold økta åpen og prøv igjen."); return false; }
    setSaving(true);
    try {
      if (stored) {
        const result = await tomKo(data.eierUserId, data.sessionId, saveTapperCounts);
        const ok = result === "synket" || result === "tom";
        setFeedback(ok ? "Lagret" : "Tellingene venter på sending. Prøv igjen.");
        return ok;
      }
      const result = await saveTapperCounts(data.sessionId, snapshot);
      setFeedback(result.ok ? "Lagret. Lokal lagring er ikke tilgjengelig." : result.error ?? "Tellingen ble ikke lagret.");
      return result.ok;
    } catch { setFeedback(stored ? "Lagret på enheten. Sendingen venter." : "Ikke lagret. Prøv igjen."); return false; }
    finally { setSaving(false); }
  }, [data.eierUserId, data.sessionId]);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const rows = data.eierUserId ? await listTapperKo(data.eierUserId) : [];
      if (!active) return;
      const pending = rows.find((r) => r.sessionId === data.sessionId);
      if (pending) { const restored = Object.fromEntries(pending.counts.map((i) => [i.club, i.count])); countsRef.current = restored; setCounts(restored); setFeedback("Tellingene fra enheten venter på sending."); }
      setReady(true);
    };
    void restore();
    return () => { active = false; };
  }, [data.eierUserId, data.sessionId]);

  useEffect(() => {
    if (!ready) return;
    const online = () => { void persist(); };
    const hidden = () => { if (document.visibilityState === "hidden") void persist(false); };
    window.addEventListener("online", online); document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("online", online); document.removeEventListener("visibilitychange", hidden); };
  }, [ready, persist]);

  const add = (delta: number) => {
    if (!ready || finishRef.current) return;
    const next = { ...countsRef.current, [club]: Math.max(0, (countsRef.current[club] ?? 0) + delta) };
    countsRef.current = next; setCounts(next);
    onAddShot?.(club, next[club]);
    void persist();
  };
  const finish = async () => {
    if (finishRef.current) return;
    finishRef.current = true; setFinishing(true);
    try {
      if (onFinish && !data.eierUserId) { onFinish(); return; }
      if (!(await persist())) return;
      const result = await finishTapperSession(data.sessionId, payload());
      if (!result.ok) { setFeedback(result.error ?? "Økta ble ikke fullført."); return; }
      router.push("/portal/live/" + data.sessionId + "/summary");
    } catch { setFeedback("Økta ble ikke fullført. Tellingene er bevart; prøv igjen."); }
    finally { finishRef.current = false; setFinishing(false); }
  };
  const tm = data.trackmanShot;
  return <div className="pa-root pa-live ph06" data-theme="night" data-design="precision-athletics">
    <header className="pa-live__top"><Link className="pa-iconbtn" href={"/portal/live/" + data.sessionId + "/active"} aria-label="Til øvelsene"><ArrowLeft size={20} /></Link><span className="pa-live__context">Slagteller</span><button type="button" className="pa-btn pa-btn--ghost" disabled={finishing} onClick={() => setEndOpen(true)}>Avslutt</button></header>
    <main className="pa-live__main pa-live__main--tapper">
      <div><h1>Slag i økta</h1><p className="pa-live__instruction">{data.title}</p></div>
      <section className="pa-live__exercise" aria-label="Registrerte slag">
        <div className="pa-live__exercise-context"><span>{club || "Velg kølle"}</span><span>{total} slag totalt i økta</span></div>
        <div className="pa-live__quantity"><strong>{current}</strong><span>slag med {club}</span></div>
        {goal > 0 && <><progress value={beregnProsent(total, goal)} max={100} aria-label="Øktens planlagte slag" /><p className="pa-live__help">Planlagt mengde: {goal} slag i økta</p></>}
      </section>
      <section><h2>Køllevalg</h2><div className="pa-live__clubs" role="group" aria-label="Velg kølle">{clubs.map((c) => <button key={c} type="button" aria-pressed={c === club} disabled={finishing} onClick={() => setClub(c)}>{c}</button>)}</div></section>
      <p className="pa-live__status" role="status">{saving ? "Lagrer …" : feedback}</p>
      {feedback && feedback !== "Lagret" && <Knapp variant="secondary" disabled={saving || finishing} onClick={() => void persist()}>Prøv lagring igjen</Knapp>}
      <details className="pa-live__notes"><summary>TrackMan og målegrunnlag</summary><div className="pa-live__note-body">
        {tm ? <dl className="pa-live__summary">{[["Carry", formatDesimal(tm.carry) + " m"],["Club Speed",formatDesimal(tm.clubSpeed) + " mph"],["Ball Speed",formatDesimal(tm.ballSpeed) + " mph"],["Smash Factor",formatDesimal(tm.smashFactor,2)],["Launch Angle",formatDesimal(tm.launchAngle) + "°"],["Club Path",formatDesimal(tm.clubPath) + "°"]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>Det er ingen koblede TrackMan-målinger i denne visningen. Tellingene over registreres med trykk.</p>}
        <Link className="pa-live__secondary-link" href="/portal/analysere">Se egne målinger i Stats</Link>
      </div></details>
      <Link className="pa-live__secondary-link" href={"/portal/live/" + data.sessionId + "/active"} onClick={() => void persist()}>Tilbake til øvelsene</Link>
    </main>
    <footer className="pa-live__footer"><div className="pa-live__counter" style={{ marginTop: 0, width: "100%" }}>
      <button type="button" className="pa-live__count" disabled={!ready || current === 0 || finishing} aria-label="Angre ett slag med valgt kølle" onClick={() => add(-1)}><Undo2 size={22} /><span>Angre</span></button>
      <button type="button" className="pa-live__count" disabled={!ready || !club || finishing} onClick={() => add(5)}>+5 <span>slag</span></button>
      <button type="button" className="pa-live__count pa-live__count--add" disabled={!ready || !club || finishing} onClick={() => add(1)}>+1 <span>slag</span></button>
    </div></footer>
    <Dialogboks open={endOpen} onClose={() => { if (!finishing) setEndOpen(false); }} title="Lagre og avslutte økta?" footer={<><Knapp variant="secondary" disabled={finishing} onClick={() => setEndOpen(false)}>Fortsett</Knapp><Knapp loading={finishing} onClick={() => void finish()}>Lagre og avslutt</Knapp></>}><p>{total} slag er registrert. Økta fullføres først når tellingene er bekreftet lagret.</p><p role="status">{feedback}</p></Dialogboks>
  </div>;
}

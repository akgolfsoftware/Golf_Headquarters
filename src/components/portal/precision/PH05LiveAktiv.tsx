"use client";

/**
 * PH-05 Live aktiv i nytt design (pakke 2 Treningsøkten). Alltid lyst tema (Anders 14.10).
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, skjerm «aktiv». Stil: src/styles/playerhq-ny-okt.css.
 *
 * Avvik:
 *   - Én teller per øvelse (slag eller putter) i stedet for fire (Uten ball, Lav hastighet, Automatikk, Slag):
 *     økta lagrer bare ett repetisjonstall per øvelse.
 *   - Egen klokke per øvelse og dra for å endre rekkefølge er ikke med; økta har én klokke.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-05.
 *
 *
 * Stoppeklokke, øvelsesgrid med progresjon, aktivt drillkort,
 * store touchknapper for reps (Angre -1, +5, +1), snarvei til slagteller,
 * avslutte-modal og "Neste øvelse" / "Fullfør økt" (64 px).
 * Ingen hex eller rgba.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, Undo2, ArrowRight, Check, Video } from "lucide-react";
import { AkseMerke } from "@/components/precision/pa";
import {
  type LiveAktivData,
  formatClock,
  beregnProsent,
} from "@/lib/portal-live/ph04-07-data";
import { fullforWbLiveOkt, lagreWbOvelse, lagreWbOvelseVideo } from "@/lib/portal-live/wb-live-actions";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import "@/styles/precision-athletics.css";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-okt.css";

interface PH05LiveAktivProps {
  data: LiveAktivData;
  onFinish?: (reps: number[]) => void;
}

export function PH05LiveAktiv({ data, onFinish }: PH05LiveAktivProps) {
  const router = useRouter();
  const drills = data.drills || [];
  const empty = drills.length === 0;

  const [cur, setCur] = useState(0);
  const [reps, setReps] = useState<number[]>(() =>
    drills.map((d) => d.repsCompleted || 0),
  );
  const [pause, setPause] = useState(data.pauset ?? false);
  const [endOpen, setEndOpen] = useState(false);
  const [seconds, setSeconds] = useState(data.initialSeconds || 0);

  // Workbench-økt: reps, kommentar og video lagres per øvelse (krav 2).
  const lagrer = data.lagring === "workbench";
  const [kommentarer, setKommentarer] = useState<string[]>(() => drills.map((d) => d.kommentar ?? ""));
  const [videoer, setVideoer] = useState<number[]>(() => drills.map((d) => d.videoer ?? 0));
  const [lagreStatus, setLagreStatus] = useState<"lagret" | "lagrer" | "feil" | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [fullforer, setFullforer] = useState(false);
  const venter = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const videoInput = useRef<HTMLInputElement>(null);

  const lagreOvelse = async (idx: number, verdier: { reps: number; kommentar?: string }) => {
    const drill = drills[idx];
    if (!lagrer || !drill) return;
    setLagreStatus("lagrer");
    try {
      const res = await lagreWbOvelse(data.sessionId, { drillId: drill.id, ...verdier });
      setLagreStatus(res.ok ? "lagret" : "feil");
      setFeil(res.ok ? null : res.error);
    } catch {
      setLagreStatus("feil");
      setFeil("Ikke lagret. Sjekk nettet; tallet sendes igjen ved neste endring.");
    }
  };

  // Lagrer hele tallet etter en kort pause i trykkingen.
  const planleggLagring = (idx: number, verdi: number) => {
    if (!lagrer) return;
    const forrige = venter.current.get(idx);
    if (forrige) clearTimeout(forrige);
    venter.current.set(idx, setTimeout(() => {
      venter.current.delete(idx);
      void lagreOvelse(idx, { reps: verdi });
    }, 700));
  };

  const lastOppVideo = async (file: File) => {
    const drill = drills[cur];
    if (!drill) return;
    setVideoBusy(true);
    setFeil(null);
    try {
      const form = new FormData();
      form.append("bucket", STORAGE_BUCKETS.PLAYER_SWING_VIDEOS);
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const body = (await up.json()) as { ok?: boolean; url?: string; path?: string; error?: string };
      if (!up.ok || !body.ok || !body.url || !body.path) {
        setFeil(body.error ?? "Videoen ble ikke lastet opp.");
        return;
      }
      const res = await lagreWbOvelseVideo(data.sessionId, { drillId: drill.id, videoUrl: body.url, storagePath: body.path });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setVideoer((prev) => prev.map((v, i) => (i === cur ? v + 1 : v)));
    } catch {
      setFeil("Videoen ble ikke lastet opp.");
    } finally {
      setVideoBusy(false);
    }
  };

  const fullforOgLagre = async () => {
    if (!lagrer) return false;
    setFullforer(true);
    setFeil(null);
    for (const t of venter.current.values()) clearTimeout(t);
    venter.current.clear();
    try {
      const res = await fullforWbLiveOkt(
        data.sessionId,
        drills.map((d, i) => ({ drillId: d.id, reps: reps[i] || 0, kommentar: kommentarer[i] ?? "" })),
      );
      if (!res.ok) {
        setFeil(res.error);
        return true;
      }
      router.push(res.href);
    } catch {
      setFeil("Økta ble ikke lagret. Sjekk nettet og prøv igjen.");
    } finally {
      setFullforer(false);
    }
    return true;
  };

  // Stoppeklokke
  useEffect(() => {
    if (pause || empty) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pause, empty]);

  const add = (n: number) => {
    const neste = Math.max(0, (reps[cur] || 0) + n);
    setReps((prev) => prev.map((val, idx) => (idx === cur ? neste : val)));
    planleggLagring(cur, neste);
  };

  const activeDrill = drills[cur] || {
    id: "unknown",
    name: "Ingen øvelse",
    code: "DR-00",
    quantity: 1,
    unit: "slag",
    axis: "slag" as const,
  };

  const curReps = reps[cur] || 0;
  const isLast = cur === drills.length - 1;
  const totalRepsSum = reps.reduce((a, b) => a + b, 0);

  const handleNextOrFinish = () => {
    if (isLast) {
      if (lagrer) {
        void fullforOgLagre();
      } else if (onFinish) {
        onFinish(reps);
      } else {
        router.push(`/portal/live/${data.sessionId}/summary`);
      }
    } else {
      setCur((c) => Math.min(drills.length - 1, c + 1));
    }
  };

  const handleEndConfirmed = () => {
    setEndOpen(false);
    if (lagrer) {
      void fullforOgLagre();
    } else if (onFinish) {
      onFinish(reps);
    } else {
      router.push(`/portal/live/${data.sessionId}/summary`);
    }
  };

  const pct = beregnProsent(curReps, activeDrill.quantity);
  return <div className="pa-root phn phn-okt" data-theme="light" data-od-id="playerhq-live-aktiv" style={{ minHeight: "100dvh" }}>
    <div className="smal">
      <div className="hode-okt">
        <div className="okt-rad"><span className="pille-live"><i />Live</span>
          <span className="phn-knapper">
            <button type="button" className="phn-knapp sek" onClick={() => setPause(!pause)} aria-pressed={pause}>{pause ? <Play size={18} /> : <Pause size={18} />}{pause ? "Fortsett" : "Pause"}</button>
            <button type="button" className="phn-knapp sek" onClick={() => setEndOpen(true)}>Avslutt</button>
          </span>
        </div>
        <h1>{data.title}</h1>
        <div className="klokkerad"><span className="oktklokke" aria-label={`Tid ${formatClock(seconds)}`}><span>ØKTEN</span>{formatClock(seconds)}</span><span className="sub">{pause ? "Pause" : `av ${data.totalMinutes} min`}</span></div>
      </div>

      {empty ? <section className="phn-kort dempet"><b className="undertittel">Ingen øvelser i økten</b><p className="phn-forklar">Økten har ingen øvelser å registrere. Du kan avslutte og lagre den.</p></section> : <>
        <div className="stripe" role="list" aria-label="Øvelser">
          {drills.map((drill, idx) => {
            const ferdig = (reps[idx] || 0) >= drill.quantity && drill.quantity > 0;
            return <button key={drill.id || idx} role="listitem" type="button" className="fan" onClick={() => setCur(idx)} aria-current={idx === cur ? "step" : undefined} aria-label={`Øvelse ${idx + 1}: ${drill.name}${ferdig ? ", gjennomført" : ""}`}>
              <i className={idx === cur ? "na" : ferdig ? "ok" : ""}>{ferdig && idx !== cur ? <Check size={16} /> : idx + 1}</i>
            </button>;
          })}
        </div>

        <section className="phn-kort" aria-label="Aktiv øvelse">
          <div className="okt-rad"><span className="phn-dato">Øvelse {cur + 1} av {drills.length}</span><AkseMerke axis={activeDrill.axis} /></div>
          <b className="undertittel" style={{ fontSize: 20 }}>{activeDrill.name}</b>
          {activeDrill.code && <span className="sub">{activeDrill.code}</span>}
          <div className="teller">
            <div className="teller-topp"><b>{activeDrill.unit === "putter" ? "Putter" : "Slag"}</b><span className="teller-tall" aria-live="polite">{curReps}<small>av {activeDrill.quantity > 0 ? activeDrill.quantity : "—"}</small></span></div>
            <div className="phn-stolpe-lys" aria-hidden><span style={{ width: `${pct}%` }} /></div>
            <div className="trinn">
              <button type="button" aria-label="Angre én" onClick={() => add(-1)}><Undo2 size={18} /> −1</button>
              <button type="button" onClick={() => add(1)}>+1</button>
              <button type="button" onClick={() => add(5)}>+5</button>
            </div>
          </div>
        </section>

        {lagrer && drills[cur] && <section className="phn-kort" aria-label="Kommentar og video">
          <label className="phn-felt" htmlFor="ph05-kommentar">Kommentar til øvelsen
            <textarea id="ph05-kommentar" rows={3} maxLength={1000} value={kommentarer[cur] ?? ""}
              onChange={(e) => { const verdi = e.target.value; setKommentarer((prev) => prev.map((k, i) => (i === cur ? verdi : k))); }}
              onBlur={() => void lagreOvelse(cur, { reps: reps[cur] || 0, kommentar: kommentarer[cur] ?? "" })} />
          </label>
          <input ref={videoInput} type="file" accept="video/*" capture="environment" hidden
            onChange={(e) => { const fil = e.target.files?.[0]; e.target.value = ""; if (fil) void lastOppVideo(fil); }} />
          <div className="phn-knapper">
            <button type="button" className="phn-knapp sek" disabled={videoBusy} onClick={() => videoInput.current?.click()}><Video size={18} />{videoBusy ? "Laster opp …" : "Legg til video"}</button>
            {(videoer[cur] ?? 0) > 0 && <span className="sub">{videoer[cur]} lagret</span>}
          </div>
          <p role="status" aria-live="polite" className="sub" style={{ minHeight: 20 }}>{feil ?? (lagreStatus === "lagrer" ? "Lagrer …" : lagreStatus === "lagret" ? "Lagret" : "")}</p>
        </section>}

        <Link href={`/portal/live/${data.sessionId}/tapper`} className="phn-knapp sek" style={{ justifySelf: "start" }}>Åpne slagtelleren med kølle og TrackMan</Link>
      </>}

      <div className="startbar">
        {!lagrer && feil && <p role="status" className="sub">{feil}</p>}
        <button type="button" className="phn-knapp pri stor" onClick={empty ? () => setEndOpen(true) : handleNextOrFinish} disabled={fullforer}>
          {empty ? "Avslutt økten" : isLast ? "Fullfør økt" : "Neste øvelse"}{!empty && (isLast ? <Check size={20} /> : <ArrowRight size={20} />)}
        </button>
      </div>
    </div>

    {endOpen && <div className="pa-scrim" onClick={() => setEndOpen(false)}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-label="Avslutte økta?" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="pa-dialog__head"><div className="pa-dialog__title">Avslutte økta?</div></div>
        <div className="pa-dialog__body"><p style={{ margin: 0 }}>{totalRepsSum} repetisjoner er registrert. Øvelser som ikke er fullført lagres som ikke gjennomført.</p></div>
        <div className="pa-dialog__foot"><div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
          <button type="button" className="pa-btn pa-btn--secondary" onClick={() => setEndOpen(false)}>Fortsett</button>
          <button type="button" className="pa-btn pa-btn--danger" onClick={handleEndConfirmed}>Avslutt og lagre</button>
        </div></div>
      </div>
    </div>}
  </div>;
}

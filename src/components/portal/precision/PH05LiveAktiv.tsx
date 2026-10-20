"use client";

/**
 * PH-05 Live aktiv i designløftet 20.10.2026. Alltid lyst tema (Anders 14.10).
 * Fasit: Claude Design-canvaset «PlayerHQ nøkkelskjermer» (https://claude.ai/artifact/XdsbBEHwJhdrD4YJMMpdK1),
 * «3 Live-økt · mobil 390» og «PC 1280». Stil: src/styles/playerhq-ny-okt.css (§Designløft Live).
 *
 * Avvik:
 *   - Én teller per øvelse (slag eller putter) i stedet for fire (Uten ball, Lav hastighet, Automatikk, Slag):
 *     økta lagrer bare ett repetisjonstall per øvelse. Fire tellere krever et tillegg i datamodellen (venter).
 *   - Øvelsesklokka er lokal (teller mens økta ikke er på pause) og lagres ikke; den viser tid mot øvelsens planlagte minutter.
 *   - Teknisk oppgave med video og dra for å endre rekkefølge er ikke med; økta har én rekkefølge.
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
import { Play, Pause, ArrowRight, Check, Video } from "lucide-react";
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

const MOTORIKK: Record<string, string> = { UTEN_BALL: "Uten ball", LAV_HAST: "Lav hastighet", AUTO: "Automatikk" };
/** «SLAG_INNSPILL_AUTO» gir merkene «SLAG», «Innspill» og «Automatikk». Ukjente koder gir færre merker, aldri gjetting. */
function lagMerker(code: string | undefined): string[] {
  if (!code) return [];
  const deler = code.split("_");
  const ut: string[] = [];
  if (deler[0]) ut.push(deler[0]);
  if (deler[1]) ut.push(deler[1].charAt(0) + deler[1].slice(1).toLowerCase());
  const motor = deler.slice(2).join("_");
  if (MOTORIKK[motor]) ut.push(MOTORIKK[motor]!);
  return ut;
}

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
  const [drillSek, setDrillSek] = useState<number[]>(() => drills.map(() => 0));

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
      setDrillSek((d) => d.map((v, i) => (i === cur ? v + 1 : v)));
    }, 1000);
    return () => clearInterval(interval);
  }, [pause, empty, cur]);

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
  const igjenReps = Math.max(0, activeDrill.quantity - curReps);
  const naadd = activeDrill.quantity > 0 && curReps >= activeDrill.quantity;
  const planSum = drills.reduce((n, d) => n + d.quantity, 0);
  const planMin = drills.reduce((n, d) => n + d.minutes, 0);
  const neste = drills[cur + 1];
  const drillMin = Math.floor((drillSek[cur] ?? 0) / 60);
  const drillPct = activeDrill.minutes > 0 ? Math.min(100, ((drillSek[cur] ?? 0) / (activeDrill.minutes * 60)) * 100) : 0;
  const merker = lagMerker(activeDrill.code);
  const naesteTekst = isLast ? "Fullfør økta" : `Neste: ${neste?.name ?? ""}`;
  return <div className="pa-root phn phn-okt phn-lv" data-theme="light" data-od-id="playerhq-live-aktiv" style={{ minHeight: "100dvh" }}>
    <header className="lv-hode">
      <button type="button" className="lv-tekstknapp" onClick={() => setEndOpen(true)}>Avslutt</button>
      <span className="lv-midt"><b>{data.title}</b><small>{pause ? "På pause" : "Pågår"}</small></span>
      <span className="lv-klokke" aria-label={`Tid ${formatClock(seconds)}`}><b>{formatClock(seconds)}</b><small>av {formatClock(data.totalMinutes * 60)}</small></span>
    </header>

    {empty ? <div className="lv-side"><section className="phn-kort dempet"><b className="undertittel">Ingen øvelser i økten</b><p className="phn-forklar">Økten har ingen øvelser å registrere. Du kan avslutte og lagre den.</p></section>
      <div className="lv-bunn"><button type="button" className="phn-knapp pri stor" onClick={() => setEndOpen(true)}>Avslutt økten</button></div></div> : <>
      <div className="lv-fremdrift" role="img" aria-label={`Øvelse ${cur + 1} av ${drills.length}`}>
        {drills.map((d, i) => <i key={d.id || i} className={i === cur ? "na" : i < cur || ((reps[i] || 0) >= d.quantity && d.quantity > 0) ? "ok" : ""} style={{ flex: Math.max(1, d.minutes) }} />)}
      </div>

      <div className="lv-side">
        <div className="lv-hoved">
          <div className="lv-ovelse">
            <span className={`lv-eyebrow lv-ak-${activeDrill.axis}`}>Øvelse {cur + 1} av {drills.length}{activeDrill.minutes ? ` · ${activeDrill.minutes} min` : ""}</span>
            <h1>{activeDrill.name}</h1>
            <span className="lv-merker">{merker.map((m) => <span key={m}>{m}</span>)}</span>
          </div>

          <section className="lv-reps" aria-label="Repetisjoner mot planen">
            <div className="lv-reps-topp"><b>Repetisjoner mot planen</b><span>{totalRepsSum} av {planSum || "—"}</span></div>
            <div className="lv-teller">
              <span className="lv-etikett"><span>{activeDrill.unit === "putter" ? "Putter" : "Slag"}</span></span>
              <b className="teller-tall" aria-live="polite">{curReps}<small>av {activeDrill.quantity > 0 ? activeDrill.quantity : "—"}</small></b>
              <span className="lv-spor" aria-hidden><i className={naadd ? "ok" : ""} style={{ width: `${pct}%` }} /></span>
              <span className={`lv-status${naadd ? " ok" : ""}`}>{activeDrill.quantity <= 0 ? "Ingen plan satt" : naadd ? "Nådd planen" : `${igjenReps} igjen`}</span>
              <span className="lv-trinn">
                <button type="button" aria-label="Minus 1" onClick={() => add(-1)}>−1</button>
                <button type="button" className="pluss" aria-label="Pluss 1" onClick={() => add(1)}>+1</button>
                <button type="button" aria-label="Pluss 5" onClick={() => add(5)}>+5</button>
              </span>
            </div>
          </section>

          <div className="lv-handling">
            <button type="button" className="lv-pause" onClick={() => setPause(!pause)} aria-pressed={pause}>{pause ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}{pause ? "Fortsett" : "Pause"}</button>
            <button type="button" className="lv-neste" onClick={handleNextOrFinish} disabled={fullforer}>
              <span><b>{isLast ? "Fullfør økta" : "Ferdig med øvelsen"}</b><small>{naesteTekst}</small></span>
              {isLast ? <Check size={20} aria-hidden /> : <ArrowRight size={20} aria-hidden />}
            </button>
          </div>
          {!lagrer && feil && <p role="status" className="sub">{feil}</p>}
        </div>

        <aside className="lv-aside">
          <section className="lv-klokke-kort" aria-label="Øvelsen">
            <span><span>Øvelsen</span><b>{formatClock(drillSek[cur] ?? 0)}<small> / {formatClock(activeDrill.minutes * 60)}</small></b></span>
            <span className="lv-spor" aria-hidden><i style={{ width: `${drillPct}%` }} /></span>
            <small>{drillMin} av {activeDrill.minutes} min · planlagt tid for øvelsen</small>
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

          <section className="lv-liste" aria-label="Øvelsene">
            <b>Øvelsene · {planMin} min</b>
            {drills.map((d, i) => {
              const ferdig = i < cur || ((reps[i] || 0) >= d.quantity && d.quantity > 0 && i !== cur);
              return <button key={d.id || i} type="button" className={i === cur ? "na" : ""} aria-current={i === cur ? "step" : undefined} onClick={() => setCur(i)}
                aria-label={`Øvelse ${i + 1}: ${d.name}${ferdig ? ", gjennomført" : ""}`}>
                <i className={ferdig ? "ok" : ""}>{ferdig ? <Check size={14} aria-hidden /> : i + 1}</i>
                <span>{d.name}</span><small>{d.minutes} min</small>
              </button>;
            })}
          </section>
          <Link href={`/portal/live/${data.sessionId}/tapper`} className="phn-knapp sek">Åpne slagtelleren med kølle og TrackMan</Link>
        </aside>
      </div>
    </>}

    {endOpen && <div className="pa-scrim" onClick={() => setEndOpen(false)}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-label="Avslutte økta?" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="pa-dialog__head"><div className="pa-dialog__title">Avslutte økta?</div></div>
        <div className="pa-dialog__body"><p style={{ margin: 0 }}>{totalRepsSum} repetisjoner er registrert. Øvelser som ikke er fullført lagres som ikke gjennomført.</p></div>
        <div className="pa-dialog__foot"><div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
          <button type="button" className="pa-btn pa-btn--secondary" onClick={() => setEndOpen(false)}>Fortsett</button>
          <button type="button" className="pa-btn pa-btn--signal" onClick={handleEndConfirmed}>Avslutt og lagre</button>
        </div></div>
      </div>
    </div>}
  </div>;
}

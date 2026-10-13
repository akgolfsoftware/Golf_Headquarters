"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Pause, Play, Undo2, Video } from "lucide-react";
import { AkseMerke, Knapp, StatusPille } from "@/components/precision/pa";
import { Dialogboks } from "@/components/precision/pa-a4";
import { MicButton } from "@/components/shared/mic-button";
import { usePrecisionLive } from "@/components/portal/live/use-precision-live";
import { FysPrecisionLogger } from "@/components/portal/live/FysPrecisionLogger";
import { lesFysRegistrering } from "@/lib/portal-live/fys-registrering";
import { type LiveAktivData, beregnProsent, formatClock } from "@/lib/portal-live/ph04-07-data";
import { lagreLiveOvelseVideo } from "@/lib/portal-live/session-actions";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import "@/styles/precision-athletics.css";
import "@/styles/precision-live.css";

interface PH05LiveAktivProps { data: LiveAktivData; onFinish?: (reps: number[]) => void }

/** Aktiv økt bruker samme lagringsreise i Workbench, V2 og spillerplan. */
export function PH05LiveAktiv({ data, onFinish }: PH05LiveAktivProps) {
  const router = useRouter();
  const live = usePrecisionLive(data);
  const [endOpen, setEndOpen] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoFeedback, setVideoFeedback] = useState("");
  const [videoCounts, setVideoCounts] = useState(() => data.drills.map((d) => d.videoer ?? 0));
  const videoInput = useRef<HTMLInputElement>(null);
  const drill = data.drills[live.current];
  const item = live.items[live.current];
  const logged = live.items.filter((i) => i.reps > 0).length;
  const physical = item ? lesFysRegistrering(item.kommentar) : null;
  const commentText = physical?.notat ?? item?.kommentar ?? "";
  const last = live.current === data.drills.length - 1;
  const busy = live.finishing || videoBusy;

  const finish = async () => {
    if (!data.lagring && onFinish) { onFinish(live.items.map((i) => i.reps)); return; }
    const href = await live.finish();
    if (href) router.push(href);
  };
  const addVideo = async (file: File) => {
    if (!drill || videoBusy) return;
    setVideoBusy(true);
    setVideoFeedback("");
    const index = live.current;
    try {
      const form = new FormData();
      form.append("bucket", STORAGE_BUCKETS.PLAYER_SWING_VIDEOS);
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const upload: { ok?: boolean; path?: string; error?: string } = await response.json();
      if (!response.ok || !upload.ok || !upload.path) { setVideoFeedback(upload.error ?? "Videoen ble ikke lastet opp."); return; }
      const result = await lagreLiveOvelseVideo(data.sessionId, { drillId: drill.id, storagePath: upload.path });
      if (!result.ok) { setVideoFeedback(result.error); return; }
      setVideoCounts((values) => values.map((count, n) => n === index ? count + 1 : count));
      setVideoFeedback("Videoen er lagret på øvelsen.");
    } catch { setVideoFeedback("Videoen ble ikke lagret. Behold filen og prøv igjen."); }
    finally { setVideoBusy(false); }
  };

  return <div className="pa-root pa-live ph05" data-theme="night" data-design="precision-athletics">
    <header className="pa-live__top">
      <Link className="pa-iconbtn" href="/portal" aria-label="Til I dag"><ArrowLeft size={20} /></Link>
      <div className="pa-live__context"><StatusPille tone="live">Live</StatusPille><span>{data.title}</span></div>
      <button type="button" className="pa-btn pa-btn--secondary" disabled={!live.ready || live.pauseBusy || busy} onClick={() => void live.togglePause()}>
        {live.paused ? <Play size={18} /> : <Pause size={18} />}{live.paused ? "Fortsett" : "Pause"}
      </button>
    </header>
    <main className="pa-live__main">
      <div className="pa-live__overview">
        <div><span className="pa-live__label">Tid i økta</span><span className="pa-live__clock" role="timer" aria-live="off">{formatClock(live.seconds)}</span></div>
        <div className="pa-live__plan"><span>{live.paused ? "På pause" : "Økta pågår"}</span>{data.totalMinutes > 0 && <span>Planlagt {data.totalMinutes} min</span>}</div>
      </div>
      {data.drills.length > 0 ? <>
        <nav aria-label="Øvelser i økta" className="pa-live__steps"><ol>
          {data.drills.map((d, index) => <li key={d.id}><button type="button" disabled={busy} aria-current={index === live.current ? "step" : undefined} aria-label={"Øvelse " + (index + 1) + ": " + d.name} onClick={() => live.select(index)}>
            <span>{index + 1}</span><span className="pa-live__step-name">{d.name}</span>{live.items[index]?.status === "done" && <Check size={16} aria-label="Registrert" />}
          </button></li>)}
        </ol></nav>
        {drill && item && <section className="pa-live__exercise" aria-labelledby="ph05-exercise-title">
          <div className="pa-live__exercise-context"><AkseMerke axis={drill.axis} /><span>Øvelse {live.current + 1} av {data.drills.length}</span></div>
          <h1 id="ph05-exercise-title">{drill.name}</h1>
          {drill.param && <p className="pa-live__instruction">{drill.param}</p>}
          {drill.axis === "fys" ? <FysPrecisionLogger drill={drill} value={physical} onChange={live.fys} disabled={!live.ready || busy} /> : <>
          <div className="pa-live__quantity"><strong>{item.reps}</strong><span>{drill.quantity > 0 ? "av " + drill.quantity + " " : ""}{drill.unit}</span></div>
          {drill.quantity > 0 && <progress aria-label="Registrert mengde" value={beregnProsent(item.reps, drill.quantity)} max={100} />}
          <div className="pa-live__counter">
            <button type="button" className="pa-live__count" aria-label="Angre én registrering" disabled={!live.ready || item.reps === 0 || busy} onClick={() => live.add(-1)}><Undo2 size={22} /><span>Angre</span></button>
            <button type="button" className="pa-live__count" disabled={!live.ready || busy} onClick={() => live.add(5)}>+5 <span>{drill.unit}</span></button>
            <button type="button" className="pa-live__count pa-live__count--add" disabled={!live.ready || busy} onClick={() => live.add(1)}>+1 <span>{drill.unit}</span></button>
          </div></>}
        </section>}
        <div className="pa-live__status" role="status" aria-live="polite">
          {live.saving ? "Lagrer …" : live.feedback}
          {live.needsRetry && !live.saving && <button className="pa-btn pa-btn--ghost" type="button" onClick={() => void live.persist()}>Prøv lagring igjen</button>}
        </div>
        {drill && item && <details className="pa-live__notes">
          <summary>Kommentar og video{videoCounts[live.current] > 0 ? " · " + videoCounts[live.current] + " videoer" : ""}</summary>
          <div className="pa-live__note-body">
            <div className="pa-live__fieldhead"><label htmlFor="ph05-kommentar">Kommentar til øvelsen</label><MicButton variant="suffix" disabled={busy} onResult={(text) => live.comment((commentText ? commentText + " " : "") + text)} /></div>
            <textarea id="ph05-kommentar" rows={3} maxLength={1000} value={commentText} disabled={busy} onChange={(e) => live.comment(e.target.value)} onBlur={() => void live.persist()} />
            <p className="pa-live__help">Se gjennom teksten før du går videre. Kommentaren følger denne øvelsen.</p>
            <input ref={videoInput} type="file" accept="video/mp4,video/quicktime,video/webm" capture="environment" hidden onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void addVideo(file); }} />
            <Knapp variant="secondary" icon={Video} loading={videoBusy} loadingText="Laster opp …" disabled={live.finishing} onClick={() => videoInput.current?.click()}>Legg til video</Knapp>
            <p role="status">{videoFeedback}</p>
            {drill.code && <p className="pa-live__source">Øvelseskode: {drill.code}</p>}
          </div>
        </details>}
        <Link className="pa-live__secondary-link" href={"/portal/live/" + data.sessionId + "/tapper"}>Åpne slagtelleren med køllevalg <ArrowRight size={18} /></Link>
      </> : <section className="pa-live__empty"><h1>Økta har ingen øvelser</h1><p>Åpne planen og legg til øvelser før du begynner.</p><Link className="pa-btn pa-btn--primary" href="/portal/planlegge/workbench">Åpne planen</Link></section>}
    </main>
    {drill && <footer className="pa-live__footer"><div>
      <Knapp size="xl" fullWidth loading={live.finishing} loadingText="Lagrer økta …" disabled={!live.ready || videoBusy} iconRight={last ? Check : ArrowRight} onClick={() => last ? setEndOpen(true) : live.next()}>{last ? "Avslutt økt" : "Neste øvelse"}</Knapp>
      {!last && <button type="button" className="pa-btn pa-btn--ghost" disabled={busy} onClick={() => setEndOpen(true)}>Avslutt nå</button>}
    </div></footer>}
    <Dialogboks open={endOpen} onClose={() => { if (!live.finishing) setEndOpen(false); }} title="Lagre og avslutte økta?" footer={<><Knapp variant="secondary" disabled={live.finishing} onClick={() => setEndOpen(false)}>Fortsett økta</Knapp><Knapp loading={live.finishing} disabled={videoBusy} onClick={() => void finish()}>Lagre og avslutt</Knapp></>}>
      <p>{logged} av {data.drills.length} øvelser har registrert mengde. Oppsummeringen viser det du faktisk har registrert, også når du avslutter før planen er fullført.</p>
      {live.feedback && <p role="status">{live.feedback}</p>}
    </Dialogboks>
  </div>;
}

"use client";

/**
 * AgencyOS v2 — Sesjon-opptak (`/admin/recording`, AgencyOS Bølge 3.11,
 * 2026-07-14). Port fra `(legacy)/recording/page.tsx` + `recording-controls.tsx`
 * + `recording-analyze-button.tsx` — MediaRecorder/chunk-opplasting/Wake Lock/
 * batteri-overvåking/recovery-logikken er uendret (kun JSX-laget er re-skinnet
 * til v2-tokens); samme `/api/recording/*`-kontrakt og `SessionRecording`-modell.
 */

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, KpiFlis, type StatusTone } from "@/components/v2";

type PipelineStatus = "done" | "active" | "idle";
export interface PipelineStepV2 {
  label: string;
  meta: string;
  status: PipelineStatus;
}

export interface OpptakRadV2 {
  id: string;
  datoTekst: string;
  statusLabel: string;
  statusTone: StatusTone;
  varighetTekst: string | null;
  audioUrl: string | null;
  transcript: string | null;
  kanAnalysere: boolean;
  harTranskripsjon: boolean;
}

export interface AdminOpptakV2Data {
  harDeepgramKey: boolean;
  activeRecordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAtTekst: string | null;
  userNavn: string;
  harAktivt: boolean;
  aktivProsesserer: boolean;
  aktivVarighetSek: number;
  pipeline: PipelineStepV2[];
  transkripsjonLinjer: string[];
  totalt: number;
  ferdig: number;
  behandles: number;
  feilet: number;
  opptak: OpptakRadV2[];
}

const WAVE: number[] = Array.from({ length: 120 }, (_, i) => {
  const h = 6 + Math.abs(Math.sin(i * 0.4) * 40) + Math.abs(Math.sin(i * 0.13) * 30);
  return Math.round(h);
});

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type WakeLockSentinel = { released: boolean; release: () => Promise<void> };
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } };
type BatteryManager = { level: number; charging: boolean; addEventListener: (type: string, listener: () => void) => void; removeEventListener: (type: string, listener: () => void) => void };
type BatteryNavigator = Navigator & { getBattery?: () => Promise<BatteryManager> };

type Mode = "idle" | "recovery" | "recording" | "paused" | "finalizing";
type Banner = { tone: "info" | "success" | "warn" | "error"; text: string } | null;
const CHUNK_MS = 30_000;

function PipelineNodeV2({ step }: { step: PipelineStepV2 }) {
  const aktiv = step.status === "active" || step.status === "done";
  const iconName = step.status === "active" ? "loader" : step.status === "done" ? "check" : "circle-dot";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 200 }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, border: `2px solid ${aktiv ? T.lime : T.border}`, background: aktiv ? `color-mix(in srgb, ${T.lime} 10%, transparent)` : T.panel2, display: "grid", placeItems: "center" }}>
        <Icon name={iconName} size={20} style={{ color: aktiv ? T.lime : T.mut, ...(step.status === "active" ? { animation: "v2spin 1s linear infinite" } : null) }} />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{step.label}</div>
      <div style={{ fontFamily: T.ui, fontSize: 12, color: step.status === "done" || step.status === "active" ? T.lime : T.mut }}>{step.meta}</div>
    </div>
  );
}

function RecordingControlsV2({
  recordingId,
  recoveryRecordingId,
  recoveryStartedAt,
  topbar,
  stage,
}: {
  recordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAt: string | null;
  topbar: ReactNode;
  stage: ReactNode;
}) {
  const router = useRouter();
  const [skjult, setSkjult] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [mode, setMode] = useState<Mode>(() => {
    if (recordingId) return "idle";
    if (recoveryRecordingId) return "recovery";
    return "idle";
  });
  const [elapsedSec, setElapsedSec] = useState(0);
  const [chunkInfo, setChunkInfo] = useState<string | null>(null);
  const [batteryWarn, setBatteryWarn] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const chunkIdxRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (mode === "recording" || mode === "paused") {
      if (!startedAtRef.current) startedAtRef.current = Date.now();
      tickRef.current = setInterval(() => {
        if (mode === "recording" && startedAtRef.current) {
          setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
      }, 1000);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
  }, [mode]);

  useEffect(() => {
    const nav = navigator as BatteryNavigator;
    if (!nav.getBattery) return;
    let battery: BatteryManager | null = null;
    let mounted = true;
    const check = () => {
      if (!battery || !mounted) return;
      setBatteryWarn(!battery.charging && battery.level < 0.2);
    };
    nav.getBattery().then((b) => {
      if (!mounted) return;
      battery = b;
      b.addEventListener("levelchange", check);
      b.addEventListener("chargingchange", check);
      check();
    });
    return () => {
      mounted = false;
      if (battery) {
        battery.removeEventListener("levelchange", check);
        battery.removeEventListener("chargingchange", check);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      releaseWakeLock();
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  async function releaseWakeLock() {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
    }
    wakeLockRef.current = null;
  }

  async function requestWakeLock() {
    const nav = navigator as WakeLockNavigator;
    if (!nav.wakeLock) return;
    try {
      wakeLockRef.current = await nav.wakeLock.request("screen");
    } catch (err) {
      console.warn("[recording] wake lock denied", err);
    }
  }

  function uploadChunk(idx: number, blob: Blob): Promise<void> {
    if (!recordingId) return Promise.resolve();
    return new Promise<void>((resolve) => {
      uploadQueueRef.current = uploadQueueRef.current.then(async () => {
        const form = new FormData();
        form.append("recordingId", recordingId);
        form.append("chunkIdx", String(idx));
        form.append("chunk", blob, `chunk-${idx}.webm`);
        try {
          const res = await fetch("/api/recording/upload-chunk", { method: "POST", body: form });
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            setBanner({ tone: "warn", text: `Klarte ikke å lagre chunk ${idx} — prøver igjen ved neste. (${j.error ?? res.status})` });
          } else {
            setChunkInfo(`Lagret chunk ${idx + 1} (${formatTimer(elapsedSec)})`);
          }
        } catch (err) {
          console.error("[recording] upload feilet", err);
          setBanner({ tone: "warn", text: "Kobling avbrutt — prøver igjen automatisk." });
        } finally {
          resolve();
        }
      });
    });
  }

  async function startRecording() {
    if (!recordingId) {
      setBanner({ tone: "error", text: "Mangler recording-ID — start fra en booking først." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 32000 });
      recorderRef.current = recorder;
      chunkIdxRef.current = 0;
      recorder.ondataavailable = (ev) => {
        if (!ev.data || ev.data.size === 0) return;
        const idx = chunkIdxRef.current;
        chunkIdxRef.current = idx + 1;
        void uploadChunk(idx, ev.data);
      };
      recorder.start(CHUNK_MS);
      startedAtRef.current = Date.now();
      setMode("recording");
      setElapsedSec(0);
      setBanner({ tone: "info", text: "Opptak startet. Lagrer hvert 30. sekund." });
      await requestWakeLock();
    } catch (err) {
      console.error("[recording] getUserMedia feilet", err);
      setBanner({ tone: "error", text: "Klarte ikke å aktivere mikrofon. Sjekk tilganger i nettleseren." });
    }
  }

  function pauseRecording() {
    const rec = recorderRef.current;
    if (!rec) return;
    if (mode === "recording" && rec.state === "recording") {
      rec.pause();
      setMode("paused");
      setBanner({ tone: "info", text: "Opptak på pause." });
    } else if (mode === "paused" && rec.state === "paused") {
      rec.resume();
      setMode("recording");
      setBanner({ tone: "info", text: "Opptak fortsetter." });
    }
  }

  async function stopRecording() {
    if (!recordingId) return;
    const rec = recorderRef.current;
    setMode("finalizing");
    if (rec && (rec.state === "recording" || rec.state === "paused")) {
      await new Promise<void>((resolve) => {
        rec.addEventListener("stop", () => resolve(), { once: true });
        rec.stop();
      });
    }
    stopStream();
    await releaseWakeLock();
    await uploadQueueRef.current;
    setBanner({ tone: "info", text: "Avslutter og merger chunks …" });
    try {
      const res = await fetch("/api/recording/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId, durationSec: elapsedSec }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({ tone: "error", text: `Klarte ikke å fullføre: ${j.error ?? res.status}` });
        setMode("idle");
        return;
      }
      setBanner({ tone: "success", text: "Opptak lagret. Transkribering og AI-analyse trigges når pipelinen er på." });
      setMode("idle");
      router.refresh();
    } catch (err) {
      console.error("[recording] complete feilet", err);
      setBanner({ tone: "error", text: "Nettverksfeil ved fullføring." });
      setMode("idle");
    }
  }

  async function recoverUpload() {
    if (!recoveryRecordingId) return;
    setMode("finalizing");
    try {
      const res = await fetch("/api/recording/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId: recoveryRecordingId, durationSec: 0 }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({ tone: "error", text: `Recovery feilet: ${j.error ?? res.status}` });
        setMode("recovery");
        return;
      }
      setBanner({ tone: "success", text: "Opptaket er gjenopprettet." });
      router.refresh();
    } catch (err) {
      console.error("[recording] recovery feilet", err);
      setMode("recovery");
    }
  }

  async function recoverDiscard() {
    if (!recoveryRecordingId) return;
    try {
      await fetch("/api/recording/abort", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId: recoveryRecordingId }),
      });
      setBanner({ tone: "info", text: "Det avbrutte opptaket er forkastet." });
      router.refresh();
    } catch (err) {
      console.error("[recording] abort feilet", err);
    }
  }

  if (skjult) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: T.rCard, border: `1px dashed ${T.border}`, background: T.panel, padding: "16px 18px", fontFamily: T.ui, fontSize: 13, color: T.mut }}>
        <span>Live-vinduet er skjult.</span>
        <Knapp ghost onClick={() => setSkjult(false)}>Vis igjen</Knapp>
      </div>
    );
  }

  const showRecovery = mode === "recovery" && recoveryRecordingId;
  const canStart = mode === "idle" && !!recordingId;
  const isRecordingActive = mode === "recording" || mode === "paused";
  const isFinalizing = mode === "finalizing";
  const toneColor: Record<NonNullable<Banner>["tone"], string> = { success: T.up, error: T.down, warn: T.warn, info: T.info };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {batteryWarn && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}>
          <Icon name="battery-low" size={16} />
          <span>Batteri under 20 %. Koble til lader for å unngå å miste opptaket.</span>
        </div>
      )}

      {banner && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 10, border: `1px solid color-mix(in srgb, ${toneColor[banner.tone]} 40%, transparent)`, background: `color-mix(in srgb, ${toneColor[banner.tone]} 12%, transparent)`, padding: "12px 16px", fontFamily: T.ui, fontSize: 13, color: toneColor[banner.tone] }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {banner.tone === "warn" && <Icon name="alert-triangle" size={15} />}
            {banner.text}
          </span>
          <button type="button" onClick={() => setBanner(null)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: "inherit", opacity: 0.8 }}>Lukk</button>
        </div>
      )}

      {showRecovery && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.info} 40%, transparent)`, background: `color-mix(in srgb, ${T.info} 10%, transparent)`, padding: "14px 16px" }}>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13.5, color: T.fg }}>Avbrutt opptak funnet</div>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>Startet {recoveryStartedAt ?? "tidligere"} — chunks ligger i Storage.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Knapp icon="upload" onClick={recoverUpload}>Last opp og fullfør</Knapp>
            <Knapp ghost icon="trash" onClick={recoverDiscard}>Forkast</Knapp>
          </div>
        </div>
      )}

      <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "12px 16px" }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {topbar}
            {isRecordingActive && (
              <StatusPill tone="down">{mode === "paused" ? "PAUSE" : "REC"} {formatTimer(elapsedSec)}</StatusPill>
            )}
            {chunkInfo && isRecordingActive && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{chunkInfo}</span>}
          </div>
          <button type="button" onClick={() => setSkjult(true)} aria-label="Lukk" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "none", color: T.mut, cursor: "pointer" }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {stage}

        <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "14px 16px" }}>
          {!isRecordingActive ? (
            <Knapp full icon="mic" onClick={startRecording} disabled={!canStart || isFinalizing}>{isFinalizing ? "Fullfører …" : "Start opptak"}</Knapp>
          ) : (
            <>
              <Knapp ghost full icon={mode === "paused" ? "play" : "pause"} onClick={pauseRecording}>{mode === "paused" ? "Fortsett" : "Pause"}</Knapp>
              <Knapp full icon={isFinalizing ? "loader" : "square"} onClick={stopRecording} disabled={isFinalizing}>Avslutt og analyser</Knapp>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordingAnalyzeButtonV2({ recordingId, harTranskripsjon }: { recordingId: string; harTranskripsjon: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [henter, setHenter] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ notionUrl: string | null } | null>(null);

  async function analyser() {
    setHenter(true);
    setFeil(null);
    setResultat(null);
    try {
      const res = await fetch("/api/recording/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recordingId }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; notionUrl?: string | null };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResultat({ notionUrl: data.notionUrl ?? null });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setHenter(false);
    }
  }

  async function settDummy() {
    setHenter(true);
    setFeil(null);
    try {
      const res = await fetch("/api/recording/dummy-transcript", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recordingId }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      startTransition(() => router.refresh());
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setHenter(false);
    }
  }

  const laster = henter || isPending;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, width: "100%" }}>
      {harTranskripsjon ? (
        <Knapp icon={laster ? "loader" : "sparkles"} onClick={analyser} disabled={laster}>Analyser nå</Knapp>
      ) : (
        <Knapp ghost icon={laster ? "loader" : "file-text"} onClick={settDummy} disabled={laster}>Sett dummy-transkripsjon</Knapp>
      )}
      {feil && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.down }}>{feil}</span>}
      {resultat?.notionUrl && (
        <a href={resultat.notionUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 10, color: T.lime, textDecoration: "none" }}>
          <Icon name="external-link" size={11} /> Åpne i Notion
        </a>
      )}
    </div>
  );
}

export function AdminOpptakV2({
  harDeepgramKey,
  activeRecordingId,
  recoveryRecordingId,
  recoveryStartedAtTekst,
  userNavn,
  harAktivt,
  aktivProsesserer,
  aktivVarighetSek,
  pipeline,
  transkripsjonLinjer,
  totalt,
  ferdig,
  behandles,
  feilet,
  opptak,
}: AdminOpptakV2Data) {
  const topbar = (
    <>
      {harAktivt && aktivProsesserer ? (
        <StatusPill tone="down">REC {formatTimer(aktivVarighetSek)}</StatusPill>
      ) : (
        <StatusPill tone="info">Ingen aktiv økt</StatusPill>
      )}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg }}>
        <span style={{ width: 20, height: 20, borderRadius: 9999, background: T.lime, display: "grid", placeItems: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.onLime }}>
          {(userNavn || "?").trim().charAt(0).toUpperCase()}
        </span>
        <span style={{ fontWeight: 600 }}>{userNavn}</span>
        <span style={{ color: T.mut }}>— coach</span>
      </div>
    </>
  );

  const stage = (
    <div style={{ position: "relative", display: "grid", gridTemplateRows: "auto auto 1fr", gap: 32, minHeight: 420, padding: "32px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        {pipeline.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <PipelineNodeV2 step={step} />
            {i < pipeline.length - 1 && <div style={{ height: 1, width: 40, background: pipeline[i].status === "done" ? T.lime : T.border }} />}
          </div>
        ))}
      </div>

      <div style={{ margin: "0 auto", display: "flex", height: 120, width: "100%", maxWidth: 640, alignItems: "center", justifyContent: "center", gap: 3 }}>
        {WAVE.map((h, i) => (
          <span key={i} style={{ display: "block", width: 3, borderRadius: 9999, height: h, opacity: 0.4 + (i % 5) * 0.12, background: harAktivt && aktivProsesserer ? T.lime : T.borderS }} />
        ))}
      </div>

      <div style={{ pointerEvents: "none", position: "absolute", bottom: 88, left: "50%", transform: "translateX(-50%)", maxHeight: 180, width: "90%", maxWidth: 640, overflow: "hidden", padding: "12px 20px", fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.6, maskImage: "linear-gradient(to top, #000 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, #000 70%, transparent 100%)" }}>
        {transkripsjonLinjer.length > 0 ? (
          transkripsjonLinjer.map((line, i) => <div key={i} style={{ color: T.mut }}>{line}</div>)
        ) : (
          <div style={{ fontStyle: "italic", color: T.mut, opacity: 0.7 }}>Transkripsjon vises her når opptak starter …</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <style>{"@keyframes v2spin{to{transform:rotate(360deg)}}"}</style>
      <div>
        <Caps size={9}>AgencyOS · Opptak</Caps>
        <Tittel em="mens du coacher">Lytter</Tittel>
        <p style={{ marginTop: 6, maxWidth: 780, fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.mut }}>
          Last opp lyd-fil og Deepgram transkriberer i sanntid. Pipeline trekker ut nøkkelpunkter til slutt og foreslår oppfølging.
        </p>
      </div>

      {!harDeepgramKey && (
        <Kort>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>Deepgram ikke konfigurert</div>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.mut }}>
            Automatisk transkripsjon krever en <code style={{ borderRadius: 4, background: T.panel3, padding: "1px 6px", fontFamily: T.mono, fontSize: 11.5 }}>DEEPGRAM_API_KEY</code> i .env.local. Inntil videre kan opptak lastes opp manuelt og transkripsjon limes inn for hånd.
          </p>
        </Kort>
      )}

      <RecordingControlsV2
        recordingId={activeRecordingId}
        recoveryRecordingId={recoveryRecordingId}
        recoveryStartedAt={recoveryStartedAtTekst}
        topbar={topbar}
        stage={stage}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Totalt opptak" value={totalt} instant />
        <KpiFlis label="Ferdig" value={ferdig} instant />
        <KpiFlis label="Behandles" value={behandles} delta={behandles > 0 ? "live" : undefined} instant />
        <KpiFlis label="Feilet" value={feilet} instant />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Caps size={9}>Historikk · siste 30 opptak</Caps>
          <span style={{ borderRadius: 9999, background: T.panel3, padding: "2px 8px", fontFamily: T.mono, fontSize: 9, color: T.mut }}>{opptak.length}</span>
          <span style={{ height: 1, flex: 1, background: T.border }} />
        </div>

        {opptak.length === 0 ? (
          <Kort style={{ marginTop: 14 }}>
            <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen opptak registrert. Opptak fra coaching-økter dukker opp her etter opplasting.</div>
          </Kort>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {opptak.map((r) => (
              <Kort key={r.id} style={{ gap: 10 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>{r.datoTekst}</span>
                  <StatusPill tone={r.statusTone}>{r.statusLabel}</StatusPill>
                  {r.varighetTekst && <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{r.varighetTekst}</span>}
                  {r.audioUrl ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{r.audioUrl}</span>
                  ) : (
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, fontStyle: "italic", color: T.mut }}>Lyd ikke klar</span>
                  )}
                </div>
                {r.transcript && (
                  <details>
                    <summary style={{ cursor: "pointer", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>Vis transkripsjon</summary>
                    <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", borderRadius: 8, background: T.panel2, padding: 12, fontFamily: T.ui, fontSize: 12, color: T.fg }}>{r.transcript}</pre>
                  </details>
                )}
                {r.kanAnalysere && <RecordingAnalyzeButtonV2 recordingId={r.id} harTranskripsjon={r.harTranskripsjon} />}
              </Kort>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

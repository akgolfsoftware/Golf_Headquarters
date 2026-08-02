"use client";

/**
 * Voice-memo-kontroller for /admin/recording. Flyttet ut av (legacy)
 * 2026-07-27 sammen med selve siden.
 *
 * Flyt: coach velger spiller → «Start opptak» oppretter SessionRecording via
 * /api/recording/start (playerId, ingen booking nødvendig) → MediaRecorder tar
 * opp og sender chunks (30 sek) til /api/recording/upload-chunk fortløpende →
 * «Avslutt og analyser» kaller /api/recording/complete, som selv trigger
 * transkribering og deretter AI-analyse. Wake Lock holder skjerm på.
 *
 * Etter complete poller vi status til DONE/FAILED slik at coach ser
 * sammendraget dukke opp uten å laste siden på nytt.
 *
 * Recovery: hvis recordingId er gitt og status=RECORDING fra serveren, viser
 * vi en banner med "Last opp" / "Forkast" — der "Last opp" prøver complete på
 * eksisterende chunks, og "Forkast" kaller abort.
 */

import {
  AlertTriangle,
  BatteryLow,
  Loader2,
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LydSamtykkePilotPanel } from "@/components/admin/lyd-samtykke-pilot-panel";
import {
  antallVentendeChunks,
  fjernChunkFraKo,
  leggChunkIKo,
  tomChunkKo,
} from "@/lib/offline-queue/recording-chunk-queue";

type Mode = "idle" | "recovery" | "recording" | "paused" | "finalizing" | "behandler";

type Banner = {
  tone: "info" | "success" | "warn" | "error";
  text: string;
} | null;

export type SpillerValg = {
  id: string;
  navn: string;
  /** true bare når LydSamtykke.status = GITT. Uten → Start-knapp skjules. */
  lydSamtykkeGitt: boolean;
};

type Props = {
  recordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAt: string | null;
  spillere: SpillerValg[];
  topbar: ReactNode;
  stage: ReactNode;
};

const CHUNK_MS = 30_000;
// Poll-intervall mens transkribering + analyse kjører i bakgrunnen.
const POLL_MS = 5_000;
// Slutt å polle etter 10 min — Whisper på en 50-min økt tar sjelden lenger,
// og en evig poller ville holdt fanen opptatt om et jobb-steg døde stille.
const POLL_TIMEOUT_MS = 600_000;

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

type BatteryNavigator = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

export function RecordingControls({
  recordingId,
  recoveryRecordingId,
  recoveryStartedAt,
  spillere,
  topbar,
  stage,
}: Props) {
  const router = useRouter();
  const [skjult, setSkjult] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [mode, setMode] = useState<Mode>(() => {
    if (recordingId) return "idle";
    if (recoveryRecordingId) return "recovery";
    return "idle";
  });
  const [valgtSpiller, setValgtSpiller] = useState<string>("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [chunkInfo, setChunkInfo] = useState<string | null>(null);
  const [batteryWarn, setBatteryWarn] = useState(false);

  // Aktiv recording-ID: enten den serveren ga oss, eller den vi nettopp
  // opprettet i start-kallet. Ref (ikke state) fordi ID-en kun leses av
  // upload-køen og complete-kallet — den rendres aldri, og en ref unngår
  // både stale closures og en unødvendig re-render midt i opptaket.
  const aktivIdRef = useRef<string | null>(recordingId);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const chunkIdxRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer
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

  // Battery monitoring
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      releaseWakeLock();
      if (pollRef.current) clearInterval(pollRef.current);
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

  /**
   * Poller status til DONE/FAILED. Transkribering + analyse kjøres
   * fire-and-forget på serveren, så uten polling ville coach stått igjen med
   * en tom skjerm til neste manuelle refresh.
   */
  const pollStatus = useCallback(
    (id: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      const startet = Date.now();
      pollRef.current = setInterval(async () => {
        if (Date.now() - startet > POLL_TIMEOUT_MS) {
          if (pollRef.current) clearInterval(pollRef.current);
          setMode("idle");
          setBanner({
            tone: "warn",
            text: "Behandlingen tar uvanlig lang tid. Last siden på nytt for å se status.",
          });
          return;
        }
        try {
          const res = await fetch(`/api/recording/status?recordingId=${encodeURIComponent(id)}`);
          if (!res.ok) return;
          const j = (await res.json()) as {
            status?: string;
            harTranskripsjon?: boolean;
            harAnalyse?: boolean;
          };
          if (j.status === "DONE") {
            if (pollRef.current) clearInterval(pollRef.current);
            setMode("idle");
            setBanner({ tone: "success", text: "Sammendraget er klart." });
            router.refresh();
          } else if (j.status === "FAILED") {
            if (pollRef.current) clearInterval(pollRef.current);
            setMode("idle");
            setBanner({
              tone: "error",
              text: j.harTranskripsjon
                ? "Analysen feilet. Transkripsjonen er lagret — prøv «Analyser på nytt» i historikken."
                : "Transkriberingen feilet. Lydfilen er lagret — prøv på nytt fra historikken.",
            });
            router.refresh();
          } else if (j.harTranskripsjon) {
            setBanner({ tone: "info", text: "Transkribert. Lager sammendrag …" });
            router.refresh();
          }
        } catch {
          // Nettverksglipp — neste tick prøver igjen.
        }
      }, POLL_MS);
    },
    [router],
  );

  async function lastOppChunkHttp(
    recordingId: string,
    idx: number,
    blob: Blob,
  ): Promise<{ ok: boolean }> {
    const form = new FormData();
    form.append("recordingId", recordingId);
    form.append("chunkIdx", String(idx));
    form.append("chunk", blob, `chunk-${idx}.webm`);
    try {
      const res = await fetch("/api/recording/upload-chunk", {
        method: "POST",
        body: form,
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  }

  function uploadChunk(idx: number, blob: Blob): Promise<void> {
    const id = aktivIdRef.current;
    if (!id) return Promise.resolve();
    return new Promise<void>((resolve) => {
      uploadQueueRef.current = uploadQueueRef.current.then(async () => {
        // 1) Lokal kø først — mistet dekning skal ikke miste biten.
        try {
          await leggChunkIKo(id, idx, blob);
        } catch (err) {
          console.error("[recording] IDB-kø feilet", err);
        }
        // 2) Prøv nett
        const res = await lastOppChunkHttp(id, idx, blob);
        if (res.ok) {
          await fjernChunkFraKo(id, idx).catch(() => undefined);
          setChunkInfo(`Lagret chunk ${idx + 1} (${formatTimer(elapsedSec)})`);
        } else {
          const vent = await antallVentendeChunks(id).catch(() => 0);
          setBanner({
            tone: "warn",
            text:
              vent > 0
                ? `${vent} lydbiter venter på opplasting — prøver igjen automatisk.`
                : "Kobling avbrutt — prøver igjen automatisk.",
          });
        }
        // 3) Tøm resten av køen for denne recording
        try {
          const flush = await tomChunkKo(id, lastOppChunkHttp);
          if (flush.gjenstaar > 0) {
            setBanner({
              tone: flush.gittOpp ? "error" : "warn",
              text: flush.gittOpp
                ? `${flush.gjenstaar} lydbiter kunne ikke lastes opp. Sjekk nett og prøv «Avslutt» på nytt.`
                : `${flush.gjenstaar} lydbiter venter på opplasting.`,
            });
          }
        } catch {
          /* ignorer flush-feil */
        }
        resolve();
      });
    });
  }

  async function startRecording() {
    if (!valgtSpiller) {
      setBanner({ tone: "warn", text: "Velg spiller før du starter opptaket." });
      return;
    }

    const spiller = spillere.find((s) => s.id === valgtSpiller);
    if (spiller && !spiller.lydSamtykkeGitt) {
      setBanner({
        tone: "warn",
        text: "Venter på samtykke fra foresatt. Opptak kan ikke starte.",
      });
      return;
    }

    // Mikrofon FØR opprettelse av recording — ellers ligger det igjen tomme
    // RECORDING-rader hver gang coach avslår mikrofon-dialogen.
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("[recording] getUserMedia feilet", err);
      setBanner({
        tone: "error",
        text: "Klarte ikke å aktivere mikrofon. Sjekk tilganger i nettleseren.",
      });
      return;
    }

    let id: string;
    try {
      const res = await fetch("/api/recording/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId: valgtSpiller }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        recordingId?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !j.recordingId) {
        stream.getTracks().forEach((t) => t.stop());
        const samtykkeFeil =
          j.error === "lyd-samtykke-mangler"
            ? (j.message ?? "Venter på samtykke fra foresatt. Opptak kan ikke starte.")
            : null;
        setBanner({
          tone: "error",
          text:
            samtykkeFeil ??
            `Klarte ikke å starte opptak: ${j.error ?? res.status}`,
        });
        return;
      }
      id = j.recordingId;
      aktivIdRef.current = id;
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      console.error("[recording] start feilet", err);
      setBanner({ tone: "error", text: "Nettverksfeil ved start av opptak." });
      return;
    }

    try {
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 32000,
      });
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
      const navn = spillere.find((s) => s.id === valgtSpiller)?.navn ?? "spiller";
      setBanner({ tone: "info", text: `Opptak startet for ${navn}. Lagrer hvert 30. sekund.` });
      await requestWakeLock();
    } catch (err) {
      stopStream();
      console.error("[recording] MediaRecorder feilet", err);
      setBanner({
        tone: "error",
        text: "Klarte ikke å starte opptaket i denne nettleseren.",
      });
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
    const id = aktivIdRef.current;
    if (!id) return;
    const rec = recorderRef.current;
    setMode("finalizing");

    // Be om siste data-chunk før vi stopper
    if (rec && (rec.state === "recording" || rec.state === "paused")) {
      await new Promise<void>((resolve) => {
        rec.addEventListener("stop", () => resolve(), { once: true });
        rec.stop();
      });
    }
    stopStream();
    await releaseWakeLock();

    // Vent på køen — siste chunk skal være lastet opp
    await uploadQueueRef.current;

    setBanner({ tone: "info", text: "Avslutter og lagrer opptaket …" });

    try {
      const res = await fetch("/api/recording/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordingId: id,
          durationSec: elapsedSec,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({
          tone: "error",
          text: `Klarte ikke å fullføre: ${j.error ?? res.status}`,
        });
        setMode("idle");
        return;
      }
      setBanner({
        tone: "info",
        text: "Opptak lagret. Transkriberer og lager sammendrag — dette tar noen minutter.",
      });
      setMode("behandler");
      router.refresh();
      pollStatus(id);
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
        body: JSON.stringify({
          recordingId: recoveryRecordingId,
          durationSec: 0,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({
          tone: "error",
          text: `Recovery feilet: ${j.error ?? res.status}`,
        });
        setMode("recovery");
        return;
      }
      setBanner({ tone: "info", text: "Opptaket er gjenopprettet. Behandler …" });
      setMode("behandler");
      router.refresh();
      pollStatus(recoveryRecordingId);
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
      setMode("idle");
      router.refresh();
    } catch (err) {
      console.error("[recording] abort feilet", err);
    }
  }

  if (skjult) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-card px-4 py-4 text-[13px] text-muted-foreground">
        <span>Live-vinduet er skjult.</span>
        <button
          type="button"
          onClick={() => setSkjult(false)}
          className="rounded-md border border-border bg-secondary px-4 py-1.5 text-[12px] font-medium text-foreground hover:opacity-90"
        >
          Vis igjen
        </button>
      </div>
    );
  }

  const showRecovery = mode === "recovery" && recoveryRecordingId;
  const isRecordingActive = mode === "recording" || mode === "paused";
  const isFinalizing = mode === "finalizing";
  const isBehandler = mode === "behandler";
  const valgtHarSamtykke =
    !!valgtSpiller &&
    (spillere.find((s) => s.id === valgtSpiller)?.lydSamtykkeGitt ?? false);
  // Spec §4: Start-knapp vises ikke uten GITT — ikke bare disabled.
  const canStart = mode === "idle" && valgtHarSamtykke;
  const visStartKnapp =
    !isRecordingActive &&
    mode === "idle" &&
    (!valgtSpiller || valgtHarSamtykke);
  const visSamtykkeMelding =
    !isRecordingActive &&
    mode === "idle" &&
    !!valgtSpiller &&
    !valgtHarSamtykke;

  return (
    <div className="space-y-4">
      {batteryWarn && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          <BatteryLow className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Batteri under 20 %. Koble til lader for å unngå å miste opptaket.</span>
        </div>
      )}

      {banner && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-4 text-[13px] ${
            banner.tone === "success"
              ? "border-primary/30 bg-primary/10 text-primary"
              : banner.tone === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : banner.tone === "warn"
                  ? "border-accent/40 bg-accent/15 text-foreground"
                  : "border-accent/40 bg-accent/10 text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            {banner.tone === "warn" && (
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            )}
            {banner.text}
          </span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.10em] hover:opacity-80"
          >
            Lukk
          </button>
        </div>
      )}

      {showRecovery && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-accent/40 bg-accent/10 px-4 py-4 text-[13px] text-foreground">
          <div>
            <div className="font-semibold">Avbrutt opptak funnet</div>
            <div className="text-muted-foreground">
              Startet {recoveryStartedAt ?? "tidligere"} — chunks ligger i Storage.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={recoverUpload}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} /> Last opp og fullfør
            </button>
            <button
              type="button"
              onClick={recoverDiscard}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground hover:bg-secondary"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Forkast
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {topbar}
            {isRecordingActive && (
              <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
                </span>
                {mode === "paused" ? "PAUSE" : "REC"} {formatTimer(elapsedSec)}
              </span>
            )}
            {chunkInfo && isRecordingActive && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {chunkInfo}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSkjult(true)}
            aria-label="Lukk"
            className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {stage}

        <div className="flex flex-col gap-3 border-t border-border bg-secondary px-4 py-4 sm:flex-row sm:items-end">
          {!isRecordingActive && (
            <label className="flex flex-1 flex-col gap-1.5 sm:max-w-[280px]">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Spiller
              </span>
              <select
                value={valgtSpiller}
                onChange={(e) => setValgtSpiller(e.target.value)}
                disabled={isFinalizing || isBehandler}
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-[13px] text-foreground disabled:opacity-50"
              >
                <option value="">Velg spiller …</option>
                {spillere.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.navn}
                  </option>
                ))}
              </select>
            </label>
          )}

          {visSamtykkeMelding && valgtSpiller && (
            <LydSamtykkePilotPanel
              playerId={valgtSpiller}
              playerNavn={
                spillere.find((s) => s.id === valgtSpiller)?.navn ?? "Spiller"
              }
              harGitt={false}
            />
          )}

          {(visStartKnapp || isFinalizing || isBehandler) && !isRecordingActive && (
            <button
              type="button"
              onClick={startRecording}
              disabled={!canStart || isFinalizing || isBehandler}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isFinalizing || isBehandler ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              ) : (
                <Mic className="h-4 w-4" strokeWidth={1.75} />
              )}
              {isFinalizing ? "Fullfører …" : isBehandler ? "Behandler …" : "Start opptak"}
            </button>
          )}

          {isRecordingActive && (
            <>
              <button
                type="button"
                onClick={pauseRecording}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-4 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {mode === "paused" ? (
                  <>
                    <Play className="h-4 w-4" strokeWidth={1.75} />
                    Fortsett
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" strokeWidth={1.75} />
                    Pause
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={stopRecording}
                disabled={isFinalizing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Square className="h-4 w-4" strokeWidth={1.5} fill="currentColor" />
                )}
                Avslutt og analyser
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

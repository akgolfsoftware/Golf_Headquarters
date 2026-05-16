"use client";

/**
 * Voice-memo-kontroller for /admin/recording.
 *
 * Tar opp lyd med MediaRecorder, sender chunks (30 sek) til
 * /api/recording/upload-chunk fortløpende, og kaller /api/recording/complete
 * når coach trykker "Avslutt og analyser". Wake Lock holder skjerm på.
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Mode = "idle" | "recovery" | "recording" | "paused" | "finalizing";

type Banner = {
  tone: "info" | "success" | "warn" | "error";
  text: string;
} | null;

type Props = {
  recordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAt: string | null;
  topbar: ReactNode;
  stage: ReactNode;
};

const CHUNK_MS = 30_000;

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const res = await fetch("/api/recording/upload-chunk", {
            method: "POST",
            body: form,
          });
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            setBanner({
              tone: "warn",
              text: `Klarte ikke å lagre chunk ${idx} — prøver igjen ved neste. (${j.error ?? res.status})`,
            });
          } else {
            setChunkInfo(`Lagret chunk ${idx + 1} (${formatTimer(elapsedSec)})`);
          }
        } catch (err) {
          console.error("[recording] upload feilet", err);
          setBanner({
            tone: "warn",
            text: "Kobling avbrutt — prøver igjen automatisk.",
          });
        } finally {
          resolve();
        }
      });
    });
  }

  async function startRecording() {
    if (!recordingId) {
      setBanner({
        tone: "error",
        text: "Mangler recording-ID — start fra en booking først.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      setBanner({ tone: "info", text: "Opptak startet. Lagrer hvert 30. sekund." });
      await requestWakeLock();
    } catch (err) {
      console.error("[recording] getUserMedia feilet", err);
      setBanner({
        tone: "error",
        text: "Klarte ikke å aktivere mikrofon. Sjekk tilganger i nettleseren.",
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
    if (!recordingId) return;
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

    setBanner({ tone: "info", text: "Avslutter og merger chunks …" });

    try {
      const res = await fetch("/api/recording/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordingId,
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
        tone: "success",
        text: "Opptak lagret. Transkribering og AI-analyse trigges når pipelinen er på.",
      });
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
  const canStart = mode === "idle" && !!recordingId;
  const isRecordingActive = mode === "recording" || mode === "paused";
  const isFinalizing = mode === "finalizing";

  return (
    <div className="space-y-4">
      {batteryWarn && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          <BatteryLow className="h-4 w-4" strokeWidth={1.75} />
          <span>Batteri under 20 %. Koble til lader for å unngå å miste opptaket.</span>
        </div>
      )}

      {banner && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 rounded-md border px-4 py-4 text-[13px] ${
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
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
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
          <div className="flex items-center gap-2">
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
        <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-4">
          <div className="flex flex-1 items-center gap-4">
            {topbar}
            {isRecordingActive && (
              <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive">
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

        <div className="flex items-center gap-4 border-t border-border bg-secondary px-4 py-4">
          {!isRecordingActive ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!canStart || isFinalizing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Mic className="h-4 w-4" strokeWidth={1.75} />
              {isFinalizing ? "Fullfører …" : "Start opptak"}
            </button>
          ) : (
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

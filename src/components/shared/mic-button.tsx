"use client";

/**
 * MicButton — taleinndata-komponent med 4 tilstander.
 *
 * Port av components-voice-input.html. Bruker Web Speech API (innebygd i
 * Chrome/Edge) for norsk tale → tekst uten API-nøkkel. Safari og Firefox
 * støtter det ikke — da vises en deaktivert knapp med forklaring.
 *
 * Tilstander: idle → recording → transcribing → done → idle
 *
 * Variant "standalone": frittstående rund knapp (48px).
 * Variant "suffix": liten lime-knapp til høyre inne i et textarea/input-felt.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Mic } from "lucide-react";

// ── Web Speech API type-deklarasjoner ────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// ── Tilstandstype ─────────────────────────────────────────────────────────────

type MicState = "idle" | "recording" | "transcribing" | "done" | "unsupported";

// ── Waveform-animasjon ────────────────────────────────────────────────────────

function Waveform() {
  const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const heights = ["30%", "60%", "90%", "70%", "100%", "50%", "80%", "40%", "65%"];
  return (
    <span className="mt-2 inline-flex h-5 items-end gap-[2px]" aria-hidden>
      {delays.map((d, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          style={{
            height: heights[i],
            animationDelay: `${d}s`,
            animation: "mic-wave 1.2s ease-in-out infinite",
          }}
        />
      ))}
    </span>
  );
}

// ── CSS-animasjoner (injisert én gang) ────────────────────────────────────────

const STYLE_ID = "mic-button-styles";

function injectStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes mic-wave {
      0%,100% { transform: scaleY(0.6); opacity: 0.5; }
      50% { transform: scaleY(1.2); opacity: 1; }
    }
    @keyframes mic-pulse {
      0%,100% { box-shadow: 0 0 0 8px rgba(209,248,67,0.20), 0 0 0 16px rgba(209,248,67,0.10); }
      50% { box-shadow: 0 0 0 12px rgba(209,248,67,0.25), 0 0 0 22px rgba(209,248,67,0.12); }
    }
    @keyframes mic-spin {
      to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .mic-btn-recording { animation: none !important; box-shadow: 0 0 0 8px rgba(209,248,67,0.20) !important; }
      [class*="mic-wave"] { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// ── Props ──────────────────────────────────────────────────────────────────────

export type MicButtonProps = {
  /** Kalles med endelig transkribert tekst */
  onResult: (text: string) => void;
  /** "standalone" = frittstående knapp. "suffix" = liten knapp inne i et felt. */
  variant?: "standalone" | "suffix";
  /** BCP-47 språkkode, default nb-NO */
  lang?: string;
  /** Deaktiver knappen (f.eks. hvis overordnet form er busy) */
  disabled?: boolean;
};

// ── Hoved-komponent ───────────────────────────────────────────────────────────

export function MicButton({
  onResult,
  variant = "standalone",
  lang = "nb-NO",
  disabled = false,
}: MicButtonProps) {
  const [state, setState] = useState<MicState>(() => {
    if (typeof window === "undefined") return "idle";
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ? "idle" : "unsupported";
  });
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTextRef = useRef("");

  // Sett opp recognition (hoppes over hvis ikke støttet)
  useEffect(() => {
    injectStyles();
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (ev) => {
      let interim = "";
      let finalText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        if (!result) continue;
        const alt = result[0];
        if (!alt) continue;
        if (result.isFinal) {
          finalText += alt.transcript;
        } else {
          interim += alt.transcript;
        }
      }
      if (finalText) {
        finalTextRef.current += finalText + " ";
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    r.onerror = () => {
      setState("idle");
      setInterimText("");
      finalTextRef.current = "";
    };

    r.onend = () => {
      if (state === "recording" || state === "transcribing") {
        const result = (finalTextRef.current + interimText).trim();
        setState("done");
        setInterimText("");
        finalTextRef.current = "";
        if (result) onResult(result);
        setTimeout(() => setState("idle"), 1500);
      }
    };

    recognitionRef.current = r;
    return () => { r.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggleRecording = useCallback(() => {
    if (state === "unsupported" || disabled) return;
    const r = recognitionRef.current;
    if (!r) return;

    if (state === "idle" || state === "done") {
      finalTextRef.current = "";
      setInterimText("");
      try {
        r.start();
        setState("recording");
      } catch {
        /* allerede aktiv */
      }
    } else if (state === "recording") {
      setState("transcribing");
      try {
        r.stop();
      } catch {
        /* noop */
      }
    }
  }, [state, disabled]);

  // ── Suffix-variant (liten knapp inne i felt) ─────────────────────────────

  if (variant === "suffix") {
    return (
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || state === "unsupported"}
        aria-label={
          state === "recording" ? "Stopp opptak" : "Start taleinndata"
        }
        title={
          state === "unsupported"
            ? "Tale-input støttes ikke i denne nettleseren"
            : state === "recording"
              ? "Stopp opptak"
              : "Start tale-inndata (norsk)"
        }
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
          state === "recording"
            ? "mic-btn-recording bg-accent text-primary"
            : state === "done"
              ? "bg-primary text-primary-foreground"
              : state === "unsupported"
                ? "cursor-not-allowed bg-secondary text-muted-foreground opacity-50"
                : "bg-secondary text-muted-foreground hover:bg-card hover:text-foreground"
        }`}
        style={
          state === "recording"
            ? {
                animation: "mic-pulse 1.4s ease-in-out infinite",
              }
            : undefined
        }
      >
        {state === "done" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
    );
  }

  // ── Standalone-variant ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || state === "unsupported"}
        aria-label={state === "recording" ? "Stopp opptak" : "Start taleinndata"}
        title={
          state === "unsupported"
            ? "Tale-input støttes ikke i denne nettleseren (prøv Chrome)"
            : state === "recording"
              ? "Stopp opptak"
              : "Start tale-inndata"
        }
        className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          state === "idle"
            ? "border-input bg-card text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-foreground"
            : state === "recording"
              ? "mic-btn-recording border-accent bg-accent text-primary"
              : state === "transcribing"
                ? "border-primary bg-primary text-primary-foreground"
                : state === "done"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "cursor-not-allowed border-border bg-secondary text-muted-foreground opacity-50"
        }`}
        style={
          state === "recording"
            ? { animation: "mic-pulse 1.4s ease-in-out infinite" }
            : undefined
        }
      >
        {state === "transcribing" ? (
          <span
            className="absolute inset-[-4px] rounded-full border-2 border-r-primary border-t-primary"
            style={{ animation: "mic-spin 0.8s linear infinite", borderColor: "transparent", borderTopColor: "var(--primary)", borderRightColor: "var(--primary)" }}
            aria-hidden
          />
        ) : null}
        {state === "done" ? (
          <Check className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Waveform under recording-knapp */}
      {state === "recording" && <Waveform />}

      {/* Hint-tekst */}
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {state === "idle" && "Trykk for å tale"}
        {state === "recording" && <span className="text-primary">Tar opp…</span>}
        {state === "transcribing" && "Transkriberer…"}
        {state === "done" && <span className="text-success">Ferdig</span>}
        {state === "unsupported" && "Støttes ikke her"}
      </span>

      {/* Interim tekst-visning */}
      {(state === "recording" || state === "transcribing") && interimText && (
        <p className="max-w-[200px] text-center font-sans text-[12px] leading-relaxed text-muted-foreground">
          <em className="opacity-70">{interimText}</em>
        </p>
      )}
    </div>
  );
}

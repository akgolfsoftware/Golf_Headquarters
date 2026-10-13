"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic } from "lucide-react";

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


type MicState = "idle" | "recording" | "transcribing" | "done" | "unsupported";
export type MicButtonProps = {
  onResult: (text: string) => void;
  variant?: "standalone" | "suffix";
  lang?: string;
  disabled?: boolean;
};

/** Kort trykk starter og stopper tale. Resultatet fyller feltet for gjennomlesing. */
export function MicButton({ onResult, variant = "standalone", lang = "nb-NO", disabled = false }: MicButtonProps) {
  const [state, setState] = useState<MicState>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const stateRef = useRef<MicState>("idle");
  const resultRef = useRef(onResult);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { resultRef.current = onResult; }, [onResult]);

  useEffect(() => {
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const update = (next: MicState) => { stateRef.current = next; setState(next); };
    if (!Constructor) { update("unsupported"); return; }
    update("idle");
    const recognition = new Constructor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      // Hele resultatlisten erstatter forrige tekst. Flere interim-events dobler ikke ord.
      let text = "";
      for (let index = 0; index < event.results.length; index++) {
        const alternative = event.results[index]?.[0];
        if (alternative) text += alternative.transcript + " ";
      }
      transcriptRef.current = text.trim();
      setInterim(transcriptRef.current);
    };
    recognition.onerror = (event) => {
      transcriptRef.current = "";
      setInterim("");
      setError(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Mikrofonen er ikke tilgjengelig. Du kan skrive i feltet."
        : event.error === "no-speech" ? "Ingen tale ble registrert. Prøv igjen eller skriv i feltet."
        : "Talen kunne ikke registreres. Prøv igjen eller skriv i feltet.");
      update("idle");
    };
    recognition.onend = () => {
      if (!["recording", "transcribing"].includes(stateRef.current)) return;
      const text = transcriptRef.current.trim();
      transcriptRef.current = ""; setInterim("");
      if (!text) { update("idle"); return; }
      update("done");
      resultRef.current(text);
      resetRef.current = setTimeout(() => {
        resetRef.current = null;
        if (stateRef.current === "done") update("idle");
      }, 1500);
    };
    recognitionRef.current = recognition;
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current);
      recognition.onresult = null; recognition.onerror = null; recognition.onend = null;
      recognition.abort(); recognitionRef.current = null; stateRef.current = "idle";
    };
  }, [lang]);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition || disabled || stateRef.current === "transcribing") return;
    if (resetRef.current) { clearTimeout(resetRef.current); resetRef.current = null; }
    setError("");
    try {
      if (stateRef.current === "recording") {
        stateRef.current = "transcribing"; setState("transcribing"); recognition.stop();
      } else {
        transcriptRef.current = ""; setInterim("");
        recognition.start(); stateRef.current = "recording"; setState("recording");
      }
    } catch {
      stateRef.current = "idle"; setState("idle");
      setError("Mikrofonen kunne ikke starte. Prøv igjen eller skriv i feltet.");
    }
  }

  const recording = state === "recording";
  const unsupported = state === "unsupported";
  const label = recording ? "Stopp taleinndata" : state === "transcribing" ? "Behandler tale" : "Start taleinndata";
  const hint = unsupported ? "Tale er ikke tilgjengelig her. Skriv i feltet."
    : recording ? "Trykk for å stoppe" : state === "transcribing" ? "Behandler tale …"
    : state === "done" ? "Teksten er lagt i feltet" : "Trykk for å snakke";
  return <span className={variant === "suffix" ? "mic-suffix" : "mic-input"} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <button type="button" onClick={toggle} aria-label={label} aria-pressed={recording}
      aria-busy={state === "transcribing"} disabled={disabled || unsupported || state === "transcribing"}
      title={unsupported ? hint : label}
      className="mic-control inline-flex items-center justify-center rounded-full bg-secondary text-foreground"
      data-recording={recording}
      style={{ width: variant === "suffix" ? 44 : 48, minHeight: variant === "suffix" ? 44 : 48, flexShrink: 0, border: "1px solid hsl(var(--border))" }}>
      {state === "done" ? <Check size={20} aria-hidden /> : <Mic size={20} aria-hidden />}
    </button>
    <span role="status" aria-live="polite" className={variant === "suffix" ? "sr-only" : undefined}
      style={variant === "standalone" ? { fontFamily: "var(--font-sans)", fontSize: "0.875rem" } : undefined}>{hint}</span>
    {error && <span role="alert" style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", maxWidth: 260 }}>{error}</span>}
    {variant === "standalone" && interim && <span style={{ maxWidth: 260, fontFamily: "var(--font-sans)", fontSize: "0.875rem" }}>{interim}</span>}
  </span>;
}

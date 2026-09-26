"use client";

import { useState, useRef } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { Caps, StatusPill } from "@/components/v2";
import {
  uploadAndTranscribeRangeVoice,
  saveVoiceRangeMemo,
} from "@/app/portal/live/voice-actions";
import type { ParsedVoiceObservation } from "@/lib/voice/whisper-transcribe";

export interface VoiceRangeRecorderProps {
  sessionId?: string;
  onMemoSaved?: (observation: ParsedVoiceObservation) => void;
  compact?: boolean;
}

export function VoiceRangeRecorder({
  sessionId,
  onMemoSaved,
  compact = false,
}: VoiceRangeRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [parsed, setParsed] = useState<ParsedVoiceObservation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    setSavedStatus(null);
    setParsed(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioProcess(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMsg("Fikk ikke tilgang til mikrofonen. Sjekk nettlesertillatelser.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcess = async (blob: Blob) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "memo.webm");

      const res = await uploadAndTranscribeRangeVoice(formData);
      if (!res.ok || !res.parsed) {
        setErrorMsg(res.error || "Transkribering feilet.");
      } else {
        setParsed(res.parsed);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Kunne ikke behandle opptak.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async (destination: "session" | "coach_inbox") => {
    if (!parsed) return;
    try {
      const res = await saveVoiceRangeMemo({
        sessionId,
        observation: parsed,
        destination,
      });
      if (res.ok) {
        setSavedStatus(res.message);
        onMemoSaved?.(parsed);
      } else {
        setErrorMsg("Kunne ikke lagre notat.");
      }
    } catch {
      setErrorMsg("Feil ved lagring.");
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        borderRadius: TL.radius.card,
        border: `1px solid ${TL.hair}`,
        background: TL.dock,
        padding: compact ? "12px 14px" : "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <Caps size={9}>Whisper · Tale-til-tekst på rangen</Caps>
          <div
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              color: TL.text,
              marginTop: 2,
            }}
          >
            {isRecording
              ? `Tar opp lyd (${formatTimer(seconds)})...`
              : isTranscribing
                ? "Tolker og transkriberer svingnotat..."
                : "Trykk for å ta opp svingobservasjon"}
          </div>
        </div>

        <div>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={isTranscribing}
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                background: TL.fill,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: isTranscribing ? "not-allowed" : "pointer",
                opacity: isTranscribing ? 0.6 : 1,
              }}
            >
              <Icon name="mic" size={14} />
              Start opptak
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                background: TL.warn,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Icon name="square" size={12} />
              Stopp ({formatTimer(seconds)})
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <p
          style={{
            fontFamily: TL.font.sans,
            fontSize: 12,
            color: TL.text,
            margin: "8px 0 0",
          }}
        >
          {errorMsg}
        </p>
      )}

      {parsed && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: TL.radius.card,
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {parsed.club && <StatusPill tone="info">{parsed.club}</StatusPill>}
            {parsed.position && (
              <StatusPill tone="up">
                {parsed.position} · {parsed.positionName ?? ""}
              </StatusPill>
            )}
            {parsed.suggestedReps && (
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 11,
                  color: TL.mute,
                }}
              >
                Foreslått: {parsed.suggestedReps.dry > 0 ? `${parsed.suggestedReps.dry} reps dry` : ""}
                {parsed.suggestedReps.lav > 0 ? ` ${parsed.suggestedReps.lav} reps lav` : ""}
                {parsed.suggestedReps.full > 0 ? ` ${parsed.suggestedReps.full} reps full` : ""}
              </span>
            )}
          </div>

          <p
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.text,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            «{parsed.rawTranscript}»
          </p>

          {savedStatus ? (
            <div
              style={{
                marginTop: 10,
                fontFamily: TL.font.sans,
                fontSize: 12,
                color: TL.viz.good,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name="check" size={14} />
              {savedStatus}
            </div>
          ) : (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {sessionId && (
                <button
                  type="button"
                  onClick={() => handleSave("session")}
                  className="v2-press v2-focus"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: TL.dock,
                    border: `1px solid ${TL.hair}`,
                    color: TL.text,
                    fontFamily: TL.font.sans,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Lagre på denne økten
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave("coach_inbox")}
                className="v2-press v2-focus"
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: TL.dock,
                  border: `1px solid ${TL.hair}`,
                  color: TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send til coach
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Kilde: ui_kits/playerhq/screens/PH-05.jsx.
 * PH-05 Live-økt: aktiv — Precision Athletics (nattmodus/fokus).
 *
 * Stoppeklokke, øvelsesgrid med progresjon, aktivt drillkort,
 * store touchknapper for reps (Angre -1, +5, +1), snarvei til slagteller,
 * avslutte-modal og "Neste øvelse" / "Fullfør økt" (64 px).
 * Ingen hex eller rgba.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, Undo2, ArrowRight, Check } from "lucide-react";
import { AkseMerke, StatusPille, Meta, Tall } from "@/components/precision/pa";
import {
  type LiveAktivData,
  formatClock,
  beregnProsent,
} from "@/lib/portal-live/ph04-07-data";
import "@/styles/precision-athletics.css";

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
  const [pause, setPause] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [seconds, setSeconds] = useState(data.initialSeconds || 0);

  // Stoppeklokke
  useEffect(() => {
    if (pause || empty) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pause, empty]);

  const add = (n: number) => {
    setReps((prev) =>
      prev.map((val, idx) => (idx === cur ? Math.max(0, val + n) : val)),
    );
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
      if (onFinish) {
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
    if (onFinish) {
      onFinish(reps);
    } else {
      router.push(`/portal/live/${data.sessionId}/summary`);
    }
  };

  return (
    <div
      className="pa-root ph05"
      data-theme="night"
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fokus-topp */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-hairline)",
          background: "var(--surface-card)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <StatusPille tone="live">Live</StatusPille>
        <Meta
          style={{
            font: "var(--type-label)",
            color: "var(--text-primary)",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.title.toUpperCase()}
        </Meta>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setPause(!pause)}
          style={{
            height: 56,
            padding: "0 16px",
            borderRadius: 8,
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
            color: "var(--text-primary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            font: "600 15px/1 var(--font-sans)",
            cursor: "pointer",
          }}
        >
          {pause ? <Play size={18} fill="currentColor" /> : <Pause size={18} />}
          <span>{pause ? "Fortsett" : "Pause"}</span>
        </button>
        <button
          type="button"
          onClick={() => setEndOpen(true)}
          style={{
            height: 56,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            font: "600 15px/1 var(--font-sans)",
            cursor: "pointer",
          }}
        >
          Avslutt
        </button>
      </header>

      {/* Hovedinnhold */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "20px 16px 110px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Stoppeklokke */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              font: "500 56px/1 var(--font-mono)",
              color: pause ? "var(--text-muted)" : "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
            aria-label={`Tid ${formatClock(seconds)}`}
          >
            {formatClock(seconds)}
          </span>
          <Meta style={{ color: "var(--text-secondary)" }}>
            {pause ? "PAUSE" : `AV ${data.totalMinutes} MIN`}
          </Meta>
        </div>

        {/* Horisontal øvelsesliste / steg-knapper */}
        <div
          role="list"
          aria-label="Øvelser"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, drills.length)}, minmax(0, 1fr))`,
            gap: 6,
          }}
        >
          {drills.map((drill, idx) => {
            const on = idx === cur;
            const repCount = reps[idx] || 0;
            const done = repCount >= drill.quantity;
            const pct = beregnProsent(repCount, drill.quantity);

            return (
              <button
                key={drill.id || idx}
                role="listitem"
                type="button"
                onClick={() => setCur(idx)}
                aria-current={on ? "step" : undefined}
                style={{
                  height: 56,
                  border: `1px solid ${on ? "var(--border-ink)" : "var(--border-hairline)"}`,
                  borderRadius: 8,
                  background: on ? "var(--surface-card)" : "transparent",
                  color: "var(--text-primary)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  gap: 6,
                  padding: "0 10px",
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    font: "var(--type-meta)",
                    color: on ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    height: 4,
                    background: "var(--surface-sunken)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--text-primary)",
                      opacity: done ? 1 : 0.6,
                      transition: "width 200ms ease-out",
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Aktivt øvelseskort */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <AkseMerke axis={activeDrill.axis} />
            <Meta>
              ØVELSE {cur + 1} AV {drills.length} ·{" "}
              {activeDrill.unit === "putter" ? "ANTALL PUTTER" : "ANTALL SLAG"}
            </Meta>
          </div>

          <div
            style={{
              font: "var(--type-title-m)",
              color: "var(--text-primary)",
              textWrap: "pretty",
            }}
          >
            {activeDrill.name}
          </div>

          <div
            style={{
              font: "500 12px/1.35 var(--font-mono)",
              color: "var(--text-secondary)",
              overflowWrap: "anywhere",
            }}
          >
            {activeDrill.code}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                font: "var(--type-metric-l)",
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 650,
              }}
            >
              {curReps}
            </span>
            <Tall style={{ color: "var(--text-muted)", fontSize: 16 }}>
              / {activeDrill.quantity} {activeDrill.unit}
            </Tall>
          </div>

          {/* Progresjonsbar */}
          <div
            style={{
              height: 6,
              background: "var(--surface-sunken)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${beregnProsent(curReps, activeDrill.quantity)}%`,
                background: "var(--primary)",
                transition: "width 200ms ease-out",
              }}
            />
          </div>
        </div>

        {/* Repetisjonsknapper: Angre, +5, +1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "56px minmax(0, 1fr) minmax(0, 1fr)",
            gap: 8,
          }}
        >
          <button
            type="button"
            aria-label="Angre én"
            onClick={() => add(-1)}
            style={{
              width: 56,
              height: 72,
              borderRadius: 8,
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Undo2 size={20} />
          </button>
          <button
            type="button"
            onClick={() => add(5)}
            style={{
              height: 72,
              borderRadius: 8,
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              font: "600 21px/1 var(--font-mono)",
              cursor: "pointer",
            }}
          >
            +5
          </button>
          <button
            type="button"
            onClick={() => add(1)}
            style={{
              height: 72,
              borderRadius: 8,
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              font: "600 21px/1 var(--font-mono)",
              cursor: "pointer",
            }}
          >
            +1
          </button>
        </div>

        {/* Snarvei til slagtelleren */}
        <Link
          href={`/portal/live/${data.sessionId}/tapper`}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minHeight: 56,
            font: "var(--type-label)",
            color: "var(--text-secondary)",
          }}
        >
          Åpne slagtelleren med kølle og TrackMan
        </Link>
      </main>

      {/* Bunnaksjon: Neste øvelse / Fullfør økt */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--surface-page)",
          borderTop: "1px solid var(--border-hairline)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "center",
          zIndex: 30,
        }}
      >
        <div style={{ width: "100%", maxWidth: 640 }}>
          <button
            type="button"
            onClick={handleNextOrFinish}
            style={{
              height: 64,
              width: "100%",
              borderRadius: 8,
              border: "none",
              background: "var(--primary)",
              color: "var(--text-on-primary)",
              font: "600 17px/1 var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span>{isLast ? "Fullfør økt" : "Neste øvelse"}</span>
            {isLast ? <Check size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </footer>

      {/* Avslutt-modal */}
      {endOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--scrim-modal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 12,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Avslutte økta?
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--text-secondary)",
              }}
            >
              {totalRepsSum} repetisjoner er registrert. Øvelser som ikke er fullført
              lagres som ikke gjennomført.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setEndOpen(false)}
                style={{
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Fortsett
              </button>
              <button
                type="button"
                onClick={handleEndConfirmed}
                style={{
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--text-on-primary)",
                  fontWeight: 650,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Avslutt og lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

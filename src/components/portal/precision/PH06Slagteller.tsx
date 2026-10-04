"use client";

/**
 * Kilde: ui_kits/playerhq/screens/PH-06.jsx.
 * PH-06 Slagteller — Precision Athletics (nattmodus/fokus).
 *
 * Kjempeteller (56px mono), køllevelger fra bagen, TrackMan siste slag (6 metrikker),
 * store trykkflater: Angre ett slag (72x72), +5 slag (72px) og +1 slag (96px).
 * Toast-feedback og avslutte-dialog.
 * Ingen hex eller rgba.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Radar } from "lucide-react";
import { StatusPille, Meta, Tall } from "@/components/precision/pa";
import {
  type SlagtellerData,
  erPutter,
  formatDesimal,
  beregnProsent,
} from "@/lib/portal-live/ph04-07-data";
import "@/styles/precision-athletics.css";

interface PH06SlagtellerProps {
  data: SlagtellerData;
  onAddShot?: (club: string, count: number) => void;
  onFinish?: () => void;
}

export function PH06Slagteller({
  data,
  onAddShot,
  onFinish,
}: PH06SlagtellerProps) {
  const router = useRouter();

  const [club, setClub] = useState(data.selectedClub || "PW");
  const [reps, setReps] = useState(data.currentShots || 0);
  const [endOpen, setEndOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const goal = data.totalShotsGoal || 30;
  const isPutter = erPutter(club);
  const tm = isPutter ? null : data.trackmanShot;

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText((current) => (current === msg ? null : current));
    }, 2000);
  };

  const add = (n: number) => {
    const nextReps = Math.max(0, reps + n);
    setReps(nextReps);

    if (n > 0) {
      showToast(`+${n} slag · ${club} (${nextReps} av ${goal} slag)`);
    }

    if (onAddShot) {
      onAddShot(club, n);
    }
  };

  const handleEndConfirmed = () => {
    setEndOpen(false);
    if (onFinish) {
      onFinish();
    } else {
      router.push(`/portal/live/${data.sessionId}/summary`);
    }
  };

  return (
    <div
      className="pa-root ph06"
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
          background: "var(--surface-header)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <StatusPille tone="live">Live</StatusPille>
        <Meta
          style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            letterSpacing: ".04em",
          }}
        >
          SLAGTELLER · ØVELSE {data.drillIndex + 1} AV {data.totalDrills}
        </Meta>
        <span style={{ flex: 1 }} />
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
          padding: "20px 16px 200px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Aktiv øvelse og kjempeteller */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              font: "var(--type-title-s)",
              color: "var(--text-primary)",
            }}
          >
            {data.activeDrill.name}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                font: "600 56px/1 var(--font-mono)",
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {reps}
            </span>
            <Tall style={{ color: "var(--text-muted)", fontSize: 18 }}>
              / {goal} slag
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
                width: `${beregnProsent(reps, goal)}%`,
                background: "var(--primary)",
                transition: "width 200ms ease-out",
              }}
            />
          </div>
        </div>

        {/* Køllevelger fra bagen */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              className="pa-field__label"
              style={{ color: "var(--text-secondary)", fontSize: 13 }}
            >
              Kølle fra bagen
            </span>
            <Meta>{data.bagClubs.length} KØLLER</Meta>
          </div>

          <div
            role="group"
            aria-label="Kølle"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
              gap: 6,
            }}
          >
            {data.bagClubs.map((c) => {
              const on = c === club;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClub(c)}
                  aria-pressed={on}
                  style={{
                    height: 56,
                    borderRadius: 8,
                    border: `1px solid ${on ? "var(--border-ink)" : "var(--border-hairline)"}`,
                    background: on ? "var(--primary)" : "var(--surface-card)",
                    color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                    font: "600 15px/1 var(--font-mono)",
                    cursor: "pointer",
                    minWidth: 0,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* TrackMan · siste slag */}
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
            <span
              className="kicker"
              style={{ flex: 1, color: "var(--text-secondary)" }}
            >
              TrackMan · siste slag
            </span>
            <Meta>
              {tm ? `AUTO-IMPORT · ${tm.timestamp || "14:41"}` : "—"}
            </Meta>
          </div>

          {isPutter ? (
            <p
              style={{
                margin: 0,
                font: "var(--type-body-s)",
                color: "var(--text-secondary)",
              }}
            >
              TrackMan måler ikke putter. Tell puttene med +1.
            </p>
          ) : !tm ? (
            <div
              style={{
                padding: "16px 0",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <Radar size={28} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 14 }}>Ingen slag fra TrackMan ennå</div>
              <Meta>Slå første slag. Tallene kommer inn automatisk.</Meta>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                rowGap: 14,
                columnGap: 8,
              }}
            >
              <div>
                <Meta style={{ display: "block" }}>CARRY</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.carry, 1)}
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 2 }}>m</span>
                </Tall>
              </div>
              <div>
                <Meta style={{ display: "block" }}>CLUB SPEED</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.clubSpeed, 1)}
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 2 }}>mph</span>
                </Tall>
              </div>
              <div>
                <Meta style={{ display: "block" }}>BALL SPEED</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.ballSpeed, 1)}
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 2 }}>mph</span>
                </Tall>
              </div>
              <div>
                <Meta style={{ display: "block" }}>SMASH FACTOR</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.smashFactor, 2)}
                </Tall>
              </div>
              <div>
                <Meta style={{ display: "block" }}>LAUNCH ANGLE</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.launchAngle, 1)}
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 2 }}>°</span>
                </Tall>
              </div>
              <div>
                <Meta style={{ display: "block" }}>CLUB PATH</Meta>
                <Tall style={{ fontSize: 20, fontWeight: 650 }}>
                  {formatDesimal(tm.clubPath, 1)}
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 2 }}>°</span>
                </Tall>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast-melding */}
      {toastText && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 195,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-sunken)",
            color: "var(--text-primary)",
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid var(--border-hairline)",
            fontSize: 14,
            fontWeight: 500,
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          {toastText}
        </div>
      )}

      {/* Bunnaksjon: Kjempeknapper for slagregistrering */}
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
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "grid",
            gridTemplateColumns: "72px minmax(0, 1fr)",
            gap: 8,
          }}
        >
          <button
            type="button"
            aria-label="Angre ett slag"
            onClick={() => add(-1)}
            style={{
              width: 72,
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
            <Undo2 size={24} />
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
              font: "600 21px/1 var(--font-sans)",
              cursor: "pointer",
            }}
          >
            +5 slag
          </button>
        </div>

        <div style={{ width: "100%", maxWidth: 640 }}>
          <button
            type="button"
            onClick={() => add(1)}
            style={{
              height: 96,
              width: "100%",
              borderRadius: 8,
              border: "none",
              background: "var(--primary)",
              color: "var(--text-on-primary)",
              font: "600 29px/1 var(--font-sans)",
              cursor: "pointer",
            }}
          >
            +1 slag
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
            background: "var(--surface-overlay)",
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
              {reps} av {goal} slag er registrert på denne øvelsen. Resten lagres som
              ikke gjennomført.
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

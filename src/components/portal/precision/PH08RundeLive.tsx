"use client";

/**
 * PH-08 Runde live — Precision Athletics (26.09.2026).
 * Kilde: ui_kits/playerhq/screens/PH-08.jsx.
 * Natt/fokus-visning med store treffflater (56px knapper), ingen hex-farger.
 * KUN brutto score — aldri netto.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type LieType,
  type LiveSlag,
  type CourseHoleDef,
  STANDARD_18_HOLES,
  formatToPar,
  beregnBruttoScore,
  beregnParForSpilteHull,
  tellSpilteHull,
  kanLagres,
  formatSlagChip,
} from "@/lib/portal-runder/ph08-09-data";
import { type Ph0809Data } from "@/lib/portal-runder/load-ph08-09";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";

interface PH08RundeLiveProps {
  data: Ph0809Data;
  rundeId?: string;
}

const STEP_BTN_STYLE: React.CSSProperties = {
  width: 56,
  height: 56,
  flex: "none",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-card)",
  color: "var(--text-primary)",
  font: "600 17px/1 var(--font-mono)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function BigStepper({
  value,
  unit,
  onChange,
  steps,
  label,
}: {
  value: number;
  unit: string;
  onChange: (v: number) => void;
  steps: number[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, width: "100%" }}
    >
      {steps
        .filter((s) => s < 0)
        .map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${label} ${s}`}
            onClick={() => onChange(Math.max(0, value + s))}
            style={STEP_BTN_STYLE}
          >
            {"−" + Math.abs(s)}
          </button>
        ))}
      <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
        <span
          style={{
            font: "600 40px/1 var(--font-mono)",
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          {" " + unit}
        </span>
      </div>
      {steps
        .filter((s) => s > 0)
        .map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${label} +${s}`}
            onClick={() => onChange(value + s)}
            style={STEP_BTN_STYLE}
          >
            {"+" + s}
          </button>
        ))}
    </div>
  );
}

export function PH08RundeLive({ data, rundeId: _rundeId }: PH08RundeLiveProps) {
  const router = useRouter();
  const holes: CourseHoleDef[] = data.valgtBane?.hull || STANDARD_18_HOLES;
  const courseName = data.valgtBane?.navn || "Fredrikstad Golfklubb";
  const courseTee = data.valgtBane?.tee || "Gul";
  const courseId = data.valgtBane?.id || "fredrikstad-gk";

  // State
  const [scores, setScores] = useState<(number | null)[]>(Array(18).fill(null));
  const [holeIdx, setHoleIdx] = useState<number>(0);
  const [shots, setShots] = useState<LiveSlag[]>([]);
  const [mode, setMode] = useState<"Slag" | "Putt">("Slag");
  const [lie, setLie] = useState<LieType>("Tee");
  const [meter, setMeter] = useState<number>(holes[0]?.meter || 342);
  const [fot, setFot] = useState<number>(12);
  const [endOpen, setEndOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeHole = holes[holeIdx] || holes[0];
  const parList = holes.map((h) => h.par);
  const playedCount = tellSpilteHull(scores);
  const brutto = beregnBruttoScore(scores);
  const parPlayed = beregnParForSpilteHull(parList, scores);
  const toParStr = formatToPar(brutto - parPlayed);
  const checkSave = kanLagres(scores);

  const showToast = (t: string) => {
    setToastMsg(t);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Registrer slag
  const handleRegSlag = () => {
    const nyttSlag: LiveSlag = mode === "Slag" ? { lie, meter } : { lie: "Putt", fot };
    setShots((prev) => [...prev, nyttSlag]);

    if (mode === "Slag") {
      // Estimer gjenstående meter etter slag
      setMeter((v) => Math.max(0, Math.round(v * 0.25)));
      setLie("Fairway");
    }
  };

  // Fullfør hull
  const handleFullforHull = () => {
    const n = shots.length;
    if (n === 0) return;

    const nyScores = [...scores];
    nyScores[holeIdx] = n;
    setScores(nyScores);

    const nyBrutto = beregnBruttoScore(nyScores);
    showToast(`Hull ${holeIdx + 1} lagret · ${n} slag (Brutto ${nyBrutto})`);

    const nesteHole = Math.min(17, holeIdx + 1);
    setHoleIdx(nesteHole);
    setShots([]);
    setMode("Slag");
    setLie("Tee");
    setMeter(holes[nesteHole]?.meter || 350);
  };

  // Lagre runde mot server
  const handleLagreRunde = async () => {
    if (!checkSave.kanLagre || isSaving) return;
    setIsSaving(true);

    try {
      const hullDetaljer = holes
        .map((h, i) => {
          const s = scores[i];
          if (s == null || s <= 0) return null;
          return {
            nr: h.nummer,
            par: h.par,
            strokes: s,
            putts: null,
            fairway: null,
            gir: null,
          };
        })
        .filter((h): h is NonNullable<typeof h> => h !== null);

      await logRoundManual({
        courseId,
        playedAt: new Date().toISOString(),
        score: brutto,
        holeScores: scores.filter((s): s is number => s !== null && s > 0),
        hullDetaljer,
      });
      router.push("/portal/mal/runder");
    } catch (err) {
      console.error("Kunne ikke lagre runden:", err);
      showToast("Kunne ikke lagre runden over nett. Data er bevart.");
      setIsSaving(false);
      setEndOpen(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: 720,
        margin: "0 auto",
        padding: "16px 16px 24px",
        gap: 16,
      }}
    >
      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-primary)",
            padding: "10px 18px",
            borderRadius: 8,
            zIndex: 100,
            font: "600 14px/1.2 var(--font-sans)",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Topp-bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: 6,
            background: "var(--signal-up-subtle)",
            color: "var(--signal-up)",
            font: "600 11px/1 var(--font-mono)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Runde live
        </span>
        <span
          style={{
            font: "500 12px/1 var(--font-mono)",
            color: "var(--text-secondary)",
            letterSpacing: "0.05em",
          }}
        >
          {courseName.toUpperCase()} · {courseTee.toUpperCase()}
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setEndOpen(true)}
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 8,
            border: "1px solid var(--border-hairline)",
            background: "transparent",
            color: "var(--text-primary)",
            font: "600 14px/1 var(--font-sans)",
            cursor: "pointer",
          }}
        >
          Avslutt
        </button>
      </div>

      {/* Hull-stripe: 18 knapper */}
      <div
        role="group"
        aria-label="Hull"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          gap: 4,
        }}
      >
        {holes.map((h, i) => {
          const on = i === holeIdx;
          const sc = scores[i];
          return (
            <button
              key={h.nummer}
              type="button"
              aria-current={on ? "step" : undefined}
              aria-label={`Hull ${h.nummer}`}
              onClick={() => {
                setHoleIdx(i);
                setShots([]);
                setLie("Tee");
                setMeter(h.meter);
              }}
              style={{
                height: 52,
                borderRadius: 8,
                border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                background: on ? "var(--primary)" : "var(--surface-card)",
                color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                cursor: "pointer",
                minWidth: 0,
                padding: "2px 0",
              }}
            >
              <span style={{ font: "500 10px/1 var(--font-mono)", opacity: 0.75 }}>{h.nummer}</span>
              <span style={{ font: "600 15px/1 var(--font-mono)" }}>{sc != null ? sc : "—"}</span>
            </button>
          );
        })}
      </div>

      {/* Hull-status kort */}
      <div
        style={{
          border: "1px solid var(--border-hairline)",
          borderRadius: 8,
          background: "var(--surface-card)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-sans)", flex: 1 }}>
            Hull {activeHole.nummer}
          </span>
          <span
            style={{
              font: "500 12px/1 var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
            }}
          >
            PAR {activeHole.par} · {activeHole.meter} M
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: "1 1 160px" }}>
            Brutto score etter {playedCount} hull
          </span>
          <span
            style={{
              font: "600 28px/1 var(--font-mono)",
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {playedCount > 0 ? brutto : "—"}
          </span>
          <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {playedCount > 0 ? `slag (${toParStr})` : "slag"}
          </span>
        </div>
      </div>

      {/* Tom tilstand hvis ingen slag */}
      {shots.length === 0 && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            border: "1px dashed var(--border-hairline)",
            background: "var(--surface-sunken)",
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Velg leie og meter for utslaget på hull {activeHole.nummer}, og trykk Registrer slag.
        </div>
      )}

      {/* Modus-velger: Slag vs. Putt */}
      <div
        role="tablist"
        style={{
          display: "flex",
          borderRadius: 8,
          background: "var(--surface-sunken)",
          padding: 3,
          gap: 2,
        }}
      >
        {(["Slag", "Putt"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 6,
              border: "none",
              background: mode === m ? "var(--surface-card)" : "transparent",
              color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Slag / Putt kontrollpanel */}
      {mode === "Slag" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Leie
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 4,
                background: "var(--surface-sunken)",
                padding: 3,
                borderRadius: 8,
              }}
            >
              {(["Tee", "Fairway", "Rough", "Sand"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLie(l)}
                  style={{
                    height: 44,
                    borderRadius: 6,
                    border: "none",
                    background: lie === l ? "var(--surface-card)" : "transparent",
                    color: lie === l ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Meter til flagget
            </div>
            <BigStepper
              label="Meter"
              value={meter}
              unit="m"
              onChange={setMeter}
              steps={[-10, -1, 1, 10]}
            />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Puttavstand
          </div>
          <BigStepper
            label="Fot"
            value={fot}
            unit="ft"
            onChange={setFot}
            steps={[-5, -1, 1, 5]}
          />
        </div>
      )}

      {/* Slag-chips for nåværende hull */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 28, alignItems: "center" }}>
        {shots.length > 0 ? (
          shots.map((s, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: 6,
                background: "var(--surface-card)",
                border: "1px solid var(--border-hairline)",
                font: "600 12px/1 var(--font-mono)",
                color: "var(--text-primary)",
              }}
            >
              {formatSlagChip(idx + 1, s)}
            </span>
          ))
        ) : (
          <span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>
            INGEN SLAG PÅ DETTE HULLET
          </span>
        )}
      </div>

      {/* Handlinger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
        <button
          type="button"
          disabled={shots.length === 0}
          onClick={handleFullforHull}
          style={{
            height: 52,
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            background: "var(--surface-card)",
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: 15,
            cursor: shots.length > 0 ? "pointer" : "not-allowed",
            opacity: shots.length > 0 ? 1 : 0.45,
          }}
        >
          Fullfør hull {activeHole.nummer} · {shots.length > 0 ? `${shots.length} slag` : "—"}
        </button>

        <button
          type="button"
          onClick={handleRegSlag}
          style={{
            height: 60,
            borderRadius: 8,
            border: "none",
            background: "var(--primary)",
            color: "var(--text-on-primary)",
            fontWeight: 650,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>+</span>
          <span>Registrer slag</span>
        </button>
      </div>

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
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Avslutte runden?</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
              {playedCount} av 18 hull er registrert. Brutto score{" "}
              {playedCount > 0 ? `${brutto} slag (${toParStr})` : "—"}.{" "}
              {checkSave.kanLagre
                ? `Til par er regnet av par på de ${playedCount} spilte hullene.`
                : `En runde kan lagres med 9 eller 18 hull. Spill ${
                    playedCount < 9 ? 9 - playedCount : 18 - playedCount
                  } hull til for å lagre.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEndOpen(false)}
                style={{
                  height: 44,
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
                disabled={!checkSave.kanLagre || isSaving}
                onClick={handleLagreRunde}
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--text-on-primary)",
                  fontWeight: 650,
                  fontSize: 14,
                  cursor: checkSave.kanLagre && !isSaving ? "pointer" : "not-allowed",
                  opacity: checkSave.kanLagre && !isSaving ? 1 : 0.45,
                }}
              >
                {isSaving ? "Lagrer …" : checkSave.kanLagre ? `Lagre ${playedCount} hull` : "Lagre runde"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

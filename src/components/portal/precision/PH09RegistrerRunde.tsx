"use client";

/**
 * PH-09 Registrer runde — Precision Athletics (26.09.2026).
 * Kilde: ui_kits/playerhq/screens/PH-09.jsx.
 * Hull-for-hull registrering med brutto score, ingen hex-farger.
 * KUN brutto score — aldri netto.
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  STANDARD_18_HOLES,
  type CourseHoleDef,
  formatToPar,
  beregnBruttoScore,
  beregnParForSpilteHull,
  tellSpilteHull,
  finnManglendeHull,
} from "@/lib/portal-runder/ph08-09-data";
import { type Ph0809Data } from "@/lib/portal-runder/load-ph08-09";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";

interface PH09RegistrerRundeProps {
  data: Ph0809Data;
}

const BTN_STEP_STYLE: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-card)",
  color: "var(--text-primary)",
  font: "600 17px/1 var(--font-mono)",
  cursor: "pointer",
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function HoleCell({
  i,
  par,
  len,
  v,
  err,
  onChange,
}: {
  i: number;
  par: number;
  len: number;
  v: number | null;
  err: boolean;
  onChange: (val: number) => void;
}) {
  const diff = v == null ? null : v - par;

  return (
    <div
      style={{
        border: "1px solid " + (err ? "var(--signal-ink)" : "var(--border-hairline)"),
        borderRadius: 8,
        background: "var(--surface-card)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          HULL {i + 1}
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          PAR {par} · {len} M
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          type="button"
          style={BTN_STEP_STYLE}
          aria-label={`Hull ${i + 1} ett slag mindre`}
          disabled={v == null || v <= 1}
          onClick={() => onChange((v ?? par) - 1)}
        >
          −
        </button>
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <span
            style={{
              font: "600 21px/1 var(--font-mono)",
              color: v == null ? "var(--text-muted)" : "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {v == null ? "—" : v}
          </span>
          {diff != null && (
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              {formatToPar(diff)}
            </span>
          )}
        </div>
        <button
          type="button"
          style={BTN_STEP_STYLE}
          aria-label={`Hull ${i + 1} ett slag mer`}
          onClick={() => onChange(v == null ? par : v + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PH09RegistrerRunde({ data }: PH09RegistrerRundeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const holesDef: CourseHoleDef[] = data.valgtBane?.hull || STANDARD_18_HOLES;
  const initialCourse = data.valgtBane?.navn || data.baner[0]?.navn || "Fredrikstad Golfklubb";
  const initialCourseId = data.valgtBane?.id || data.baner[0]?.id || "fredrikstad-gk";

  // State
  const [day, setDay] = useState<"I dag" | "I går" | "Velg dato">("I dag");
  const [_selectedCourse, setSelectedCourse] = useState<string>(initialCourse);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [courseQuery, setCourseQuery] = useState<string>("");
  const [tee, setTee] = useState<string>("Gul");
  const [holesMode, setHolesMode] = useState<"18 hull" | "9 hull · ut" | "9 hull · inn">("18 hull");
  const [roundType, setRoundType] = useState<"Treningsrunde" | "Tellende">("Treningsrunde");

  // Beregn intervall
  const range: [number, number] =
    holesMode === "9 hull · ut" ? [0, 9] : holesMode === "9 hull · inn" ? [9, 18] : [0, 18];
  const inRange = (i: number) => i >= range[0] && i < range[1];
  const nH = range[1] - range[0];

  // Hull-scores state: array med 18 elementer
  const [scores, setScores] = useState<(number | null)[]>(() => {
    // Forhåndsutfyll med par for de relevante hullene som en start-verdi for rask registrering
    return holesDef.map((h, i) => (inRange(i) ? h.par : null));
  });

  const [tried, setTried] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const missing = finnManglendeHull(scores, range[0], range[1]);
  const playedCount = tellSpilteHull(scores, range[0], range[1]);
  const brutto = beregnBruttoScore(scores, range[0], range[1]);
  const parList = holesDef.map((h) => h.par);
  const parPlayed = beregnParForSpilteHull(parList, scores, range[0], range[1]);
  const toParStr = formatToPar(brutto - parPlayed);

  const sumUt = beregnBruttoScore(scores, 0, 9);
  const sumInn = beregnBruttoScore(scores, 9, 18);

  // Filtrert baneliste
  const filtrerteBaner = data.baner.filter((b) =>
    b.navn.toLowerCase().includes(courseQuery.toLowerCase())
  );

  const handleHolesModeChange = (newMode: "18 hull" | "9 hull · ut" | "9 hull · inn") => {
    setHolesMode(newMode);
    const newRange: [number, number] =
      newMode === "9 hull · ut" ? [0, 9] : newMode === "9 hull · inn" ? [9, 18] : [0, 18];
    setScores((prev) =>
      holesDef.map((h, i) => (i >= newRange[0] && i < newRange[1] ? prev[i] || h.par : null))
    );
  };

  const handleSave = () => {
    setTried(true);
    setSaveError(null);

    if (missing.length > 0 || !selectedCourseId) {
      return;
    }

    startTransition(async () => {
      try {
        const playedDate = new Date();
        if (day === "I går") {
          playedDate.setDate(playedDate.getDate() - 1);
        }

        const hullDetaljer = holesDef
          .map((h, i) => {
            if (!inRange(i)) return null;
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
          courseId: selectedCourseId,
          playedAt: playedDate.toISOString(),
          score: brutto,
          holeScores: scores.filter((s): s is number => s !== null && s > 0),
          hullDetaljer,
        });

        setSaved(true);
        router.push("/portal/mal/runder");
      } catch (err: unknown) {
        console.error("Kunne ikke lagre runden:", err);
        const melding = err instanceof Error ? err.message : "Kunne ikke lagre runden over nett.";
        setSaveError(melding);
      }
    });
  };

  return (
    <div
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "24px 16px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Sidehode */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                font: "600 11px/1 var(--font-mono)",
                color: "var(--text-secondary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Etter runden · Brutto score
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, fontFamily: "var(--font-sans)" }}>
              Registrer runde
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Dato, bane og antall slag per hull. Putter og slag på banen registreres live under runden.
            </p>
          </div>
          <Link
            href="/portal/runde/live"
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span>●</span>
            <span>Registrer live</span>
          </Link>
        </div>
      </div>

      {/* 2-kolonners layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Venstre kolonne: Skjema og hullkort */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Kort 1: Dato, bane, tee, antall hull */}
          <div
            style={{
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-card)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Dato */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Dato
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {(["I dag", "I går", "Velg dato"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDay(d)}
                    style={{
                      height: 38,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid " + (day === d ? "var(--border-ink)" : "var(--border-hairline)"),
                      background: day === d ? "var(--primary)" : "var(--surface-sunken)",
                      color: day === d ? "var(--text-on-primary)" : "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Bane */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Bane
              </div>
              <input
                type="text"
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                placeholder="Søk bane …"
                style={{
                  width: "100%",
                  height: 42,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-sunken)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  boxSizing: "border-box",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 160, overflowY: "auto" }}>
                {filtrerteBaner.map((b) => {
                  const on = selectedCourseId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(b.navn);
                        setSelectedCourseId(b.id);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                        background: on ? "var(--primary)" : "var(--surface-sunken)",
                        color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {b.navn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Valg-grid: Tee, Antall hull, Type runde */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Tee
                </div>
                <div style={{ display: "flex", gap: 4, background: "var(--surface-sunken)", padding: 3, borderRadius: 8 }}>
                  {(["Hvit", "Gul", "Blå", "Rød"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTee(t)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 6,
                        border: "none",
                        background: tee === t ? "var(--surface-card)" : "transparent",
                        color: tee === t ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Antall hull
                </div>
                <div style={{ display: "flex", gap: 4, background: "var(--surface-sunken)", padding: 3, borderRadius: 8 }}>
                  {(["18 hull", "9 hull · ut", "9 hull · inn"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleHolesModeChange(m)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 6,
                        border: "none",
                        background: holesMode === m ? "var(--surface-card)" : "transparent",
                        color: holesMode === m ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: 11,
                        cursor: "pointer",
                        padding: "0 4px",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Type runde
                </div>
                <div style={{ display: "flex", gap: 4, background: "var(--surface-sunken)", padding: 3, borderRadius: 8 }}>
                  {(["Treningsrunde", "Tellende"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setRoundType(k)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 6,
                        border: "none",
                        background: roundType === k ? "var(--surface-card)" : "transparent",
                        color: roundType === k ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hull 1–9 · Ut */}
          {inRange(0) && (
            <div
              style={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-card)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Hull 1–9 · Ut
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  PAR {holesDef.slice(0, 9).reduce((a, b) => a + b.par, 0)}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 8,
                }}
              >
                {holesDef.slice(0, 9).map((h, k) => (
                  <HoleCell
                    key={h.nummer}
                    i={k}
                    par={h.par}
                    len={h.meter}
                    v={scores[k]}
                    err={tried && (scores[k] == null || scores[k]! <= 0)}
                    onChange={(val) => {
                      const ny = [...scores];
                      ny[k] = val;
                      setScores(ny);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hull 10–18 · Inn */}
          {inRange(9) && (
            <div
              style={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-card)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Hull 10–18 · Inn
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  PAR {holesDef.slice(9, 18).reduce((a, b) => a + b.par, 0)}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 8,
                }}
              >
                {holesDef.slice(9, 18).map((h, k) => {
                  const idx = 9 + k;
                  return (
                    <HoleCell
                      key={h.nummer}
                      i={idx}
                      par={h.par}
                      len={h.meter}
                      v={scores[idx]}
                      err={tried && (scores[idx] == null || scores[idx]! <= 0)}
                      onChange={(val) => {
                        const ny = [...scores];
                        ny[idx] = val;
                        setScores(ny);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Høyre kolonne: Oppsummeringskort */}
        <div
          style={{
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "sticky",
            top: 24,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Brutto score
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 44, fontWeight: 700, fontFamily: "var(--font-mono)", lineHeight: 1 }}>
              {playedCount > 0 ? brutto : "—"}
            </span>
            <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              {playedCount > 0 ? `slag (${toParStr})` : "slag"}
            </span>
          </div>

          {/* UT / INN / HULL bokser */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {[
              ["UT", inRange(0) ? sumUt : "—"],
              ["INN", inRange(9) ? sumInn : "—"],
              ["HULL", `${playedCount} / ${nH}`],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  background: "var(--surface-sunken)",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  {label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Valideringsvarsel hvis mangler */}
          {tried && missing.length > 0 && (
            <div
              style={{
                borderRadius: 8,
                background: "var(--signal-tint)",
                border: "1px solid var(--signal)",
                padding: "10px 12px",
                fontSize: 13,
                lineHeight: 1.4,
                color: "var(--text-primary)",
              }}
            >
              <strong>
                {missing.length === 1 ? `Hull ${missing[0]} mangler score` : `${missing.length} hull mangler score`}
              </strong>
              <div style={{ marginTop: 2, fontSize: 12 }}>
                Fyll inn alle {nH} hull, eller velg 9 hull under Antall hull.
              </div>
            </div>
          )}

          {saveError && (
            <div
              style={{
                borderRadius: 8,
                background: "var(--signal-tint)",
                border: "1px solid var(--signal-ink)",
                padding: "10px 12px",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              {saveError}
            </div>
          )}

          {/* Lagreknapp */}
          {saved ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "var(--ok-tint)",
                  color: "var(--ok)",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Lagret
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                SENDT TIL ANALYSE
              </span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              style={{
                height: 48,
                borderRadius: 8,
                border: "none",
                background: "var(--primary)",
                color: "var(--text-on-primary)",
                fontWeight: 650,
                fontSize: 15,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Check size={18} aria-hidden="true" />
              <span>{isPending ? "Lagrer runde …" : "Lagre runde"}</span>
            </button>
          )}

          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              lineHeight: 1.4,
              letterSpacing: "0.03em",
            }}
          >
            BRUTTO · TIL PAR REGNES AV PAR PÅ SPILTE HULL ({parPlayed || "—"})
          </div>
        </div>
      </div>
    </div>
  );
}

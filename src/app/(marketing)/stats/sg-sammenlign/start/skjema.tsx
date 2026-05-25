"use client";

/**
 * SgStartSkjema — 2-stegs wizard for SG-sammenligning onboarding.
 * Pixel-perfect port av design 08 fra design-handoff-stats-2026-05-25.
 *
 * Steg 1: Velg PGA-referansespiller (combobox + 12 quick-pick-cards)
 * Steg 2: Tab-bar "Bruk snittscore" | "Egne SG-tall" + real-time HCP-feedback
 */

import { useState, useTransition, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Loader2,
  Search,
  Trophy,
} from "lucide-react";
import { StatsRangeSlider } from "@/components/stats/stats-range-slider";

export type RefSpiller = {
  dgPlayerId: number;
  name: string;
  country: string | null;
  sgTotal: number;
  year: number;
};

type Modus = "FRA_SNITT" | "MANUELL_SG";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtSg(v: number) {
  return (v >= 0 ? "+" : "") + v.toFixed(2);
}

// Declared outside render — avoids react-hooks/static-components lint error
function StepDots({ step }: { step: number }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
      }}
    >
      {["Velg referanse", "Legg inn tall"].map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: i === step ? "#005840" : i < step ? "#D1F843" : "#E5E3DD",
              color: i === step ? "#D1F843" : i < step ? "#005840" : "#9D9C95",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              transition: "all 0.25s",
            }}
          >
            {i + 1}
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: i === step ? "#0A1F17" : "#9D9C95",
            }}
          >
            {label}
          </span>
          {i < 1 && (
            <div
              style={{
                width: 32,
                height: 1,
                background: step > i ? "#D1F843" : "#E5E3DD",
                marginLeft: 4,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SgStartSkjema({
  referanseSpillere,
  action,
  feil,
}: {
  referanseSpillere: RefSpiller[];
  action: (formData: FormData) => Promise<void>;
  feil?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [refSpiller, setRefSpiller] = useState<RefSpiller>(
    referanseSpillere[0]!,
  );
  const [modus, setModus] = useState<Modus>("FRA_SNITT");
  const [snittScore, setSnittScore] = useState(78);
  const [antallRunder, setAntallRunder] = useState(20);
  const [sgOtt, setSgOtt] = useState(0);
  const [sgApp, setSgApp] = useState(0);
  const [sgArg, setSgArg] = useState(0);
  const [sgPutt, setSgPutt] = useState(0);

  // Quick-picks: first 12 in the list
  const quickPicks = referanseSpillere.slice(0, 12);

  // Autocomplete results for combobox
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return referanseSpillere.filter((s) =>
      s.name.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query, referanseSpillere]);

  // HCP estimation
  const hcp = useMemo(() => {
    const raw = (snittScore - 70) * 1.05;
    return Math.max(0, Math.round(raw * 10) / 10);
  }, [snittScore]);

  const tourEqv = useMemo(() => {
    return (snittScore + 4.4).toFixed(1);
  }, [snittScore]);

  const sgTotal = sgOtt + sgApp + sgArg + sgPutt;

  function pickSpiller(s: RefSpiller) {
    setRefSpiller(s);
    setQuery(s.name);
  }

  function handleSubmit() {

    const fd = new FormData();
    fd.set("refDgPlayerId", String(refSpiller.dgPlayerId));
    fd.set("modus", modus);
    if (modus === "FRA_SNITT") {
      fd.set("snittScore", String(snittScore));
      fd.set("antallRunder", String(antallRunder));
    } else {
      fd.set("sgOtt", String(sgOtt));
      fd.set("sgApp", String(sgApp));
      fd.set("sgArg", String(sgArg));
      fd.set("sgPutt", String(sgPutt));
    }
    startTransition(async () => {
      await action(fd);
    });
  }

  return (
    <div>
      {feil && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "rgba(163,45,45,0.08)",
            border: "1px solid rgba(163,45,45,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 14,
            color: "#A32D2D",
          }}
        >
          <AlertCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{feil}</span>
        </div>
      )}

      <StepDots step={step} />

      {/* ══ STEG 1 — Velg referansespiller ════════════════════════════ */}
      {step === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#005840",
                marginBottom: 12,
              }}
            >
              STEG 1 AV 2
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Velg din{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#005840",
                }}
              >
                referansespiller
              </em>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "#5E5C57",
                marginTop: 12,
                maxWidth: 500,
                margin: "12px auto 0",
              }}
            >
              Topp 100 på PGA Tour etter Strokes Gained. Velg en du er
              nysgjerrig på.
            </p>
          </div>

          {/* Combobox */}
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#FFFFFF",
                border: "1.5px solid #E5E3DD",
                borderRadius: 12,
                padding: "12px 16px",
                boxShadow: "0 1px 3px rgba(10,31,23,0.06)",
                transition: "border-color 0.15s",
              }}
            >
              <Search size={16} color="#9D9C95" />
              <input
                type="text"
                placeholder="Søk spiller — f.eks. «McIlroy» eller «Hovland»"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 15,
                  color: "#0A1F17",
                }}
              />
              {refSpiller && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#005840",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    background: "rgba(0,88,64,0.08)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  SG {fmtSg(refSpiller.sgTotal)}
                </span>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  border: "1px solid #E5E3DD",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(10,31,23,0.1)",
                  zIndex: 50,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s.dgPlayerId}
                    onClick={() => {
                      pickSpiller(s);
                      setQuery("");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      border: "none",
                      background:
                        refSpiller.dgPlayerId === s.dgPlayerId
                          ? "rgba(0,88,64,0.06)"
                          : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#F1EEE5",
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#005840",
                        flexShrink: 0,
                      }}
                    >
                      {initials(s.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-display)",
                          color: "#0A1F17",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9D9C95",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        SG {fmtSg(s.sgTotal)} · {s.year}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick-picks label */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#9D9C95",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            ELLER VELG FRA QUICK-PICKS
          </div>

          {/* Quick-pick grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 10,
              maxWidth: 720,
              margin: "0 auto 40px",
            }}
          >
            {quickPicks.map((s) => {
              const selected = refSpiller.dgPlayerId === s.dgPlayerId;
              return (
                <button
                  key={s.dgPlayerId}
                  onClick={() => pickSpiller(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: selected ? "#005840" : "#FFFFFF",
                    border: selected
                      ? "1.5px solid #005840"
                      : "1.5px solid #E5E3DD",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s",
                    transform: selected ? "scale(1.02)" : "scale(1)",
                    boxShadow: selected
                      ? "0 4px 12px rgba(0,88,64,0.2)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: selected ? "#D1F843" : "#F1EEE5",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#005840",
                      flexShrink: 0,
                    }}
                  >
                    {initials(s.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: selected ? "#D1F843" : "#0A1F17",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: selected ? "rgba(209,248,67,0.7)" : "#9D9C95",
                        marginTop: 1,
                      }}
                    >
                      SG {fmtSg(s.sgTotal)}
                    </div>
                  </div>
                  {selected && (
                    <Trophy
                      size={14}
                      color="#D1F843"
                      style={{ marginLeft: "auto", flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setStep(1)}
              disabled={!refSpiller}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                background: refSpiller ? "#005840" : "#E5E3DD",
                color: refSpiller ? "#D1F843" : "#9D9C95",
                border: "none",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 600,
                cursor: refSpiller ? "pointer" : "not-allowed",
                transition: "all 0.18s",
              }}
            >
              Neste — legg inn dine tall
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══ STEG 2 — Legg inn tall ═══════════════════════════════════ */}
      {step === 1 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#005840",
                marginBottom: 12,
              }}
            >
              STEG 2 AV 2 · REFERANSESPILLER:{" "}
              {refSpiller.name.toUpperCase()}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Legg inn{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#005840",
                }}
              >
                dine tall
              </em>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "#5E5C57",
                marginTop: 12,
                maxWidth: 500,
                margin: "12px auto 0",
              }}
            >
              Bruk snittscoren din — vi estimerer SG-fordelingen via
              Broadie-tabellen.
            </p>
          </div>

          {/* Tab-bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "#F1EEE5",
                borderRadius: 999,
                padding: 3,
                border: "1px solid #E5E3DD",
              }}
            >
              {(
                [
                  { id: "FRA_SNITT", label: "Bruk snittscore" },
                  { id: "MANUELL_SG", label: "Jeg har egne SG-tall" },
                ] as { id: Modus; label: string }[]
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setModus(id)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 999,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: modus === id ? "#005840" : "transparent",
                    color: modus === id ? "#D1F843" : "#5E5C57",
                    boxShadow:
                      modus === id ? "0 2px 6px rgba(0,88,64,0.25)" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Bruk snittscore */}
          {modus === "FRA_SNITT" && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E3DD",
                borderRadius: 16,
                padding: "40px 48px",
                textAlign: "center",
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#9D9C95",
                  marginBottom: 8,
                }}
              >
                SNITTSCORE (BRUTTO)
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 72,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: "#0A1F17",
                  marginBottom: 24,
                }}
              >
                {snittScore}
              </div>

              <div style={{ maxWidth: 420, margin: "0 auto 32px" }}>
                <StatsRangeSlider
                  value={snittScore}
                  min={60}
                  max={130}
                  step={0.5}
                  onChange={setSnittScore}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "#9D9C95",
                    }}
                  >
                    60
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "#9D9C95",
                    }}
                  >
                    130
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    label: "ANTALL RUNDER",
                    value: antallRunder,
                    setter: setAntallRunder,
                    type: "number",
                  },
                ].map(() => (
                  <div key="runder">
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#9D9C95",
                        marginBottom: 4,
                      }}
                    >
                      ANTALL RUNDER
                    </div>
                    <input
                      type="number"
                      value={antallRunder}
                      min={1}
                      max={500}
                      onChange={(e) =>
                        setAntallRunder(Number(e.target.value))
                      }
                      style={{
                        width: 100,
                        fontFamily: "var(--font-mono)",
                        fontSize: 28,
                        fontWeight: 500,
                        border: "1px solid #E5E3DD",
                        borderRadius: 8,
                        padding: "8px 12px",
                        background: "#FAFAF7",
                        textAlign: "center",
                        color: "#0A1F17",
                      }}
                    />
                  </div>
                ))}

                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#9D9C95",
                      marginBottom: 4,
                    }}
                  >
                    ESTIMERT HCP
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 500,
                      color: "#0A1F17",
                    }}
                  >
                    {hcp.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#9D9C95",
                      marginBottom: 4,
                    }}
                  >
                    TOUR-EKVIVALENT
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 500,
                      color: "#005840",
                    }}
                  >
                    {tourEqv}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "#9D9C95",
                  marginTop: 20,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                Med {snittScore} i snittscore er du ca HCP {hcp.toFixed(1)} ·
                Tour-ekvivalent: ca {tourEqv} på PGA-bane
              </p>
            </div>
          )}

          {/* Tab: Egne SG-tall */}
          {modus === "MANUELL_SG" && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E3DD",
                borderRadius: 16,
                padding: "40px 48px",
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {(
                  [
                    { key: "ott", label: "SG: OFF THE TEE", value: sgOtt, setter: setSgOtt },
                    { key: "app", label: "SG: APPROACH", value: sgApp, setter: setSgApp },
                    { key: "arg", label: "SG: AROUND GREEN", value: sgArg, setter: setSgArg },
                    { key: "putt", label: "SG: PUTTING", value: sgPutt, setter: setSgPutt },
                  ] as const
                ).map((f) => (
                  <div
                    key={f.key}
                    style={{
                      borderBottom: "1px solid #F1EEE5",
                      paddingBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#9D9C95",
                        marginBottom: 8,
                      }}
                    >
                      {f.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="number"
                        value={f.value}
                        step={0.1}
                        min={-10}
                        max={10}
                        onChange={(e) => f.setter(Number(e.target.value))}
                        style={{
                          width: 100,
                          fontFamily: "var(--font-mono)",
                          fontSize: 28,
                          fontWeight: 500,
                          border: "1px solid #E5E3DD",
                          borderRadius: 8,
                          padding: "8px 12px",
                          background: "#FAFAF7",
                          color: f.value >= 0 ? "#005840" : "#A32D2D",
                        }}
                      />
                    </div>
                    <StatsRangeSlider
                      value={f.value}
                      min={-5}
                      max={5}
                      step={0.1}
                      onChange={f.setter}
                    />
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid #E5E3DD",
                  marginTop: 24,
                  paddingTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#9D9C95",
                  }}
                >
                  SG TOTAL
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 24,
                    fontWeight: 600,
                    color: sgTotal >= 0 ? "#005840" : "#A32D2D",
                  }}
                >
                  {sgTotal >= 0 ? "+" : ""}
                  {sgTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 40,
              maxWidth: 600,
              margin: "40px auto 0",
            }}
          >
            <button
              type="button"
              onClick={() => setStep(0)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                background: "#F1EEE5",
                color: "#0A1F17",
                border: "1px solid #E5E3DD",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} />
              Tilbake
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                background: "#005840",
                color: "#D1F843",
                border: "none",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Beregner ...
                </>
              ) : (
                <>
                  Se min sammenligning
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

"use client";

/**
 * StatsQuizCard — Buzzfeed-stil quiz spørsmål-card med instant feedback
 * Client component.
 */

import { useState } from "react";
import type { QuizSporsmal } from "@/data/quiz-questions";

interface StatsQuizCardProps {
  sporsmal: QuizSporsmal;
  nummer?: number;
  totalt?: number;
  onSvar: (korrekt: boolean) => void;
}

export function StatsQuizCard({ sporsmal, onSvar }: StatsQuizCardProps) {
  const [valgt, setValgt] = useState<number | null>(null);
  const besvart = valgt !== null;

  const handleValg = (idx: number) => {
    if (besvart) return;
    setValgt(idx);
    const korrekt = sporsmal.valg[idx]?.korrekt ?? false;
    setTimeout(() => onSvar(korrekt), 1600);
  };

  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      {/* Spørsmål */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          {sporsmal.sporsmaal}
        </div>
      </div>

      {/* 2x2 grid av valg */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 24,
      }}>
        {sporsmal.valg.map((v, i) => {
          let bg = "#FFFFFF";
          let border = "hsl(var(--border))";
          let color = "hsl(var(--foreground))";

          if (besvart && i === valgt) {
            if (v.korrekt) { bg = "hsl(var(--accent))"; border = "#B8E020"; color = "hsl(var(--foreground))"; }
            else { bg = "#FEE2E2"; border = "#F87171"; color = "#7F1D1D"; }
          } else if (besvart && v.korrekt) {
            bg = "hsl(var(--accent))"; border = "#B8E020"; color = "hsl(var(--foreground))";
          }

          return (
            <button
              key={i}
              onClick={() => handleValg(i)}
              disabled={besvart}
              style={{
                padding: "20px 16px",
                borderRadius: 12,
                border: `2px solid ${border}`,
                background: bg,
                color,
                fontFamily: "var(--font-mono)",
                fontSize: 20,
                fontWeight: 600,
                cursor: besvart ? "default" : "pointer",
                transition: "all 0.2s ease",
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
                transform: !besvart ? undefined : undefined,
              }}
              aria-label={v.tekst}
            >
              {v.tekst}
            </button>
          );
        })}
      </div>

      {/* Feedback etter svar */}
      {besvart && (
        <div style={{
          padding: "20px 24px",
          borderRadius: 12,
          background: sporsmal.valg[valgt]?.korrekt ? "hsl(var(--accent))" : "#FEE2E2",
          border: `1px solid ${sporsmal.valg[valgt]?.korrekt ? "#B8E020" : "#F87171"}`,
          color: sporsmal.valg[valgt]?.korrekt ? "hsl(var(--foreground))" : "#7F1D1D",
          animation: "stats-quiz-fadein 0.3s ease",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 8,
          }}>
            {sporsmal.valg[valgt]?.korrekt ? "RIKTIG" : `FEIL — riktig var ${sporsmal.valg.find(v => v.korrekt)?.tekst}`}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 8 }}>
            {sporsmal.forklaring}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", opacity: 0.7 }}>
            KILDE: {sporsmal.kilde}
          </div>
        </div>
      )}
    </div>
  );
}

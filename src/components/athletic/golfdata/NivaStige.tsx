import type React from "react";

/**
 * AK Golf HQ — NivaStige
 * AK-stige / nivåprogresjon (gamification): nåværende nivå + dotted fremdrift mot neste.
 * Didaktisk/data-bundet, aldri dekor. Fremdrift 0–1 innen nåværende nivå.
 * Portet 1:1 fra Claude Design-prosjektets components/domain/NivaStige.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-stige).
 */

export type NivaStigeProps = {
  /** Nivå-koden i badgen, f.eks. "D" eller 3. */
  nivaa: React.ReactNode;
  etikett?: string;
  /** Antall prikker totalt. */
  steg?: number;
  /** Antall hele fylte prikker. */
  fylte?: number;
  /** 0–1: fyller neste prikk halvt når 0 < fremdrift < 1. */
  fremdrift?: number;
  nesteEtikett?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function NivaStige({
  nivaa,
  etikett,
  steg = 5,
  fylte = 0,
  fremdrift,
  nesteEtikett,
  className = "",
  style,
}: NivaStigeProps) {
  const dots = Array.from({ length: steg }, (_, i) => {
    if (i < fylte) return "on";
    if (i === fylte && fremdrift && fremdrift > 0 && fremdrift < 1) return "half";
    return "off";
  });
  return (
    <div className={`ak-stige ${className}`} style={style}>
      <div className="ak-stige__head">
        <span className="ak-stige__badge">{nivaa}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-14)", color: "var(--text)" }}>
            {etikett || `Nivå ${nivaa}`}
          </div>
          <div className="ak-stige__meta" style={{ marginTop: 3 }}>
            {fylte} av {steg} nådd{nesteEtikett ? ` · neste: ${nesteEtikett}` : ""}
          </div>
        </div>
      </div>
      <div className="ak-stige__dots" role="img" aria-label={`Nivå ${nivaa}: ${fylte} av ${steg} nådd`}>
        {dots.map((d, i) => (
          <span key={i} className={`ak-stige__dot${d === "on" ? " ak-stige__dot--on" : d === "half" ? " ak-stige__dot--half" : ""}`} />
        ))}
      </div>
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";

/**
 * Sesongbåndet — én komponent brukt av BÅDE elevens årsplan og trenerens.
 *
 * Dette er fiksen på svakhet 2 i designnotatet: før hadde de to rollene hver
 * sin tidslinje, med egne farger og eget språk, så samme sesong så ut som to
 * produkter. Nå deler de bånd, «du er her», uketall og periodefarger — det
 * treneren får i tillegg (pyramide, læringsfase, mål, tester) kommer utenpå,
 * ikke i stedet.
 *
 * Fargene følger med i dataene fordi rollene har ulike perioder: eleven ser
 * tre (Grunn/Spesialisering/Turnering), treneren fire (TURN-rest først).
 */

export interface SesongbandPeriode {
  key: string;
  navn: string;
  /** var(--…)-farge. Elev bruker PERIOD_COL, trener bruker COACH_PERIODS. */
  farge: string;
  /** Relativ bredde — antall uker. Segmentene deler bredden i dette forholdet. */
  vekt: number;
  naa: boolean;
}

export interface SesongbandProps {
  /** «Uke 4 av 45 · Periode 1 av 3» */
  overtittel: string;
  /** «Grunnperiode» */
  tittel: string;
  /** «12 uker igjen. Neste milepæl: Klubbmesterskap 11. september.» */
  undertittel?: string;
  perioder: SesongbandPeriode[];
  /** Posisjon 0–100 for «du er her»-markøren. */
  naaPct: number;
  /** «Du er her · 2. sep» — kortes til «Du er her» på mobil. */
  naaLabel: string;
  /** Tolv korte månedsnavn i sesongrekkefølge. */
  maaneder: string[];
}

const kort: CSSProperties = {
  background: "var(--grad-hero-line)",
  boxShadow: "var(--shadow-hero)",
  color: "var(--text-on-dark)",
  flex: "none",
};

const overtittelStil: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-brand)",
  fontWeight: 700,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "var(--wang-mint)",
  fontVariantNumeric: "tabular-nums",
};

const undertittelStil: CSSProperties = {
  display: "block",
  lineHeight: 1.55,
  color: "var(--text-on-dark-dim)",
};

const maanedStil: CSSProperties = {
  fontFamily: "var(--font-brand)",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
};

/** Hvit pille som markerer nåtid. Klemmes inn fra kantene så den ikke stikker ut. */
function NaaMarkor({
  pct,
  label,
  hoyde,
  fontSize,
}: {
  pct: number;
  label: string;
  hoyde: number;
  fontSize: number;
}) {
  const klemt = Math.min(96, Math.max(4, pct));
  return (
    <span style={{ display: "block", position: "relative", height: hoyde + 1, marginTop: 4 }}>
      <span
        style={{
          position: "absolute",
          left: `${klemt}%`,
          transform: "translateX(-50%)",
          display: "inline-flex",
          alignItems: "center",
          height: hoyde,
          padding: `0 ${Math.round(hoyde / 2)}px`,
          borderRadius: "var(--radius-chip)",
          background: "var(--white)",
          color: "var(--wang-navy)",
          fontFamily: "var(--font-brand)",
          fontWeight: 800,
          fontSize,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function Sesongband({
  overtittel,
  tittel,
  undertittel,
  perioder,
  naaPct,
  naaLabel,
  maaneder,
}: SesongbandProps) {
  const kortNaaLabel = "Du er her";

  return (
    <>
      {/* ---- Mobil: stablet, tynne striper uten navn ---- */}
      <div
        className="wang-vis-mobil"
        style={{ ...kort, borderRadius: 24, padding: "17px 18px 16px" }}
      >
        <span style={{ ...overtittelStil, fontSize: 10 }}>{overtittel}</span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: 23,
            letterSpacing: "-0.015em",
            marginTop: 5,
          }}
        >
          {tittel}
        </span>
        {undertittel ? (
          <span style={{ ...undertittelStil, fontSize: 13, marginTop: 5 }}>{undertittel}</span>
        ) : null}

        <span style={{ display: "flex", gap: 3, marginTop: 15 }}>
          {perioder.map((p) => (
            <span
              key={p.key}
              style={{
                flex: p.vekt,
                height: 7,
                borderRadius: 3,
                background: p.farge,
                opacity: p.naa ? 1 : 0.55,
              }}
            />
          ))}
        </span>

        <NaaMarkor pct={naaPct} label={kortNaaLabel} hoyde={16} fontSize={8.5} />

        <span
          style={{
            ...maanedStil,
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
            fontSize: 9,
          }}
        >
          {[0, 4, 7, 10].map((i) => (
            <span key={i}>{maaneder[i]}</span>
          ))}
        </span>
      </div>

      {/* ---- Desktop: to kolonner, navngitte segmenter over månedsrutenett ---- */}
      <div
        className="wang-vis-desktop"
        style={{
          ...kort,
          borderRadius: "var(--radius-card)",
          padding: "24px 28px 22px",
          display: "flex",
          gap: 34,
          alignItems: "flex-start",
        }}
      >
        <span style={{ flex: "none", minWidth: 250, maxWidth: 320 }}>
          <span style={{ ...overtittelStil, fontSize: 11 }}>{overtittel}</span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "-0.02em",
              marginTop: 7,
            }}
          >
            {tittel}
          </span>
          {undertittel ? (
            <span style={{ ...undertittelStil, fontSize: 14.5, marginTop: 7 }}>{undertittel}</span>
          ) : null}
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              ...maanedStil,
              display: "grid",
              gridTemplateColumns: "repeat(12,1fr)",
              gap: 3,
              fontSize: 9.5,
              marginBottom: 7,
            }}
          >
            {maaneder.map((m, i) => (
              <span key={`${m}-${i}`} style={{ textAlign: "center", overflow: "hidden" }}>
                {m}
              </span>
            ))}
          </span>

          <span style={{ display: "flex", gap: 4 }}>
            {perioder.map((p) => (
              <span
                key={p.key}
                title={p.navn}
                style={{
                  flex: p.vekt,
                  minWidth: 0,
                  height: 30,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 11px",
                  background: p.farge,
                  opacity: p.naa ? 1 : 0.62,
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 11,
                  color: "var(--text-on-dark)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.navn}
              </span>
            ))}
          </span>

          <NaaMarkor pct={naaPct} label={naaLabel} hoyde={19} fontSize={9.5} />
        </span>
      </div>
    </>
  );
}

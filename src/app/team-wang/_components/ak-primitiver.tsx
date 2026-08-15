"use client";

/**
 * Primitiver som er delt mellom elevens årsplan, IUP-samtalen og trenerflaten.
 *
 * To regler bor her, og de er grunnen til at filen finnes:
 *  1. Pyramideaksen har FAST farge per akse — aldri farge etter verdi. Samme
 *     kanon som PY_AXES i trenerens periodekort.
 *  2. Status er tre trinn, ett sted. Årsplanen og IUP-samtalen viste ellers
 *     lett hver sin skala, og da betyr «på vei» to ting.
 */

import type { CSSProperties } from "react";

export type AkAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

/** Fast farge per akse. Speiler PY_AXES i _data/coach-arsplan.ts. */
export const AKSE_FARGE: Record<AkAkse, { bg: string; fg: string; ren: string }> = {
  FYS: { bg: "var(--tint-navy)", fg: "var(--wang-navy)", ren: "var(--wang-navy)" },
  TEK: { bg: "var(--tint-teal)", fg: "var(--wang-teal-text)", ren: "var(--wang-teal)" },
  SLAG: { bg: "var(--tint-orange)", fg: "var(--cat-orange-text)", ren: "var(--cat-orange)" },
  SPILL: { bg: "var(--tint-blue)", fg: "var(--cat-blue-text)", ren: "var(--cat-blue)" },
  TURN: { bg: "var(--tint-purple)", fg: "var(--cat-purple)", ren: "var(--cat-purple)" },
};

export const AKSE_REKKEFOLGE: AkAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Full tekst til tooltip — aksene er forkortelser, ikke alle kan dem utenat. */
export const AKSE_NAVN: Record<AkAkse, string> = {
  FYS: "Fysisk trening",
  TEK: "Teknikk",
  SLAG: "Slagtrening",
  SPILL: "Spill på bane",
  TURN: "Turnering",
};

// ---- Status: tre trinn, én kanon ---------------------------------------

export type MaalStatus = "IKKE_STARTET" | "PAA_VEI" | "NAADD";

export const STATUS_TEKST: Record<MaalStatus, string> = {
  IKKE_STARTET: "Ikke startet",
  PAA_VEI: "På vei",
  NAADD: "Nådd",
};

const STATUS_FARGE: Record<MaalStatus, { bg: string; fg: string }> = {
  IKKE_STARTET: { bg: "var(--neutral-100)", fg: "var(--text-secondary)" },
  PAA_VEI: { bg: "var(--tint-orange)", fg: "var(--cat-orange-text)" },
  NAADD: { bg: "var(--tint-teal)", fg: "var(--wang-teal-text)" },
};

// ---- Komponenter -------------------------------------------------------

/** Firkantet akse-merke, f.eks. «TEK». Fast bredde så listen ikke hopper. */
export function AkseChip({ akse, size = 9.5 }: { akse: AkAkse; size?: number }) {
  const f = AKSE_FARGE[akse];
  return (
    <span
      title={AKSE_NAVN[akse]}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        height: 22,
        padding: "0 8px",
        borderRadius: 7,
        background: f.bg,
        color: f.fg,
        fontFamily: "var(--font-brand)",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "0.05em",
        flex: "none",
      }}
    >
      {akse}
    </span>
  );
}

/** Statuspille i de tre trinnene. Aldri en fjerde verdi. */
export function MaalStatusChip({ status, size = 9.5 }: { status: MaalStatus; size?: number }) {
  const f = STATUS_FARGE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: "var(--radius-chip)",
        background: f.bg,
        color: f.fg,
        fontFamily: "var(--font-brand)",
        fontWeight: 700,
        fontSize: size,
        whiteSpace: "nowrap",
        flex: "none",
      }}
    >
      {STATUS_TEKST[status]}
    </span>
  );
}

/**
 * Vurdering 1–5 som prikker. Egenvurdering og trenervurdering står side om
 * side i IUP-samtalen, derfor er fargen en parameter og ikke fast.
 */
export function VurderingPrikker({
  verdi,
  farge,
  label,
}: {
  verdi: number | null;
  farge: string;
  label: string;
}) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      role="img"
      aria-label={verdi === null ? `${label}: ikke satt` : `${label}: ${verdi} av 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: "var(--radius-chip)",
            flex: "none",
            background: verdi !== null && i <= verdi ? farge : "var(--neutral-200)",
          }}
        />
      ))}
    </span>
  );
}

/**
 * Pyramidefordelingen som ett vannrett bånd. Akse-etiketten vises kun når
 * segmentet er bredt nok til å bære den.
 */
export function PyramideBand({
  fordeling,
  stor,
}: {
  fordeling: Record<AkAkse, number>;
  stor?: boolean;
}) {
  const aktive = AKSE_REKKEFOLGE.filter((a) => fordeling[a] > 0);
  const rad: CSSProperties = {
    display: "flex",
    height: stor ? 34 : 24,
    borderRadius: 8,
    overflow: "hidden",
    background: "var(--neutral-100)",
  };
  return (
    <span style={{ display: "block" }}>
      <span style={rad}>
        {aktive.map((a) => (
          <span
            key={a}
            title={`${AKSE_NAVN[a]}: ${fordeling[a]} %`}
            style={{
              flex: fordeling[a],
              background: AKSE_FARGE[a].ren,
              color: "var(--text-on-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: stor ? 11 : 9.5,
              letterSpacing: "0.04em",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {fordeling[a] >= 15 ? a : ""}
          </span>
        ))}
      </span>
      <span
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 12px",
          marginTop: 8,
        }}
      >
        {aktive.map((a) => (
          <span
            key={a}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--font-brand)",
              fontWeight: 700,
              fontSize: 10.5,
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                flex: "none",
                background: AKSE_FARGE[a].ren,
              }}
            />
            {a} {fordeling[a]} %
          </span>
        ))}
      </span>
    </span>
  );
}

// ---- Formatering -------------------------------------------------------

/** 90 → «1,5 t», 120 → «2 t», 45 → «45 min». Norsk desimalkomma. */
export function formaterEgentid(minutter: number): string {
  if (minutter < 60) return `${minutter} min`;
  const timer = minutter / 60;
  const tekst = Number.isInteger(timer)
    ? String(timer)
    : timer.toFixed(1).replace(".", ",").replace(/,0$/, "");
  return `${tekst} t`;
}

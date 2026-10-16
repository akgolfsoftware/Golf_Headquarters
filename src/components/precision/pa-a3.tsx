/**
 * Precision Athletics — grunnkomponenter spesifikke for bolk A3
 * (Planlegge og gjennomføre). Egen fil per instruks, for å unngå at
 * parallelle grener (A1/A2/A4/A5) endrer samme linje i pa.tsx.
 *
 * Rene inline-stiler mot tokens (samme mønster som PH01IDag) — ikke en
 * egen stilark: node tests/visual/precision/maal.mjs laster kun
 * precision-komponenter.css og precision-athletics.css, så en tredje,
 * bolk-spesifikk fil ville aldri blitt målt.
 */
import type { ReactNode } from "react";

export function Initialer({ navn, size = 40 }: { navn: string | null; size?: number }) {
  const i = (navn ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]!.toUpperCase())
    .join("");
  return (
    <span className="pa-avatar" style={{ width: size, height: size, fontSize: size > 32 ? 14 : 12 }} aria-hidden>
      {i || "?"}
    </span>
  );
}

/** Tynn fremdriftslinje (minutter igjen av en pågående økt e.l.). */
export function Fremdriftslinje({ pct }: { pct: number }) {
  const trygg = Math.min(100, Math.max(0, pct));
  return (
    <span
      role="progressbar"
      aria-valuenow={trygg}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ display: "block", height: 6, borderRadius: 999, background: "var(--surface-sunken)", overflow: "hidden" }}
    >
      <span style={{ display: "block", height: "100%", width: `${trygg}%`, background: "var(--primary)", borderRadius: 999 }} />
    </span>
  );
}

/** Rad med to kolonner (nøkkel/verdi), mono verdi, brukt i økt- og øktark-kort. */
export function Nokkellinje({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>{k}</span>
      <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>
    </div>
  );
}

import { Icon } from "./Icon";

/**
 * AK Golf HQ — DeltaIndikator
 * Frittstående delta: retningspil + verdi i mono/tabular.
 * Opp = --up (lime), ned = --down (coral), flat = muted.
 * Redundant koding (pil + fortegn + farge) — aldri farge alene.
 */

export type DeltaIndikatorProps = {
  /** Delta som visningsstreng m/ fortegn, f.eks. "+0,4" / "−1,2" / "0". */
  verdi: string;
  /** Retning — utledes av fortegn om utelatt. "flat" = nøytral grå. */
  retning?: "opp" | "ned" | "flat";
  /** Snu fargelogikken (f.eks. ACWR der ned er bra). */
  invertert?: boolean;
  /** Størrelse: "sm" (11px, default) · "md" (13px). */
  size?: "sm" | "md";
  /** Tilgjengelig kontekst, f.eks. "siste 4 runder". */
  srLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function DeltaIndikator({ verdi, retning, invertert = false, size = "sm", srLabel, className = "", style }: DeltaIndikatorProps) {
  let dir = retning;
  if (!dir) {
    const s = String(verdi).trim();
    dir = s.startsWith("-") || s.startsWith("−") ? "ned" : /^[0]([,.]0+)?$/.test(s) ? "flat" : "opp";
  }
  const tone = dir === "flat" ? "flat" : invertert ? (dir === "opp" ? "ned" : "opp") : dir;
  const ikon = dir === "opp" ? "arrow-up-right" : dir === "ned" ? "arrow-down-right" : "minus";
  return (
    <span className={`ak-delta ak-delta--${size} ak-delta--${tone} ${className}`} style={style}>
      <Icon name={ikon} size={size === "sm" ? 11 : 13} />
      <span>{verdi}</span>
      {srLabel && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{srLabel}</span>}
    </span>
  );
}

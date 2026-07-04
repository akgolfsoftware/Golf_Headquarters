import type React from "react";

/**
 * AK Golf HQ — DataPreview
 * Delt hover/scrubber-primitiv: et lite kort som viser verdien for punktet under
 * pekeren. Verdi i JetBrains Mono, kort label over, valgfri delta (--up/--down).
 * PRESENTASJONELT: forelderen eier hover-geometrien og posisjonerer via x/y;
 * dette kortet eier bare utseendet + inn/ut-bevegelsen. CSS: ./golfdata.css (.ak-dpv).
 */

export type DataPreviewRow = {
  /** Prikkfarge (f.eks. akse-token). Utelates for ingen prikk. */
  color?: string;
  /** Kort radetikett (mono). */
  label: React.ReactNode;
  /** Radverdi (mono, tabular-nums). */
  value: React.ReactNode;
  /** Valgfri farge på radverdien. */
  valueColor?: string;
};

export type DataPreviewProps = {
  /** Synlig? Hold montert og toggle denne for jevn inn/ut-fade. Default true. */
  visible?: boolean;
  /** Venstre-posisjon i forelderens position:relative-boks (px-tall eller CSS-streng). */
  x?: number | string;
  /** Topp-posisjon (px-tall eller CSS-streng). */
  y?: number | string;
  /** Hvilken side av punktet kortet legger seg. Default "top". */
  placement?: "top" | "bottom" | "left" | "right";
  /** Kort eyebrow-label over verdien (mono, muted). */
  label?: React.ReactNode;
  /** Hovedverdi (mono). Ignoreres når rows er satt. */
  value?: React.ReactNode;
  /** Liten enhet etter verdien. */
  unit?: React.ReactNode;
  /** Delta: tall (fortegn utleder retning + «+»-prefiks) eller ferdig formatert streng. */
  delta?: number | string;
  /** Overstyr delta-retning/-farge. Ellers utledet fra fortegnet på delta. */
  deltaDir?: "up" | "down" | "flat";
  /** Flerrad-modus (f.eks. SG-akser eller AK-formel). Overstyrer value. */
  rows?: DataPreviewRow[];
  /** Valgfri klarspråk-note under verdien (UI-font, wrapper). */
  note?: React.ReactNode;
  /** Aksentfarge på hovedverdien (f.eks. akse-farge). */
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
};

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const ArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

function coord(v: number | string): string {
  return typeof v === "number" ? `${v}px` : v;
}

export function DataPreview({
  visible = true,
  x = "50%",
  y = 0,
  placement = "top",
  label,
  value,
  unit,
  delta,
  deltaDir,
  rows,
  note,
  accent,
  className = "",
  style,
}: DataPreviewProps) {
  let dir = deltaDir;
  if (!dir && delta != null) {
    const num =
      typeof delta === "number"
        ? delta
        : parseFloat(String(delta).replace(",", ".").replace(/[^\d.\-+]/g, ""));
    dir = isNaN(num) || num === 0 ? "flat" : num > 0 ? "up" : "down";
  }
  const deltaText =
    delta == null
      ? null
      : typeof delta === "number"
        ? (delta > 0 ? "+" : "") + String(delta).replace(".", ",")
        : delta;

  return (
    <div
      className={`ak-dpv ${className}`}
      data-show={visible ? "1" : "0"}
      data-place={placement}
      role="status"
      aria-hidden={visible ? undefined : "true"}
      style={{ left: coord(x), top: coord(y), ...style }}
    >
      {label != null && <div className="ak-dpv__lbl">{label}</div>}

      {rows && rows.length > 0 ? (
        <div className="ak-dpv__rows">
          {rows.map((r, i) => (
            <div className="ak-dpv__row" key={i}>
              <span className="ak-dpv__row-lbl">
                {r.color && <span className="ak-dpv__row-dot" style={{ background: r.color }} />}
                {r.label}
              </span>
              <span className="ak-dpv__row-val" style={r.valueColor ? { color: r.valueColor } : undefined}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      ) : value != null ? (
        <div className="ak-dpv__main">
          <span className="ak-dpv__val" style={accent ? { color: accent } : undefined}>
            {value}
          </span>
          {unit != null && <span className="ak-dpv__unit">{unit}</span>}
        </div>
      ) : null}

      {deltaText != null && (
        <span className="ak-dpv__delta" data-dir={dir}>
          {dir === "up" ? <ArrowUp /> : dir === "down" ? <ArrowDown /> : null}
          {deltaText}
        </span>
      )}

      {note != null && <div className="ak-dpv__note">{note}</div>}
    </div>
  );
}

/**
 * nearestIndex — delt scrubber-hjelper. Gitt pekerens clientX, elementets
 * bounding-rect, antall punkter og en funksjon xFrac(i)→0..1, returner indeksen
 * til nærmeste punkt.
 */
export function nearestIndex(
  clientX: number,
  rect: DOMRect,
  count: number,
  xFrac?: (i: number) => number,
): number {
  if (!rect || count < 1) return 0;
  const f = (clientX - rect.left) / (rect.width || 1);
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < count; i++) {
    const d = Math.abs((xFrac ? xFrac(i) : count < 2 ? 0.5 : i / (count - 1)) - f);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

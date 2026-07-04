import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — PyramideFasett
 * Signaturmotiv nr. 2 (metodikk-geometrien): den 5-lags treningspyramiden som
 * fasettert form. Apex→base = TURN→FYS. Hvert lags HØYDE ∝ fordelings-%
 * (normaliseres til 100). Fasett-kanter = hårline i base-fargen, så formen
 * leser som en slepen edelsten. Terskler (15 %-min / 40 %-maks) kan vises som
 * hårline-hakk på høyre egg. Farge = akse (LAG 4-kanon), aldri dekor.
 *
 * Bruk: fordelings-visualisering, tomtilstander i plan-kontekst, seksjons-
 * markør, brand-mark-slektskap. Regel: alltid data-bundet eller didaktisk —
 * aldri som bakgrunnsmønster.
 */

const CSS = `
.ak-fasett{display:inline-flex;align-items:center;gap:16px;}
.ak-fasett--kompakt{gap:10px;}
.ak-fasett__legend{display:flex;flex-direction:column;gap:0;}
.ak-fasett__rad{display:flex;align-items:center;gap:8px;padding:2px 0;}
.ak-fasett__dot{width:9px;height:9px;border-radius:3px;flex:none;}
.ak-fasett__navn{font-family:var(--font-mono);font-size:10px;font-weight:700;
  letter-spacing:.06em;min-width:38px;}
.ak-fasett__pct{font-family:var(--font-mono);font-size:11px;font-weight:600;
  color:var(--text);font-variant-numeric:tabular-nums;margin-left:auto;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-fasett-css")) {
  const el = document.createElement("style");
  el.id = "ak-fasett-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* apex→base rekkefølge (kanon) */
const LAG = [
  { key: "TURN", cssvar: "turn" },
  { key: "SPILL", cssvar: "spill" },
  { key: "SLAG", cssvar: "slag" },
  { key: "TEK", cssvar: "tek" },
  { key: "FYS", cssvar: "fys" },
];

const DEFAULT_FORDELING = { FYS: 30, TEK: 25, SLAG: 20, SPILL: 15, TURN: 10 };

export function PyramideFasett({
  fordeling = DEFAULT_FORDELING,
  bredde = 168,
  visEtiketter = true,
  visProsent = true,
  visTerskler = false,
  kompakt = false,
  className = "",
  style,
}) {
  const W = bredde;
  const H = Math.round(W * 0.9);
  const sum = LAG.reduce((s, l) => s + (fordeling[l.key] || 0), 0) || 1;

  // cumulative heights top→bottom + fasett-geometri (venstre lys-egg / høyre skygge-egg)
  let acc = 0;
  const cx = W / 2;
  const hw = (y) => (y / H) * (W / 2);
  const P = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const bands = LAG.map((l) => {
    const pct = (fordeling[l.key] || 0) / sum;
    const yTop = acc * H;
    acc += pct;
    const yBot = acc * H;
    const tl = [cx - hw(yTop), yTop], tr = [cx + hw(yTop), yTop];
    const bl = [cx - hw(yBot), yBot], br = [cx + hw(yBot), yBot];
    const tm = [cx, yTop], bm = [cx, yBot];
    const left = [tl, tm, bm, bl].map((p) => P(p[0], p[1])).join(" ");
    const right = [tm, tr, br, bm].map((p) => P(p[0], p[1])).join(" ");
    const outline = [tl, tr, br, bl].map((p) => P(p[0], p[1])).join(" ");
    return { ...l, left, right, outline, yTop, yBot, pct, rawPct: fordeling[l.key] || 0, yMid: (yTop + yBot) / 2 };
  });

  const [hover, setHover] = React.useState(null);

  // terskel-hakk (15 % / 40 % av total høyde, målt fra base)
  const notches = [0.15, 0.4];

  const svg = (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Treningspyramide: ${LAG.map((l) => `${l.key} ${fordeling[l.key] || 0}%`).join(", ")}`}
      style={{ display: "block", flex: "none", overflow: "visible" }}
    >
      {bands.map((b, i) => {
        const dim = hover != null && hover !== i;
        const hot = hover === i;
        return (
          <g
            key={b.key}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            style={{ cursor: "pointer", opacity: dim ? 0.48 : 1, transition: "opacity 140ms var(--ease-standard)" }}
          >
            {/* venstre fasett — lys egg (spekulær) */}
            <polygon points={b.left} fill={`color-mix(in srgb, var(--axis-${b.cssvar}), white ${hot ? 24 : 14}%)`} style={{ transition: "fill 140ms var(--ease-standard)" }} />
            {/* høyre fasett — skygge-egg (dybde) */}
            <polygon points={b.right} fill={`color-mix(in srgb, var(--axis-${b.cssvar}), black ${hot ? 8 : 17}%)`} style={{ transition: "fill 140ms var(--ease-standard)" }} />
            {/* midtrygg — spekulær kant der de to eggene møtes */}
            <line x1={cx} y1={b.yTop} x2={cx} y2={b.yBot} stroke={`color-mix(in srgb, var(--axis-${b.cssvar}), white 45%)`} strokeWidth="1" strokeOpacity={hot ? 0.7 : 0.42} />
            {/* lag-kontur i base-farge = separasjon mellom fasetter */}
            <polygon points={b.outline} fill="none" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        );
      })}
      {visTerskler &&
        notches.map((n) => {
          const y = H - n * H;
          const hw = (y / H) * (W / 2);
          const x = W / 2 + hw;
          return (
            <g key={n}>
              <line x1={x} y1={y} x2={x + 7} y2={y} stroke="var(--text-faint)" strokeWidth="1" />
              <text
                x={x + 10}
                y={y + 3}
                fill="var(--text-muted)"
                style={{ font: "600 8px var(--font-mono)" }}
              >
                {Math.round(n * 100)}
              </text>
            </g>
          );
        })}
    </svg>
  );

  const plot = (
    <div style={{ position: "relative", flex: "none" }}>
      {svg}
      {hover != null && (
        <DataPreview
          visible
          x={W / 2}
          y={bands[hover].yMid}
          placement="top"
          label={bands[hover].key}
          value={`${bands[hover].rawPct}%`}
          accent={`var(--axis-${bands[hover].cssvar}-text)`}
          note="av treningsfordeling"
        />
      )}
    </div>
  );

  if (kompakt || !visEtiketter) {
    return (
      <div className={`ak-fasett ak-fasett--kompakt ${className}`} style={style}>
        {plot}
      </div>
    );
  }

  return (
    <div className={`ak-fasett ${className}`} style={style}>
      {plot}
      <div className="ak-fasett__legend">
        {bands.map((b) => (
          <div key={b.key} className="ak-fasett__rad">
            <span className="ak-fasett__dot" style={{ background: `var(--axis-${b.cssvar})` }} />
            <span className="ak-fasett__navn" style={{ color: `var(--axis-${b.cssvar}-text)` }}>
              {b.key}
            </span>
            {visProsent && <span className="ak-fasett__pct">{b.rawPct}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

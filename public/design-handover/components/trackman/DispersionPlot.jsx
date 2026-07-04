import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — DispersionPlot
 * Carry × side-spredning sett ovenfra. Graphite avstandsbuer («skyteskive»),
 * prikker farge- + formkodet per kølle, konsistens-ellipse (1,5σ).
 * Legend = filter; hover/fokus = tooltip per slag; skjermleser-sammendrag.
 * Kilde-empiri: TrackMan-rapportens Dispersion-side.
 */

const CSS = `
.ak-disp{display:flex;flex-direction:column;gap:12px;width:100%;}
.ak-disp__legend{display:flex;gap:6px;flex-wrap:wrap;}
.ak-displeg{
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 10px;border-radius:9999px;border:1px solid transparent;
  background:transparent;cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard),opacity var(--dur-base) var(--ease-standard);
}
.ak-displeg:hover{background:var(--surface-hover);}
.ak-displeg:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-displeg--off{opacity:.35;}
.ak-displeg__lbl{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:.06em;color:var(--text-2);
}
.ak-displeg__n{font-family:var(--font-mono);font-size:10px;color:var(--text-muted);font-variant-numeric:tabular-nums;}
.ak-disp__plot{position:relative;width:100%;}
.ak-disp__svg{width:100%;display:block;overflow:visible;}
.ak-disp__pt{cursor:pointer;transition:opacity var(--dur-fast) var(--ease-standard);}
.ak-disp__pt:focus-visible{outline:none;stroke:var(--signal);stroke-width:2;}
.ak-disp__tip{
  position:absolute;pointer-events:none;z-index:5;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:8px;padding:7px 10px;
  font-family:var(--font-mono);font-size:10px;color:var(--text);
  font-variant-numeric:tabular-nums;white-space:nowrap;
  transform:translate(-50%,-115%);
}
.ak-disp__sr{
  position:absolute;width:1px;height:1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-disp-css")) {
  const s = document.createElement("style");
  s.id = "ak-disp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Kategorisk serie-stil: farge (akse-tokens) + form, fargeblind-sikkert. */
export const TM_SERIER = [
  { farge: "var(--axis-fys)",   form: "sirkel"  },
  { farge: "var(--axis-slag)",  form: "firkant" },
  { farge: "var(--axis-tek)",   form: "trekant" },
  { farge: "var(--axis-spill)", form: "diamant" },
  { farge: "var(--axis-turn)",  form: "kryss"   },
];

/** Tegn markørform sentrert i (x,y), radius r. */
export function TmMarkor({ form, x, y, r, farge, ...rest }) {
  const p = { fill: farge, ...rest };
  switch (form) {
    case "firkant":
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...p} />;
    case "trekant":
      return <polygon points={`${x},${y - r} ${x + r},${y + r} ${x - r},${y + r}`} {...p} />;
    case "diamant":
      return <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} {...p} />;
    case "kryss":
      return (
        <g {...rest}>
          <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} stroke={farge} strokeWidth="2" />
          <line x1={x - r} y1={y + r} x2={x + r} y2={y - r} stroke={farge} strokeWidth="2" />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={r} {...p} />;
  }
}

const fmt = (v) => String(Math.round(v * 10) / 10).replace(".", ",");

function stats(vals) {
  const n = vals.length;
  const m = vals.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)) : 0;
  return { m, sd };
}

export function DispersionPlot({
  slag = [],
  loading = false,
  koller,
  ellipse = true,
  hoyde = 280,
  className = "",
  style,
}) {
  const serier = koller || [...new Set(slag.map((s) => s.kolle))].map((id) => ({ id, navn: id }));
  const [av, setAv] = React.useState({}); // id -> true = skjult
  const [tip, setTip] = React.useState(null);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={hoyde} className={className} style={style} />;
  }
  if (!slag || slag.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: hoyde, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen slag ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Spredning vises i meter — carry i meter, side som m V/H.</span>
      </div>
    );
  }
  const synlige = serier.filter((k) => !av[k.id]);
  const soloId = synlige.length === 1 ? synlige[0].id : null;

  const vis = slag.filter((s) => !av[s.kolle]);
  const W = 720, H = hoyde, PAD = { t: 16, r: 16, b: 26, l: 16 };

  // Domener: carry 0→maks (avstandsbuer fra origo), side symmetrisk.
  const maxCarry = Math.max(40, ...slag.map((s) => s.carry)) * 1.08;
  const maxSide = Math.max(12, ...slag.map((s) => Math.abs(s.side))) * 1.3;
  const sx = (c) => PAD.l + (c / maxCarry) * (W - PAD.l - PAD.r);
  const sy = (v) => PAD.t + (H - PAD.t - PAD.b) / 2 + (v / maxSide) * ((H - PAD.t - PAD.b) / 2);

  // Avstandsbuer hver 20/40 m avhengig av domenet
  const step = maxCarry > 140 ? 40 : 20;
  const buer = [];
  for (let d = step; d <= maxCarry; d += step) buer.push(d);

  const perKolle = serier.map((k, i) => {
    const pts = slag.filter((s) => s.kolle === k.id);
    if (!pts.length) return { k, i, pts, e: null };
    const c = stats(pts.map((p) => p.carry));
    const s = stats(pts.map((p) => p.side));
    return { k, i, pts, e: { cx: c.m, cy: s.m, rx: Math.max(c.sd * 1.5, 2), ry: Math.max(s.sd * 1.5, 2), sdC: c.sd, sdS: s.sd } };
  });

  const oppsummering = perKolle
    .filter((g) => g.pts.length)
    .map((g) => `${g.k.navn}: ${g.pts.length} slag, snitt carry ${fmt(g.e.cx)} m, konsistens ±${fmt(g.e.sdC)} m, side snitt ${fmt(g.e.cy)} m.`)
    .join(" ");

  return (
    <div className={`ak-disp ${className}`} style={style}>
      <div className="ak-disp__legend" role="group" aria-label="Køller — klikk for å filtrere">
        {serier.map((k, i) => {
          const st = TM_SERIER[i % TM_SERIER.length];
          const n = slag.filter((s) => s.kolle === k.id).length;
          return (
            <button
              key={k.id}
              type="button"
              className={`ak-displeg${av[k.id] ? " ak-displeg--off" : ""}`}
              aria-pressed={!av[k.id]}
              onClick={() => setAv((p) => ({ ...p, [k.id]: !p[k.id] }))}
            >
              <svg width="12" height="12" viewBox="-7 -7 14 14" aria-hidden="true">
                <TmMarkor form={st.form} x={0} y={0} r={5} farge={st.farge} />
              </svg>
              <span className="ak-displeg__lbl">{k.navn}</span>
              <span className="ak-displeg__n">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="ak-disp__plot">
        <svg className="ak-disp__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Spredningsplot. ${oppsummering}`}>
          {/* avstandsbuer */}
          {buer.map((d) => (
            <g key={d}>
              <circle cx={sx(0)} cy={sy(0)} r={sx(d) - sx(0)} fill="none" stroke="var(--border)" strokeWidth="1" />
              <text x={sx(d)} y={H - 8} textAnchor="middle" fill="var(--text-muted)"
                style={{ font: "600 9px var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{d}</text>
            </g>
          ))}
          {/* mållinje (side = 0) */}
          <line x1={PAD.l} y1={sy(0)} x2={W - PAD.r} y2={sy(0)} stroke="var(--border-strong)" strokeWidth="1" />

          {/* ellipser */}
          {ellipse && perKolle.map((g) => {
            if (!g.e || g.pts.length < 3 || av[g.k.id]) return null;
            const solo = soloId === g.k.id;
            const st = TM_SERIER[g.i % TM_SERIER.length];
            return (
              <ellipse
                key={g.k.id}
                cx={sx(g.e.cx)} cy={sy(g.e.cy)}
                rx={sx(g.e.rx) - sx(0)} ry={(sy(g.e.ry) - sy(0))}
                fill="none"
                stroke={solo ? "var(--signal)" : st.farge}
                strokeWidth={solo ? 1.5 : 1}
                strokeDasharray="5 4"
                opacity={solo ? 0.9 : 0.55}
              />
            );
          })}

          {/* punkter */}
          {perKolle.map((g) =>
            av[g.k.id] ? null : g.pts.map((p, j) => {
              const st = TM_SERIER[g.i % TM_SERIER.length];
              return (
                <g key={`${g.k.id}-${j}`} className="ak-disp__pt"
                  tabIndex={0}
                  role="img"
                  aria-label={`${g.k.navn}: carry ${fmt(p.carry)} m, side ${fmt(Math.abs(p.side))} m ${p.side < 0 ? "venstre" : "høyre"}`}
                  onMouseEnter={(e) => setTip({ p, k: g.k, x: sx(p.carry), y: sy(p.side) })}
                  onFocus={() => setTip({ p, k: g.k, x: sx(p.carry), y: sy(p.side) })}
                  onMouseLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                >
                  <TmMarkor form={st.form} x={sx(p.carry)} y={sy(p.side)} r={4} farge={st.farge} opacity="0.85" />
                </g>
              );
            })
          )}
        </svg>

        {tip && (
          <div className="ak-disp__tip" style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}>
            {tip.k.navn} · {fmt(tip.p.carry)} m · {fmt(Math.abs(tip.p.side))} m {tip.p.side < 0 ? "V" : "H"}
          </div>
        )}
      </div>
      <span className="ak-disp__sr">{oppsummering}</span>
    </div>
  );
}

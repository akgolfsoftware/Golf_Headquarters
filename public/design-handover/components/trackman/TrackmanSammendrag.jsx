import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — TrackmanSammendrag
 * Sesjonshode for en TrackMan-økt: dato, kilde, slag totalt, køller som chips,
 * valgfritt høydepunkt (én setning fra coach/AI). Klikkbart → full rapport.
 */

const CSS = `
.ak-tmsum{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:16px;
  display:flex;flex-direction:column;gap:12px;text-align:left;width:100%;
}
button.ak-tmsum{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);}
button.ak-tmsum:hover{background:var(--surface-2);border-color:var(--border-strong);}
button.ak-tmsum:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tmsum__top{display:flex;align-items:center;gap:10px;}
.ak-tmsum__ic{
  display:flex;align-items:center;justify-content:center;flex:none;
  width:34px;height:34px;border-radius:var(--radius-input);
  background:var(--surface-hover);color:var(--text-2);
}
.ak-tmsum__hgroup{flex:1;min-width:0;}
.ak-tmsum__tittel{
  font-family:var(--font-display);font-size:var(--text-16);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);
}
.ak-tmsum__meta{
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
  margin-top:2px;font-variant-numeric:tabular-nums;
}
.ak-tmsum__slag{
  font-family:var(--font-mono);font-size:var(--text-16);font-weight:700;
  color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap;
}
.ak-tmsum__slag small{font-size:9px;font-weight:600;color:var(--text-muted);display:block;text-align:right;text-transform:uppercase;letter-spacing:.08em;}
.ak-tmsum__koller{display:flex;gap:6px;flex-wrap:wrap;}
.ak-tmsum__kolle{
  display:inline-flex;align-items:center;gap:5px;
  font-family:var(--font-mono);font-size:10px;font-weight:600;color:var(--text-2);
  border:1px solid var(--border);border-radius:9999px;padding:3px 9px;
  font-variant-numeric:tabular-nums;
}
.ak-tmsum__kolle b{color:var(--text-muted);font-weight:600;}
.ak-tmsum__hp{
  display:flex;gap:8px;align-items:flex-start;
  font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);
  line-height:var(--leading-body);
}
.ak-tmsum__hp .ak-icon,.ak-tmsum__hp svg{flex:none;margin-top:1px;color:var(--signal);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-tmsum-css")) {
  const s = document.createElement("style");
  s.id = "ak-tmsum-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function TrackmanSammendrag({
  dato,
  spiller,
  kilde = "TrackMan",
  totalSlag,
  koller = [],
  loading = false,
  hoydepunkt,
  onClick,
  className = "",
  style,
}) {
  if (loading) {
    return <Skeleton variant="card" width="100%" height={88} className={className} style={style} />;
  }
  const Tag = onClick ? "button" : "div";
  const meta = [spiller, kilde, dato].filter(Boolean).join(" · ");
  return (
    <Tag className={`ak-tmsum ${className}`} style={style} onClick={onClick} type={onClick ? "button" : undefined}>
      <div className="ak-tmsum__top">
        <span className="ak-tmsum__ic" aria-hidden="true"><Icon name="target" size={17} /></span>
        <span className="ak-tmsum__hgroup">
          <span className="ak-tmsum__tittel">TrackMan-økt</span>
          <span className="ak-tmsum__meta" style={{ display: "block" }}>{meta}</span>
        </span>
        <span className="ak-tmsum__slag">{totalSlag}<small>slag</small></span>
      </div>
      {koller.length > 0 && (
        <div className="ak-tmsum__koller">
          {koller.map((k) => (
            <span key={k.navn} className="ak-tmsum__kolle">{k.navn} <b>{k.antall}</b></span>
          ))}
        </div>
      )}
      {hoydepunkt && (
        <span className="ak-tmsum__hp">
          <Icon name="sparkles" size={14} />
          {hoydepunkt}
        </span>
      )}
    </Tag>
  );
}

import React from "react";

/**
 * AK Golf HQ — NivaStige
 * AK-stige / nivåprogresjon (gamification): nåværende nivå + dotted fremdrift mot neste.
 * Didaktisk/data-bundet, aldri dekor. Fremdrift 0–1 innen nåværende nivå.
 */
const CSS = `
.ak-stige{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:16px 18px;display:flex;flex-direction:column;gap:12px;}
.ak-stige__head{display:flex;align-items:center;gap:12px;}
.ak-stige__badge{width:40px;height:40px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--on-signal);background:var(--signal);}
.ak-stige__dots{display:flex;gap:6px;align-items:center;}
.ak-stige__dot{width:10px;height:10px;border-radius:9999px;flex:none;background:var(--surface-2);border:1px solid var(--border);}
.ak-stige__dot--on{background:var(--signal);border-color:var(--signal);}
.ak-stige__dot--half{background:linear-gradient(90deg,var(--signal) 50%,var(--surface-2) 50%);border-color:var(--signal);}
.ak-stige__meta{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-stige-css")) {
  const s = document.createElement("style"); s.id = "ak-stige-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function NivaStige({ nivaa, etikett, steg = 5, fylte = 0, fremdrift, nesteEtikett, className = "", style }) {
  // fylte = antall hele fylte prikker; fremdrift (0–1) fyller neste prikk halvt hvis 0<f<1
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
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-15)", color: "var(--text)" }}>{etikett || `Nivå ${nivaa}`}</div>
          <div className="ak-stige__meta" style={{ marginTop: 3 }}>{fylte} av {steg} nådd{nesteEtikett ? ` · neste: ${nesteEtikett}` : ""}</div>
        </div>
      </div>
      <div className="ak-stige__dots" role="img" aria-label={`Nivå ${nivaa}: ${fylte} av ${steg} nådd`}>
        {dots.map((d, i) => <span key={i} className={`ak-stige__dot${d === "on" ? " ak-stige__dot--on" : d === "half" ? " ak-stige__dot--half" : ""}`} />)}
      </div>
    </div>
  );
}

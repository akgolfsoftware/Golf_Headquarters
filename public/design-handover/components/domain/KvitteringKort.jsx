import React from "react";

/**
 * AK Golf HQ — KvitteringKort
 * Betalingskvittering: linjer + sum + betalt-stempel + kvitteringsnr/dato.
 * Betalingstilstand: betalt/venter/feilet/refundert (ikon + ord, farge ikke eneste bærer).
 */
const CSS = `
.ak-kvit{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;max-width:420px;}
.ak-kvit__top{display:flex;align-items:center;gap:11px;padding:16px 18px;border-bottom:1px solid var(--border);}
.ak-kvit__stamp{width:38px;height:38px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;}
.ak-kvit__body{padding:14px 18px;}
.ak-kvit__line{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:6px 0;}
.ak-kvit__lt{font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);}
.ak-kvit__lv{font-family:var(--font-mono);font-size:var(--text-13);color:var(--text);font-variant-numeric:tabular-nums;}
.ak-kvit__sum{display:flex;align-items:baseline;justify-content:space-between;padding:12px 0 2px;border-top:1px solid var(--border);margin-top:6px;}
.ak-kvit__sumv{font-family:var(--font-mono);font-size:var(--text-20);font-weight:700;color:var(--text);font-variant-numeric:tabular-nums;}
.ak-kvit__meta{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);padding:0 18px 15px;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-kvit-css")) {
  const s = document.createElement("style"); s.id = "ak-kvit-css"; s.textContent = CSS; document.head.appendChild(s);
}
const STAT = {
  betalt:     { c: "var(--up)",   t: "Betalt",     ic: "M20 6 9 17l-5-5" },
  venter:     { c: "var(--warn, var(--text-muted))", t: "Venter", ic: "M12 6v6l4 2" },
  feilet:     { c: "var(--down)", t: "Feilet",     ic: "M18 6 6 18M6 6l12 12" },
  refundert:  { c: "var(--text-muted)", t: "Refundert", ic: "M3 7v6h6M21 17a9 9 0 0 0-15-6.7L3 13" },
};

export function KvitteringKort({
  tittel = "Kvittering", status = "betalt", linjer = [], sum, valuta = "kr",
  dato, kvitteringsnr, className = "", style,
}) {
  const S = STAT[status] || STAT.betalt;
  const total = sum != null ? sum : linjer.reduce((s, l) => s + (Number(l.belop) || 0), 0);
  return (
    <div className={`ak-kvit ${className}`} style={style}>
      <div className="ak-kvit__top">
        <span className="ak-kvit__stamp" style={{ background: `color-mix(in srgb,${S.c} 15%,transparent)`, border: `1px solid color-mix(in srgb,${S.c} 38%,transparent)` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={S.ic} /></svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-15)", color: "var(--text)" }}>{tittel}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 700, color: S.c, marginTop: 3 }}>{S.t}</div>
        </div>
      </div>
      <div className="ak-kvit__body">
        {linjer.map((l, i) => (
          <div key={i} className="ak-kvit__line">
            <span className="ak-kvit__lt">{l.tekst}</span>
            <span className="ak-kvit__lv">{l.belop} {valuta}</span>
          </div>
        ))}
        <div className="ak-kvit__sum">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Sum</span>
          <span className="ak-kvit__sumv">{total} {valuta}</span>
        </div>
      </div>
      {(dato || kvitteringsnr) && <div className="ak-kvit__meta">{[kvitteringsnr && `Kvittering ${kvitteringsnr}`, dato].filter(Boolean).join(" · ")}</div>}
    </div>
  );
}

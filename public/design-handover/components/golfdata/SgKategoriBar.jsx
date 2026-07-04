import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — SgKategoriBar
 * OTT/APP/ARG/PUTT-dekomponering som divergerende SG-stolper fra nullbaseline:
 * tap venstre (--down), gevinst høyre (--up) — aldri lime. Største tap fremhevet
 * («størst tap»). SG i «slag» mot navngitt baseline.
 *
 * Overlapp meldt: BarChart gir magnitude-stolper fra 0; SG krever DIVERGERENDE
 * stolper om en nullbaseline med fortegnsfarge — egen viz, ikke BarChart-duplikat.
 * Progressiv dybde: NIVA[nivå] gater fagkoder/alle-rader; term() bytter klarspråk↔fagkode.
 */
const CSS = `
.ak-skb{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;}
.ak-skb__row{display:grid;grid-template-columns:64px 1fr 74px;align-items:center;gap:10px;padding:7px 0;}
.ak-skb__lbl{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;color:var(--text-2);letter-spacing:.04em;}
.ak-skb__track{position:relative;height:16px;border-radius:5px;background:var(--surface-2);overflow:hidden;}
.ak-skb__mid{position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--border-strong);}
.ak-skb__fill{position:absolute;top:2px;bottom:2px;border-radius:4px;transition:width var(--dur-base) var(--ease-standard);}
.ak-skb__val{font-family:var(--font-mono);font-size:var(--text-12);font-weight:700;text-align:right;font-variant-numeric:tabular-nums;}
.ak-skb__row--hot .ak-skb__lbl{color:var(--text);}
.ak-skb__tag{display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:5px;margin-left:7px;
  font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
  color:var(--down);background:color-mix(in srgb,var(--down) 15%,transparent);border:1px solid color-mix(in srgb,var(--down) 38%,transparent);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-skb-css")) {
  const s = document.createElement("style"); s.id = "ak-skb-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NIVA = {
  nybegynner: { fagkoder: false, visBaseline: false },
  ovet:       { fagkoder: false, visBaseline: true },
  elite:      { fagkoder: true,  visBaseline: true },
};
const AKSE = { OTT:{klar:"Tee-slag",fag:"OTT"}, APP:{klar:"Innspill",fag:"APP"}, ARG:{klar:"Nærspill",fag:"ARG"}, PUTT:{klar:"Putting",fag:"PUTT"} };
const fmt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");

export function SgKategoriBar({
  kategorier = [],
  baseline = "Broadie scratch",
  nivaa = "ovet",
  loading = false,
  className = "",
  style,
}) {
  const N = NIVA[nivaa] || NIVA.ovet;
  if (loading) return <Skeleton variant="card" width="100%" height={200} className={className} style={style} />;

  if (!kategorier.length) {
    return (
      <div className={`ak-skb ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>SG per kategori</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Spill din første runde for å se hvor slagene tapes og vinnes.</p>
      </div>
    );
  }

  const max = Math.max(0.5, ...kategorier.map((k) => Math.abs(k.sg)));
  const verstIdx = kategorier.reduce((wi, k, i, arr) => (k.sg < arr[wi].sg ? i : wi), 0);

  return (
    <div className={`ak-skb ${className}`} style={style} role="img" aria-label={`SG per kategori mot ${baseline}`}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>SG per kategori</span>
        {N.visBaseline && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>mot {baseline}</span>}
      </div>
      {kategorier.map((k, i) => {
        const a = AKSE[k.akse] || { klar: k.akse, fag: k.akse };
        const gain = k.sg >= 0;
        const w = (Math.abs(k.sg) / max) * 50; // % of half-track
        const hot = i === verstIdx;
        return (
          <div key={k.akse} className={`ak-skb__row${hot ? " ak-skb__row--hot" : ""}`}>
            <span className="ak-skb__lbl">{N.fagkoder ? a.fag : a.klar}</span>
            <span className="ak-skb__track">
              <span className="ak-skb__mid" />
              <span className="ak-skb__fill" style={{ [gain ? "left" : "right"]: "50%", width: `${w}%`, background: gain ? "var(--up)" : "var(--down)" }} />
            </span>
            <span className="ak-skb__val" style={{ color: gain ? "var(--up)" : "var(--down)" }}>
              {fmt(k.sg)}{hot && <span className="ak-skb__tag">størst tap</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

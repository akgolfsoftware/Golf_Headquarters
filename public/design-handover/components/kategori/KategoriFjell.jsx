import React from "react";

/**
 * AK Golf HQ — KategoriFjell
 * «Reisen opp fjellet» — foto-hero med 11 kategori-markører (A på toppen, K ved
 * foten) og forhåndsvisningskort med «Se full profil»-CTA. Panelet er en MØRK
 * INNFELLING (class="dark" re-asserterer mørke tokens) — lime-signal er lov her
 * på begge sidetemaer, jf. bildekart-kontrakten (foto bak mørk gradient).
 * Ingen dekorative loops (kanon) — apex markeres med størrelse + signalfarge.
 */
const CSS = `
.ak-kfj{position:relative;width:100%;aspect-ratio:16/9;min-height:380px;border-radius:var(--radius-card);
  overflow:hidden;border:1px solid var(--border);background-size:cover;background-position:center;}
@keyframes ak-kfj-reveal{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
@media (prefers-reduced-motion: reduce){.ak-kfj *{animation:none !important;transition:none !important;}}
.ak-kfj__scrim{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(115deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, color-mix(in srgb, var(--bg) 14%, transparent) 40%, transparent 62%);}
.ak-kfj__pill{position:absolute;font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  padding:5px 10px;border-radius:var(--radius-pill);backdrop-filter:blur(6px);}
.ak-kfj__marker{position:absolute;transform:translate(-50%,-50%);background:none;border:none;padding:0;cursor:pointer;z-index:3;
  transition:transform var(--dur-fast) var(--ease-standard);}
.ak-kfj__marker:hover{transform:translate(-50%,-50%) scale(1.14);}
.ak-kfj__marker:focus-visible{outline:none;}
.ak-kfj__marker:focus-visible .ak-kfj__mdot{box-shadow:var(--glow-signal);}
.ak-kfj__mdot{border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:700;
  transition:width var(--dur-fast) var(--ease-standard),height var(--dur-fast) var(--ease-standard);}
.ak-kfj__preview{position:absolute;bottom:22px;right:22px;width:300px;max-width:calc(100% - 44px);
  background:color-mix(in srgb, var(--bg) 84%, transparent);backdrop-filter:blur(14px);
  border:1px solid color-mix(in srgb, var(--signal) 28%, transparent);border-radius:var(--radius-card);
  box-shadow:var(--shadow-popover);padding:18px;z-index:6;animation:ak-kfj-reveal var(--dur-base) var(--ease-standard);}
.ak-kfj__pnavn{font-family:var(--font-display);font-size:var(--text-16);font-weight:700;color:var(--text);line-height:1.1;}
.ak-kfj__ptours{font-family:var(--font-mono);font-size:9.5px;letter-spacing:.06em;color:var(--signal);}
.ak-kfj__lukk{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px;line-height:0;}
.ak-kfj__lukk:hover{color:var(--text);}
.ak-kfj__lukk:focus-visible{outline:none;box-shadow:var(--glow-signal);border-radius:4px;}
.ak-kfj__ptekst{font-family:var(--font-ui);font-size:var(--text-12);line-height:1.5;color:var(--text-2);margin:12px 0 0;}
.ak-kfj__grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:14px;overflow:hidden;border-radius:8px;
  background:color-mix(in srgb, var(--text) 10%, transparent);border:1px solid color-mix(in srgb, var(--text) 10%, transparent);}
.ak-kfj__celle{background:color-mix(in srgb, var(--bg) 62%, transparent);padding:9px 11px;}
.ak-kfj__clbl{font-family:var(--font-mono);font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;}
.ak-kfj__cverdi{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:var(--text-15);font-weight:600;color:var(--text);}
.ak-kfj__cta{margin-top:14px;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;
  background:var(--signal);color:var(--on-signal);border:none;border-radius:var(--radius-pill);min-height:38px;padding:9px 14px;
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
  transition:filter var(--dur-fast) var(--ease-standard);}
.ak-kfj__cta:hover{filter:brightness(1.06);}
.ak-kfj__cta:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-kfj__tom{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-kfj-css")) {
  const s = document.createElement("style"); s.id = "ak-kfj-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function KategoriFjell({
  kategorier = [],
  bilde,
  onAapneProfil,
  toppEtikett = "Topp 50 i verden",
  fotEtikett = "Foten — junior",
  className = "",
  style,
}) {
  const [valgt, setValgt] = React.useState(null);
  const apexId = kategorier[0]?.id;
  const pv = valgt ? kategorier.find((k) => k.id === valgt) : null;

  const bakgrunn = bilde
    ? `url("${bilde}") center/cover no-repeat, linear-gradient(180deg, color-mix(in srgb, var(--forest-700) 45%, black), black)`
    : `linear-gradient(160deg, color-mix(in srgb, var(--forest-700) 60%, black) 0%, color-mix(in srgb, var(--forest-700) 25%, black) 55%, black 100%)`;

  return (
    <div className={`ak-kfj dark ${className}`} style={{ background: bakgrunn, ...style }}>
      <div className="ak-kfj__scrim" />

      <span className="ak-kfj__pill" style={{ top: 20, left: 20, color: "var(--signal)",
        background: "color-mix(in srgb, var(--forest-700) 55%, transparent)",
        border: "1px solid color-mix(in srgb, var(--signal) 30%, transparent)" }}>{toppEtikett}</span>
      <span className="ak-kfj__pill" style={{ bottom: 20, left: 20, color: "color-mix(in srgb, var(--text) 80%, transparent)",
        background: "color-mix(in srgb, var(--bg) 55%, transparent)",
        border: "1px solid color-mix(in srgb, var(--text) 15%, transparent)" }}>{fotEtikett}</span>

      {kategorier.length === 0 && <span className="ak-kfj__tom" role="status">Ingen kategorier å vise ennå.</span>}

      {kategorier.map((k) => {
        const aktiv = valgt === k.id || (k.id === apexId && !valgt);
        const stor = aktiv ? 40 : 32;
        return (
          <button key={k.id} type="button" className="ak-kfj__marker" title={k.niva}
            style={{ left: `${k.mx}%`, top: `${k.my}%` }}
            aria-pressed={valgt === k.id}
            onClick={() => setValgt(valgt === k.id ? null : k.id)}>
            <span className="ak-kfj__mdot" style={{
              width: stor, height: stor, fontSize: aktiv ? 15 : 13,
              background: aktiv ? "var(--signal)" : "color-mix(in srgb, var(--forest-700) 92%, transparent)",
              color: aktiv ? "var(--on-signal)" : "var(--signal)",
              border: `1.5px solid ${aktiv ? "var(--signal-press)" : "color-mix(in srgb, var(--signal) 55%, transparent)"}`,
              boxShadow: valgt === k.id ? "0 0 0 4px color-mix(in srgb, var(--signal) 40%, transparent), var(--shadow-raised)" : "var(--shadow-raised)",
            }}>{k.id}</span>
          </button>
        );
      })}

      {pv && (
        <div className="ak-kfj__preview">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 38, height: 38, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, background: "var(--signal)", color: "var(--on-signal)" }}>{pv.id}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="ak-kfj__pnavn">{pv.niva}</span>
                <span className="ak-kfj__ptours">{pv.tours}</span>
              </span>
            </div>
            <button type="button" className="ak-kfj__lukk" onClick={() => setValgt(null)} aria-label="Lukk forhåndsvisning">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          {pv.spillere && <p className="ak-kfj__ptekst">{pv.spillere}</p>}

          <div className="ak-kfj__grid">
            <div className="ak-kfj__celle"><div className="ak-kfj__clbl">Snittscore</div><div className="ak-kfj__cverdi">{pv.score}</div></div>
            <div className="ak-kfj__celle"><div className="ak-kfj__clbl">Hcp</div><div className="ak-kfj__cverdi">{pv.hcp}</div></div>
            <div className="ak-kfj__celle"><div className="ak-kfj__clbl">Volum</div><div className="ak-kfj__cverdi">{pv.timerUke}<span style={{ fontSize: 10, color: "var(--signal)", marginLeft: 2 }}>t/uke</span></div></div>
            <div className="ak-kfj__celle"><div className="ak-kfj__clbl">Bane CR / Slope</div><div className="ak-kfj__cverdi">{pv.bane?.cr} / {pv.bane?.slope}</div></div>
          </div>

          {onAapneProfil && (
            <button type="button" className="ak-kfj__cta" onClick={() => onAapneProfil(pv.id)}>
              Se full profil
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

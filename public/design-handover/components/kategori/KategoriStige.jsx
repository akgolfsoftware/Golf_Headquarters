import React from "react";
import { TidsPyramide } from "./TidsPyramide.jsx";
import { SgKategoriBar } from "../golfdata/SgKategoriBar.jsx";

/**
 * AK Golf HQ — KategoriStige
 * A–K-stigen (A = beste, kanon) som interaktiv tabell: badge, nivå, snittscore,
 * hcp, alder — klikk åpner full profil i 4 bånd: Nivå & bane, Anbefalt
 * tidsfordeling (TidsPyramide), Forventet SG-profil (SgKategoriBar) og Forventet
 * testnivå. «ALLE TALL ER ESTIMAT» vises ærlig. Én åpen kategori om gangen.
 * A-badgen bruker --signal/--on-signal (lys → forest automatisk); øvrige badges
 * er nøytrale (lime-som-ett-anker). Tokens hele veien — null rå hex.
 */
const CSS = `
.ak-kst{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;}
@keyframes ak-kst-reveal{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
@media (prefers-reduced-motion: reduce){.ak-kst *{animation:none !important;transition:none !important;}}
.ak-kst__grid{display:grid;grid-template-columns:60px minmax(0,1fr) 112px 102px 78px 28px;gap:12px;align-items:center;}
.ak-kst__hode{padding:14px 20px;border-bottom:1px solid var(--border);}
.ak-kst__kol{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--text-faint);font-weight:600;}
.ak-kst__estimat{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:10px;
  letter-spacing:.06em;color:var(--text-faint);white-space:nowrap;justify-self:end;}
.ak-kst__dot{width:7px;height:7px;border-radius:50%;background:var(--signal);
  box-shadow:0 0 0 3px color-mix(in srgb, var(--signal) 18%, transparent);}
.ak-kst__seksjon{padding:12px 20px 8px;display:flex;align-items:center;gap:12px;background:var(--surface-2);}
.ak-kst__seklbl{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);white-space:nowrap;}
.ak-kst__sekstrek{flex:1;height:1px;background:var(--border);}
.ak-kst__rad{width:100%;font:inherit;text-align:left;background:transparent;border:none;cursor:pointer;
  padding:13px 20px;border-bottom:1px solid var(--border);display:block;
  transition:background var(--dur-fast) var(--ease-standard);}
.ak-kst__rad:hover{background:var(--surface-hover);}
.ak-kst__rad:focus-visible{outline:none;box-shadow:inset var(--glow-signal);}
.ak-kst__rad[aria-expanded="true"]{background:var(--surface-hover);}
.ak-kst__badge{width:36px;height:36px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:700;font-size:var(--text-14);}
.ak-kst__niva{font-family:var(--font-display);font-size:var(--text-16);font-weight:700;
  letter-spacing:var(--tracking-display);color:var(--text);}
.ak-kst__spillere{font-size:var(--text-12);color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ak-kst__score{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:var(--text-14);font-weight:600;color:var(--text);}
.ak-kst__tall{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:var(--text-13);color:var(--text-muted);}
.ak-kst__chev{display:flex;justify-content:flex-end;color:var(--text-faint);}
.ak-kst__detalj{padding:18px 20px 26px;border-bottom:1px solid var(--border);
  animation:ak-kst-reveal var(--dur-base) var(--ease-standard);}
.ak-kst__band{padding:20px 0;border-bottom:1px solid var(--border);}
.ak-kst__band:first-child{padding-top:0;}
.ak-kst__band:last-child{padding-bottom:0;border-bottom:none;}
.ak-kst__eyebrow{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);}
.ak-kst__hint{font-family:var(--font-mono);font-size:10px;color:var(--text-faint);}
.ak-kst__to{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:28px;}
.ak-kst__nivanavn{font-family:var(--font-display);font-size:var(--text-20);font-weight:700;
  letter-spacing:var(--tracking-display);color:var(--text);margin-top:8px;}
.ak-kst__tekst{font-size:var(--text-13);line-height:1.5;color:var(--text-muted);margin:8px 0 0;}
.ak-kst__tours{font-family:var(--font-mono);font-size:var(--text-11);letter-spacing:.03em;color:var(--text-faint);margin-top:10px;line-height:1.6;}
.ak-kst__crtall{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:var(--text-20);font-weight:600;color:var(--text);}
.ak-kst__crlbl{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-faint);}
.ak-kst__oppsett{font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:13px 0 0;}
.ak-kst__tester{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:14px;}
.ak-kst__test{background:var(--surface-2);border:1px solid var(--border);border-radius:9px;padding:11px 12px;}
.ak-kst__testlbl{font-family:var(--font-mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);margin-bottom:6px;}
.ak-kst__testverdi{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:var(--text-18);font-weight:600;color:var(--text);}
.ak-kst__enhet{font-size:var(--text-11);color:var(--text-muted);margin-left:3px;}
.ak-kst__skel{height:56px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;}
.ak-kst__skelbar{height:20px;border-radius:6px;background:var(--surface-2);width:100%;}
.ak-kst__tomtekst{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:8px 0 0;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-kst-css")) {
  const s = document.createElement("style"); s.id = "ak-kst-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function KategoriStige({
  kategorier = [],
  aapen,
  onAapne,
  seksjoner = [
    { ved: "A", label: "A–D · Topp & elite" },
    { ved: "E", label: "E–K · Klubb & utvikling" },
  ],
  estimat = true,
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  const [internAapen, setInternAapen] = React.useState("A");
  const [valgtNivaa, setValgtNivaa] = React.useState("turn");
  const open = aapen !== undefined ? aapen : internAapen;
  const toggle = (id) => {
    const neste = open === id ? null : id;
    setInternAapen(neste);
    if (onAapne) onAapne(neste);
  };

  if (loading) {
    return (
      <div className={`ak-kst ${className}`} style={style} aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="ak-kst__skel"><div className="ak-kst__skelbar" /></div>)}
      </div>
    );
  }
  if (tomt || kategorier.length === 0) {
    return (
      <div className={`ak-kst ${className}`} style={{ padding: 20, ...style }} role="status">
        <span className="ak-kst__eyebrow">Kategorisystem</span>
        <p className="ak-kst__tomtekst">Ingen kategorier definert ennå. Stigen fylles når kategorimodellen er lagt inn.</p>
      </div>
    );
  }

  const apexId = kategorier[0]?.id;

  return (
    <div className={`ak-kst ${className}`} style={style}>
      <div className="ak-kst__hode ak-kst__grid">
        <span className="ak-kst__kol">Kat</span>
        <span className="ak-kst__kol">Nivå</span>
        <span className="ak-kst__kol">Snittscore</span>
        <span className="ak-kst__kol">Hcp</span>
        <span className="ak-kst__kol">Alder</span>
        {estimat
          ? <span className="ak-kst__estimat" style={{ gridColumn: "6" }} title="Alle tall er estimat"><span className="ak-kst__dot" /></span>
          : <span />}
      </div>
      {estimat && (
        <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <span className="ak-kst__estimat"><span className="ak-kst__dot" />ALLE TALL ER ESTIMAT</span>
        </div>
      )}

      {kategorier.map((k) => {
        const sek = seksjoner.find((s) => s.ved === k.id);
        const erAapen = open === k.id;
        const erApex = k.id === apexId;
        return (
          <React.Fragment key={k.id}>
            {sek && (
              <div className="ak-kst__seksjon">
                <span className="ak-kst__seklbl">{sek.label}</span>
                <span className="ak-kst__sekstrek" />
              </div>
            )}
            <button type="button" className="ak-kst__rad" aria-expanded={erAapen} onClick={() => toggle(k.id)}>
              <span className="ak-kst__grid">
                <span className="ak-kst__badge" style={erApex
                  ? { background: "var(--signal)", color: "var(--on-signal)" }
                  : { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>{k.id}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span className="ak-kst__niva">{k.niva}</span>
                  <span className="ak-kst__spillere">{k.spillere}</span>
                </span>
                <span className="ak-kst__score">{k.score}</span>
                <span className="ak-kst__tall">{k.hcp}</span>
                <span className="ak-kst__tall">{k.alder}</span>
                <span className="ak-kst__chev">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    style={{ transition: "transform var(--dur-fast) var(--ease-standard)", transform: erAapen ? "rotate(90deg)" : "rotate(0deg)" }}>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </span>
            </button>

            {erAapen && (
              <div className="ak-kst__detalj">
                {/* BÅND 1 · Nivå & bane */}
                <div className="ak-kst__band ak-kst__to">
                  <div>
                    <span className="ak-kst__eyebrow">Nivå</span>
                    <div className="ak-kst__nivanavn">{k.niva}</div>
                    <p className="ak-kst__tekst">{k.spillere}</p>
                    {k.tours && <div className="ak-kst__tours">{k.tours}</div>}
                  </div>
                  <div>
                    <span className="ak-kst__eyebrow">Banevanskelighet</span>
                    <div style={{ display: "flex", gap: 26, marginTop: 12 }}>
                      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span className="ak-kst__crtall">{k.bane?.cr ?? "—"}</span>
                        <span className="ak-kst__crlbl">Course rating</span>
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span className="ak-kst__crtall">{k.bane?.slope ?? "—"}</span>
                        <span className="ak-kst__crlbl">Slope</span>
                      </span>
                    </div>
                    {k.bane?.oppsett && <p className="ak-kst__oppsett">{k.bane.oppsett}</p>}
                    {k.bane?.arenaer && <div className="ak-kst__tours" style={{ marginTop: 8 }}>{k.bane.arenaer}</div>}
                  </div>
                </div>

                {/* BÅND 2 · Anbefalt tidsfordeling */}
                <div className="ak-kst__band">
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                    <span className="ak-kst__eyebrow">Anbefalt tidsfordeling — timer/år</span>
                    <span className="ak-kst__hint">klikk et nivå</span>
                  </div>
                  <TidsPyramide aarsmodell={k.aar} perUke={k.timerUke} valgt={valgtNivaa} onVelg={setValgtNivaa} />
                </div>

                {/* BÅND 3 · Forventet SG-profil */}
                {k.sg && (
                  <div className="ak-kst__band">
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span className="ak-kst__eyebrow">Forventet SG-profil</span>
                    </div>
                    <SgKategoriBar
                      kategorier={[
                        { akse: "OTT", sg: k.sg.ott },
                        { akse: "APP", sg: k.sg.app },
                        { akse: "ARG", sg: k.sg.arg },
                        { akse: "PUTT", sg: k.sg.putt },
                      ]}
                      baseline="Broadie scratch"
                    />
                  </div>
                )}

                {/* BÅND 4 · Forventet testnivå */}
                {k.tester && (
                  <div className="ak-kst__band">
                    <span className="ak-kst__eyebrow">Forventet testnivå</span>
                    <div className="ak-kst__tester">
                      <div className="ak-kst__test"><div className="ak-kst__testlbl">Køllehastighet</div><div className="ak-kst__testverdi">{k.tester.kolle}<span className="ak-kst__enhet">mph</span></div></div>
                      <div className="ak-kst__test"><div className="ak-kst__testlbl">Ballhastighet</div><div className="ak-kst__testverdi">{k.tester.ball}<span className="ak-kst__enhet">mph</span></div></div>
                      <div className="ak-kst__test"><div className="ak-kst__testlbl">Spenst (CMJ)</div><div className="ak-kst__testverdi">{k.tester.cmj}<span className="ak-kst__enhet">cm</span></div></div>
                      <div className="ak-kst__test"><div className="ak-kst__testlbl">20 m sprint</div><div className="ak-kst__testverdi">{k.tester.sprint}<span className="ak-kst__enhet">s</span></div></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

import React from "react";

/**
 * AK Golf HQ — StrikeSmashKort
 * Treffpunkt-heatmap på køllebladet (3×3, tetthet i nøytral blekk-skala — theme-
 * trygg og fargeblind-sikker) side ved side med smash factor per sone (mono-tall
 * dømt mot ideal: --up / --warning / --down). Tomme soner = ærlig «—».
 * Datagrunnlag alltid synlig. Tomt = onboarding, aldri blank.
 */
const CSS = `
.ak-ssk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);
  padding:20px;display:flex;flex-direction:column;gap:12px;}
.ak-ssk__eyebrow{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);}
.ak-ssk__tittel{font-family:var(--font-display);font-weight:700;font-size:var(--text-18);
  line-height:1.2;letter-spacing:var(--tracking-display);color:var(--text);margin:6px 0 0;}
.ak-ssk__sub{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);margin-top:4px;}
.ak-ssk__paneler{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;}
.ak-ssk__plbl{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-faint);display:block;margin-bottom:8px;}
.ak-ssk__svg{width:100%;height:auto;display:block;}
.ak-ssk__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}
.ak-ssk__celle{min-height:27px;border-radius:6px;border:1px solid var(--border);background:var(--surface-2);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-size:var(--text-12);font-weight:700;font-variant-numeric:tabular-nums;}
.ak-ssk__cap{font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-align:center;margin-top:6px;}
.ak-ssk__foot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.ak-ssk__dom{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.5;color:var(--text-2);margin:0;flex:1;min-width:200px;}
.ak-ssk__ideal{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);white-space:nowrap;}
.ak-ssk__tomtekst{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-ssk__skel{height:120px;border-radius:10px;background:var(--surface-2);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-ssk-css")) {
  const s = document.createElement("style"); s.id = "ak-ssk-css"; s.textContent = CSS; document.head.appendChild(s);
}

const fmt2 = (n) => n.toFixed(2).replace(".", ",");

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret). Andel-fagtall kun elite. */
const NIVA = {
  nybegynner: { visDom: false, visIdeal: false, visAndel: false },
  ovet:       { visDom: true,  visIdeal: true,  visAndel: false },
  elite:      { visDom: true,  visIdeal: true,  visAndel: true  },
};

export function StrikeSmashKort({
  kolle,
  soner = [],
  idealSmash = 1.5,
  grunnlag,
  dom,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  if (loading) {
    return (
      <div className={`ak-ssk ${className}`} style={style} aria-busy="true">
        <span className="ak-ssk__eyebrow">Treff &amp; smash</span>
        <div className="ak-ssk__paneler"><div className="ak-ssk__skel" /><div className="ak-ssk__skel" /></div>
      </div>
    );
  }
  if (tomt || soner.length !== 9) {
    return (
      <div className={`ak-ssk ${className}`} style={style} role="status">
        <span className="ak-ssk__eyebrow">Treff &amp; smash</span>
        <h3 className="ak-ssk__tittel" style={{ color: "var(--text-2)" }}>Ingen treffdata ennå</h3>
        <p className="ak-ssk__tomtekst">Kjør en TrackMan-økt med treffpunkt-måling, så tegnes bladet og smash per sone her.</p>
      </div>
    );
  }

  const N = NIVA[nivaa] || NIVA.ovet;
  const maksAndel = Math.max(0.01, ...soner.map((z) => z.andel ?? 0));
  const maksIdx = soner.reduce((bi, z, i) => ((z.andel ?? 0) > (soner[bi].andel ?? 0) ? i : bi), 0);

  /* blad-geometri: 3×3 soner inne i face-silhuetten */
  const x0 = 30, y0 = 28, cw = 28, ch = 14, gap = 3;

  const smashFarge = (z) => {
    if (z.smash == null || (z.andel ?? 0) < 0.005) return "var(--text-faint)";
    const diff = idealSmash - z.smash;
    if (diff <= 0.015) return "var(--up)";
    if (diff <= 0.045) return "var(--warning)";
    return "var(--down)";
  };

  return (
    <div className={`ak-ssk ${className}`} style={style}>
      <div>
        <span className="ak-ssk__eyebrow">Treff &amp; smash</span>
        <h3 className="ak-ssk__tittel">{kolle}</h3>
        {/* Datagrunnlag alltid synlig */}
        <div className="ak-ssk__sub">{grunnlag || "Datagrunnlag mangler"}</div>
      </div>

      <div className="ak-ssk__paneler">
        <div>
          <span className="ak-ssk__plbl">Treffpunkt</span>
          <svg className="ak-ssk__svg" viewBox="0 0 150 104" role="img"
            aria-label={`Treffpunkt-fordeling på ${kolle || "køllebladet"} — tettest i sone ${maksIdx + 1} av 9`}>
            <path d="M18 24 Q75 10 132 24 L138 78 Q75 96 12 78 Z"
              fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
            {soner.map((z, i) => {
              const r = Math.floor(i / 3), c = i % 3;
              const tom = (z.andel ?? 0) < 0.005;
              const tint = Math.round(6 + ((z.andel ?? 0) / maksAndel) * 46);
              return (
                <rect key={i}
                  x={x0 + c * (cw + gap)} y={y0 + r * (ch + gap)} width={cw} height={ch} rx="3"
                  fill={tom ? "transparent" : `color-mix(in srgb, var(--text) ${tint}%, transparent)`}
                  stroke={i === maksIdx ? "var(--text-muted)" : "var(--border)"}
                  strokeDasharray={tom ? "3 2" : "none"} strokeWidth={i === maksIdx ? 1.2 : 0.8}
                />
              );
            })}
          </svg>
          <div className="ak-ssk__cap">Hæl ← → Tå</div>
        </div>

        <div>
          <span className="ak-ssk__plbl">Smash per sone</span>
          <div className="ak-ssk__grid" role="img" aria-label={`Smash factor per treffsone mot ideal ${fmt2(idealSmash)}`}>
            {soner.map((z, i) => {
              const tom = z.smash == null || (z.andel ?? 0) < 0.005;
              return (
                <span key={i} className="ak-ssk__celle" style={{ color: smashFarge(z), flexDirection: "column", gap: 1 }}>
                  {tom ? "—" : fmt2(z.smash)}
                  {N.visAndel && !tom && <span style={{ fontSize: 9, fontWeight: 400, color: "var(--text-faint)" }}>{Math.round((z.andel ?? 0) * 100)} %</span>}
                </span>
              );
            })}
          </div>
          <div className="ak-ssk__cap">Hæl ← → Tå</div>
        </div>
      </div>

      {((N.visDom && dom) || N.visIdeal) && (
        <div className="ak-ssk__foot">
          {N.visDom && dom && <p className="ak-ssk__dom">{dom}</p>}
          {N.visIdeal && <span className="ak-ssk__ideal">Ideal {fmt2(idealSmash)}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * AK Golf HQ — StrikeSmashKort
 * Treffpunkt-heatmap på køllebladet (3×3, tetthet i nøytral blekk-skala — theme-
 * trygg og fargeblind-sikker) side ved side med smash factor per sone (mono-tall
 * dømt mot ideal: --up / --warning / --down). Tomme soner = ærlig «—».
 * Datagrunnlag alltid synlig. Tomt = onboarding, aldri blank.
 */

export type StrikeSone = {
  /** Andel av slagene i sonen (0–1). Under 0,005 regnes sonen som tom → «—». */
  andel: number;
  /** Snitt smash factor i sonen. null = ingen data. */
  smash: number | null;
};

export type StrikeSmashKortProps = {
  /** Kølla målingen gjelder, f.eks. "Driver". */
  kolle?: string;
  /** NØYAKTIG 9 soner, radvis fra øverst-hæl → nederst-tå (3×3). */
  soner?: StrikeSone[];
  /** Ideal smash for kølla (driver ≈ 1,50). Dømmer sonefargene. Default 1.5. */
  idealSmash?: number;
  /** Datagrunnlag — alltid synlig, f.eks. "86 slag · TrackMan". */
  grunnlag?: string;
  /** Klarspråk-dom, f.eks. «Lav hæl-treff koster 0,06 smash — tee ballen høyere.» */
  dom?: string;
  /** Progressiv dybde — én kodevei: nybegynner (panelene) · ovet (+dom/ideal) · elite (+andel-% per sone). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const fmt2 = (n: number) => n.toFixed(2).replace(".", ",");

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
}: StrikeSmashKortProps) {
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

  const smashFarge = (z: StrikeSone) => {
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
                  {z.smash == null || tom ? "—" : fmt2(z.smash)}
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

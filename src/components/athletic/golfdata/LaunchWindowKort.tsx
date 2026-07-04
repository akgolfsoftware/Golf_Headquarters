/**
 * AK Golf HQ — LaunchWindowKort
 * Launch/spinn-scatter per kølle mot skravert optimalt vindu for spillerens
 * CS-nivå (CS50–CS100). Dommen i meter: hvor mange meter som ligger igjen i
 * vinduet. Vindu = --success-bg/-border; treff i vinduet = fylt --up-punkt,
 * utenfor = åpen ring (form + farge — fargeblind-sikkert). Datagrunnlag alltid
 * synlig. Tomt = onboarding, aldri blank.
 */

export type LaunchSkudd = {
  /** Launch-vinkel i grader. */
  launch: number;
  /** Spinn i rpm. */
  spinn: number;
};

export type LaunchVindu = {
  launchMin: number;
  launchMax: number;
  spinnMin: number;
  spinnMax: number;
};

export type LaunchWindowKortProps = {
  /** Kølla scatteret gjelder, f.eks. "Driver". */
  kolle?: string;
  /** Spillerens CS-nivå (CS50–CS100) — navngir vinduet. */
  csNivaa?: string;
  /** TrackMan-slag (launch °, spinn rpm). */
  skudd?: LaunchSkudd[];
  /** Optimalt vindu for CS-nivået — skravert sone (--success-bg/-border). */
  vindu?: LaunchVindu;
  /** Dommen: meter som ligger igjen i vinduet — ALLTID i meter. Tall («9») eller ferdig streng. */
  meterIgjen?: number | string;
  /** Datagrunnlag — alltid synlig, f.eks. "26 slag · TrackMan". */
  grunnlag?: string;
  /** Klarspråk-dom under grafen, f.eks. «Spinnen ligger ~400 rpm for høyt …». */
  dom?: string;
  /** Progressiv dybde — én kodevei: nybegynner (graf+hero) · ovet (+dom) · elite (+vindu-fagtall). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function fmtMeter(m: number | string | null | undefined): string {
  if (m == null) return "—";
  if (typeof m === "string") return m;
  if (m === 0) return "0 m";
  return (m > 0 ? "+" : "−") + String(Math.abs(m)).replace(".", ",") + " m";
}

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret). Vindu-fagtall kun elite. */
const NIVA = {
  nybegynner: { visDom: false, visVindu: false },
  ovet:       { visDom: true,  visVindu: false },
  elite:      { visDom: true,  visVindu: true  },
};

export function LaunchWindowKort({
  kolle,
  csNivaa,
  skudd = [],
  vindu,
  meterIgjen,
  grunnlag,
  dom,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}: LaunchWindowKortProps) {
  if (loading) {
    return (
      <div className={`ak-lwk ${className}`} style={style} aria-busy="true">
        <span className="ak-lwk__eyebrow">Launch-vindu</span>
        <div className="ak-lwk__skel" />
      </div>
    );
  }
  if (tomt || skudd.length === 0 || !vindu) {
    return (
      <div className={`ak-lwk ${className}`} style={style} role="status">
        <span className="ak-lwk__eyebrow">Launch-vindu</span>
        <h3 className="ak-lwk__tittel" style={{ color: "var(--text-2)" }}>Ingen TrackMan-data ennå</h3>
        <p className="ak-lwk__tomtekst">
          Kjør en TrackMan-økt med {kolle || "kølla"}, så tegnes det optimale vinduet for {csNivaa || "ditt CS-nivå"} her — og hvor mange meter som ligger igjen i det.
        </p>
      </div>
    );
  }

  const N = NIVA[nivaa] || NIVA.ovet;
  const W = 340, H = 196;
  const m = { l: 38, r: 10, t: 10, b: 24 };
  const xs = skudd.map((s) => s.launch).concat([vindu.launchMin, vindu.launchMax]);
  const ys = skudd.map((s) => s.spinn).concat([vindu.spinnMin, vindu.spinnMax]);
  const xMin = Math.min(...xs) - 1.2, xMax = Math.max(...xs) + 1.2;
  const yMin = Math.min(...ys) - 260, yMax = Math.max(...ys) + 260;
  const X = (v: number) => m.l + ((v - xMin) / (xMax - xMin)) * (W - m.l - m.r);
  const Y = (v: number) => H - m.b - ((v - yMin) / (yMax - yMin)) * (H - m.t - m.b);

  const inne = skudd.filter((s) =>
    s.launch >= vindu.launchMin && s.launch <= vindu.launchMax &&
    s.spinn >= vindu.spinnMin && s.spinn <= vindu.spinnMax);
  const pct = Math.round((inne.length / skudd.length) * 100);

  const xTicks = [xMin + 1.2, (xMin + xMax) / 2, xMax - 1.2].map((v) => Math.round(v * 10) / 10);
  const yTicks = [yMin + 260, (yMin + yMax) / 2, yMax - 260].map((v) => Math.round(v / 100) * 100);
  const tickTxt: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 8.5, fill: "var(--text-faint)" };

  return (
    <div className={`ak-lwk ${className}`} style={style}>
      <div className="ak-lwk__hode">
        <div>
          <span className="ak-lwk__eyebrow">Launch-vindu</span>
          <h3 className="ak-lwk__tittel">{kolle}</h3>
          {/* Datagrunnlag alltid synlig */}
          <div className="ak-lwk__sub">{csNivaa}{grunnlag ? ` · ${grunnlag}` : " · datagrunnlag mangler"}</div>
        </div>
        <div className="ak-lwk__hero">
          <div className="ak-lwk__meter">{fmtMeter(meterIgjen)}</div>
          <div className="ak-lwk__meterlbl">ligger i vinduet</div>
        </div>
      </div>

      <svg className="ak-lwk__svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Launch mot spinn for ${kolle || "kølle"} — ${inne.length} av ${skudd.length} slag i det optimale vinduet for ${csNivaa || "CS-nivået"}`}>
        {/* rutenett */}
        {yTicks.map((v, i) => (
          <g key={`y${i}`}>
            <line x1={m.l} x2={W - m.r} y1={Y(v)} y2={Y(v)} stroke="var(--border)" strokeWidth="0.75" />
            <text x={m.l - 5} y={Y(v) + 3} textAnchor="end" style={tickTxt}>{v}</text>
          </g>
        ))}
        {xTicks.map((v, i) => (
          <g key={`x${i}`}>
            <line y1={m.t} y2={H - m.b} x1={X(v)} x2={X(v)} stroke="var(--border)" strokeWidth="0.75" />
            <text x={X(v)} y={H - m.b + 12} textAnchor="middle" style={tickTxt}>{String(v).replace(".", ",")}</text>
          </g>
        ))}
        <text x={m.l + 5} y={m.t + 2} textAnchor="start" style={tickTxt}>rpm</text>
        <text x={W - m.r} y={m.t + 2} textAnchor="end" style={tickTxt}>launch °</text>

        {/* optimalt vindu for CS-nivået */}
        <rect
          x={X(vindu.launchMin)} y={Y(vindu.spinnMax)}
          width={X(vindu.launchMax) - X(vindu.launchMin)}
          height={Y(vindu.spinnMin) - Y(vindu.spinnMax)}
          rx="4" fill="var(--success-bg)" stroke="var(--success-border)" strokeDasharray="4 3" strokeWidth="1"
        />
        <text x={X(vindu.launchMin) + 6} y={Y(vindu.spinnMax) + 12}
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, fill: "var(--success)" }}>
          Vindu · {csNivaa}
        </text>

        {/* skudd: i vinduet = fylt, utenfor = åpen ring (form + farge) */}
        {skudd.map((s, i) => {
          const er = s.launch >= vindu.launchMin && s.launch <= vindu.launchMax &&
                     s.spinn >= vindu.spinnMin && s.spinn <= vindu.spinnMax;
          return er
            ? <circle key={i} cx={X(s.launch)} cy={Y(s.spinn)} r="3.4" fill="var(--up)" />
            : <circle key={i} cx={X(s.launch)} cy={Y(s.spinn)} r="3" fill="none" stroke="var(--text-muted)" strokeWidth="1.4" />;
        })}
      </svg>

      <div className="ak-lwk__stats">
        {inne.length} av {skudd.length} slag i vinduet ({pct} %)
        {N.visVindu ? ` · vindu ${String(vindu.launchMin).replace(".", ",")}–${String(vindu.launchMax).replace(".", ",")}° · ${vindu.spinnMin}–${vindu.spinnMax} rpm` : ""}
      </div>
      {N.visDom && dom && <p className="ak-lwk__dom">{dom}</p>}
    </div>
  );
}

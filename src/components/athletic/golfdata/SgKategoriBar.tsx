import { Skeleton } from "./Skeleton";

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

export type SgKategori = {
  akse: "OTT" | "APP" | "ARG" | "PUTT";
  /** SG mot baseline i slag (fortegn: + gevinst, − tap). */
  sg: number;
  baseline?: string;
};

export type SgKategoriBarProps = {
  kategorier: SgKategori[];
  /** Navngitt baseline — vist fra nivå «øvet». */
  baseline?: string;
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const NIVA = {
  nybegynner: { fagkoder: false, visBaseline: false },
  ovet:       { fagkoder: false, visBaseline: true },
  elite:      { fagkoder: true,  visBaseline: true },
};
const AKSE = { OTT:{klar:"Tee-slag",fag:"OTT"}, APP:{klar:"Innspill",fag:"APP"}, ARG:{klar:"Nærspill",fag:"ARG"}, PUTT:{klar:"Putting",fag:"PUTT"} };
const fmt = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");

export function SgKategoriBar({
  kategorier = [],
  baseline = "Broadie scratch",
  nivaa = "ovet",
  loading = false,
  className = "",
  style,
}: SgKategoriBarProps) {
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
              <span className="ak-skb__fill" style={{ ...(gain ? { left: "50%" } : { right: "50%" }), width: `${w}%`, background: gain ? "var(--up)" : "var(--down)" }} />
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

import { DeltaIndikator } from "./DeltaIndikator";
import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — NesteFokusKort
 * Dommen, ikke grafen: største SG-lekkasje → anbefalt treningsområde i klarspråk,
 * koblet til AK-formel-akse («Tren SLAG_PUTT»). Verdikten er helten; SG-tapet er
 * bevis UNDER den. Fortellermønster invertert her fordi kortets jobb ER handlingen.
 *
 * Progressiv dybde (én kodevei): NIVA[nivå] gater lag; term() bytter klarspråk↔fagkode.
 * Tomtilstand = onboarding (aldri blank). SG i «slag» mot navngitt baseline, --up/--down (aldri lime).
 */

export type NesteFokusKortProps = {
  /** Verdikten i klarspråk (helten). F.eks. «Putting innenfor 6 ft er største lekkasje». */
  omrade?: string;
  /** SG-aksen lekkasjen gjelder — styrer klarspråk/fagkode-visning. */
  akse?: "OTT" | "APP" | "ARG" | "PUTT";
  /** AK-formel-akse-kode (elite/coach), f.eks. "SLAG_PUTT" → «Tren SLAG_PUTT». */
  formelAkse?: string;
  /** SG-tap som visningsstreng m/ fortegn og desimal, f.eks. "−1,2". Enheten «slag» legges på. */
  sgTap?: string;
  /** Navngitt baseline — ALLTID vist. F.eks. "Broadie scratch" / "Team Norway IUP" / "Kategori B-krav". */
  baseline?: string;
  /** Klarspråk-forklaring (vises fra nivå «øvet»). */
  begrunnelse?: string;
  /** Benchmark-linje (kun «elite»), f.eks. "Tour-snitt +0,4 slag". */
  benchmark?: string;
  /** Progressiv dybde — én kodevei, gater lag + klarspråk↔fagkode. Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  handlingTekst?: string;
  onHandling?: () => void;
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const NIVA = {
  nybegynner: { visWhy: false, visBenchmark: false, fagkoder: false },
  ovet:       { visWhy: true,  visBenchmark: false, fagkoder: false },
  elite:      { visWhy: true,  visBenchmark: true,  fagkoder: true  },
};
/* SG-akse → klarspråk (spiller) og fagkode (coach/elite) */
const AKSE = {
  OTT:  { klar: "Tee-slag",  fag: "SG-OTT" },
  APP:  { klar: "Innspill",  fag: "SG-APP" },
  ARG:  { klar: "Nærspill",  fag: "SG-ARG" },
  PUTT: { klar: "Putting",   fag: "SG-PUTT" },
};

export function NesteFokusKort({
  omrade,
  akse = "PUTT",
  formelAkse,
  sgTap,
  baseline = "Broadie scratch",
  begrunnelse,
  benchmark,
  nivaa = "ovet",
  handlingTekst = "Legg inn treningsøkt",
  onHandling,
  loading = false,
  tomt = false,
  className = "",
  style,
}: NesteFokusKortProps) {
  const N = NIVA[nivaa] || NIVA.ovet;
  const a = AKSE[akse] || AKSE.PUTT;

  if (loading) return <Skeleton variant="card" width="100%" height={190} className={className} style={style} />;

  if (tomt) {
    return (
      <div className={`ak-nfk ${className}`} role="status" style={{ alignItems: "flex-start", ...style }}>
        <span className="ak-nfk__eyebrow">Neste fokus</span>
        <h3 className="ak-nfk__dom" style={{ color: "var(--text-2)" }}>Spill din første runde for å se Strokes Gained</h3>
        <p className="ak-nfk__why">Når du har logget en runde, peker vi ut hvor du taper flest slag — og hva du bør trene på.</p>
        {onHandling && <button className="ak-nfk__cta" onClick={onHandling}>Logg en runde</button>}
      </div>
    );
  }

  return (
    <div className={`ak-nfk ${className}`} style={style}>
      <span className="ak-nfk__eyebrow">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
        Neste fokus
      </span>

      {/* DOM — helten */}
      <h3 className="ak-nfk__dom">{omrade || `${a.klar} er der du taper flest slag`}</h3>

      {/* EVIDENS — SG-tap mot navngitt baseline, aldri lime */}
      {sgTap != null && (
        <div className="ak-nfk__evidens">
          <DeltaIndikator verdi={`${sgTap} slag`} size="md" srLabel={`${a.klar} mot ${baseline}`} />
          <span className="ak-nfk__base">{a.klar} · mot {baseline}</span>
        </div>
      )}

      {N.visWhy && begrunnelse && <p className="ak-nfk__why">{begrunnelse}</p>}

      <div className="ak-nfk__foot">
        {onHandling && <button className="ak-nfk__cta" onClick={onHandling}>{handlingTekst}</button>}
        {N.fagkoder && formelAkse && <span className="ak-nfk__kode">Tren {formelAkse}</span>}
        {N.visBenchmark && benchmark && <span className="ak-nfk__base">{benchmark}</span>}
      </div>
    </div>
  );
}

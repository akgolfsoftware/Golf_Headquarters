/**
 * AK Golf HQ — HeroTall
 * Naken tall-lockup: mono-caps eyebrow + stor tabulær mono + dempet enhet.
 * Primitiven bak «to tall, aldri blandet»-regelen (plan-kvalitet + gjennomføring
 * som to separate HeroTall). Kritisk data → alltid --text (dagslys-porten ≥7:1).
 * Tile-varianten er KpiTile; denne er for topplinjer og hero-soner.
 */

export type HeroTallProps = {
  /** Eyebrow-etikett, f.eks. "Plan-kvalitet" eller "Gjennomføring". */
  label: string;
  /** Verdien som visningsstreng (norsk komma) eller tall, f.eks. "87" / "94 %". */
  verdi: string | number;
  /** Enhets-suffiks i dempet liten tekst, f.eks. "%", "av 100", "SG". */
  enhet?: string;
  /** Størrelse: "md" (36px) · "lg" (48px, default) · "xl" (60px). */
  size?: "md" | "lg" | "xl";
  /** Valgfri delta-node — bruk <DeltaIndikator>. */
  delta?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function HeroTall({ label, verdi, enhet, size = "lg", delta, className = "", style }: HeroTallProps) {
  return (
    <div className={`ak-hero ak-hero--${size} ${className}`} style={style}>
      <span className="ak-hero__lbl">{label}</span>
      <span className="ak-hero__row">
        <span className="ak-hero__val">{verdi}</span>
        {enhet && <span className="ak-hero__enhet">{enhet}</span>}
        {delta}
      </span>
    </div>
  );
}

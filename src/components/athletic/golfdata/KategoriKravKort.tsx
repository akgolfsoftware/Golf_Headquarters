import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — KategoriKravKort
 * Spillerens A–K-nivå (A = beste, jf. kanon-beslutning): bestått/gjenstår per
 * testprotokoll + neste krav. Sjekkliste, ikke graf — hva som må til for neste nivå.
 */

export type Kravrad = {
  navn: string;
  bestatt: boolean;
  /** Nåværende verdi (visningsstreng). */
  verdi?: string;
  /** Målverdi/krav (visningsstreng). */
  mal?: string;
};

export type KategoriKravKortProps = {
  /** Spillerens nivå A–K (A = beste, jf. kanon). */
  nivaa: string;
  nesteNivaa?: string;
  krav: Kravrad[];
  /** Neste krav i klarspråk. */
  nesteKrav?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function KategoriKravKort({
  nivaa, nesteNivaa, krav = [], nesteKrav, loading = false, className = "", style,
}: KategoriKravKortProps) {
  if (loading) return <Skeleton variant="card" width="100%" height={240} className={className} style={style} />;
  const bestatt = krav.filter((k) => k.bestatt).length;
  return (
    <div className={`ak-kkk ${className}`} style={style}>
      <div className="ak-kkk__head">
        <span className="ak-kkk__niva">{nivaa || "–"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-16)", color: "var(--text)" }}>Kategori {nivaa}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--text-muted)", marginTop: 3 }}>{bestatt} av {krav.length} krav bestått{nesteNivaa ? ` · neste: ${nesteNivaa}` : ""}</div>
        </div>
      </div>
      <div>
        {krav.map((k) => (
          <div key={k.navn} className="ak-kkk__krav">
            {k.bestatt ? (
              <svg className="ak-kkk__ic" viewBox="0 0 24 24" fill="none" stroke="var(--up)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-label="bestått"><path d="M20 6 9 17l-5-5"/></svg>
            ) : (
              <svg className="ak-kkk__ic" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" aria-label="gjenstår"><circle cx="12" cy="12" r="9"/></svg>
            )}
            <span className="ak-kkk__navn" style={{ color: k.bestatt ? "var(--text)" : "var(--text-2)" }}>{k.navn}</span>
            {k.verdi != null && <span className="ak-kkk__verdi">{k.verdi}{k.mal ? ` / ${k.mal}` : ""}</span>}
          </div>
        ))}
      </div>
      {nesteKrav && <div className="ak-kkk__next"><strong style={{ color: "var(--text)", fontWeight: 600 }}>Neste krav:</strong> {nesteKrav}</div>}
    </div>
  );
}

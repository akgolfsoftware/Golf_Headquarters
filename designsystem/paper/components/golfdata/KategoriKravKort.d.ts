/**
 * Kravene til neste A–K-kategori: rad per testprotokoll, nå-verdi mot krav,
 * ✓ når møtt (~5 skjermer). Krav er ANBEFALINGER — aldri sperrer
 * (invariant 1). Kravverdier kommer fra CANON via konsumenten; komponenten
 * hardkoder aldri referanser (FYS-formelen avventer Anders). IKKE
 * KategoriFjell (hele profilen som figur). Chromeless — Panel eier flaten.
 */
export interface KategoriKrav {
  /** «Snittscore», «Driver carry», «Putt 6 ft make-%» */
  label: string;
  /** Formatert nå-verdi: «74,1» */
  current: string;
  /** Formatert krav: «≤ 73,0» */
  required: string;
  met?: boolean;
}
export interface KategoriKravKortProps {
  fromCategory: string;
  toCategory: string;
  requirements: KategoriKrav[];
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}

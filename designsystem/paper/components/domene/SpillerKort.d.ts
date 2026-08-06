/**
 * Spillerkortet i stallen/gruppene: avatar + navn + kategori-tag + én KPI
 * (~8 skjermer). ETT treffmål — åpner profil-artefaktet. Komponerer Avatar
 * og StatusBadge (kategori = kind=tag, fargeløs — A–K fargekodes aldri).
 * IKKE ListRow (generell rad) — spillerkortet eier stall-anatomien.
 */
export interface SpillerKortProps {
  /** Fullt navn — demo-kanon: Øyvind Rohjan */
  name: string;
  /** «Kategori C» — rendres som fargeløs tag */
  category?: string;
  /** «AK Golf Academy · sist aktiv i går» */
  meta?: string;
  kpiValue?: string;
  kpiLabel?: string;
  /** Statusbadge-tekst: «Venter samtykke» */
  badge?: string;
  badgeTone?: "up" | "warn" | "info" | "mut" | "ny";
  /** Uten ramme — i ListGroup-sammenheng */
  flat?: boolean;
  onClick?: () => void;
  dataOdId?: string;
}

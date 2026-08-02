/**
 * Seksjonstittel med tellerbadge (~5 skjermer). Står over en gruppe
 * paneler eller lister på en side — utenfor Panel, ikke inne i det.
 *
 * Ikke SectionLabel (mono versaletikett, ikke en overskrift) og ikke
 * Panels `title` (som hører til én flate). SectionHeader er en ekte
 * overskrift i dokumentets hierarki.
 */
export interface SectionHeaderProps {
  title: React.ReactNode;
  /** Antall i gruppen. Mono, tabular-nums. Utelat når tallet ikke er nyttig. */
  count?: number | string;
  /** Følger dokumentets disposisjon. h2 under PageHeaders h1. */
  level?: 2 | 3 | 4;
  /** Én lenke eller ghost-knapp, som i Panel */
  action?: React.ReactNode;
  dataOdId?: string;
}

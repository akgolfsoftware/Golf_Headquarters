/**
 * «Mer her»-raden som hopper videre til beslektede skjermer eller faner
 * (~6 skjermer). Sekundær navigasjon i bunnen av en seksjon — ikke
 * hovednavigasjon, og ikke et filter.
 */
export interface QuickLink { id?: string; text: React.ReactNode; href?: string; onClick?: () => void }
export interface QuickLinkBarProps {
  /** Mono versaletikett foran lenkene. Blir også aria-label på <nav>. */
  label?: string;
  links: QuickLink[];
  dataOdId?: string;
}

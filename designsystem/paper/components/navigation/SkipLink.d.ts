/**
 * Hopp til innhold (~4 skjermer, bør være på alle). Første fokuserbare
 * element i dokumentet, usynlig til den får fokus.
 */
export interface SkipLinkProps {
  /** id på hovedinnholdet, som må ha tabindex="-1" */
  href?: string;
  children?: React.ReactNode;
  dataOdId?: string;
}

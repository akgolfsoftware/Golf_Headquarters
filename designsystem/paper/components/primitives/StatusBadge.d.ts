/**
 * Statusmerke og kategorimerke (~30 skjermer). Ikke klikkbar — er det
 * klikkbart, er det Chip (filter), ikke badge.
 *
 * To jobber i én komponent:
 *   kind="status"  bærer datasemantikk og har farge.
 *   kind="tag"     bærer AK-vokabular og er permanent fargeløs.
 */
export interface StatusBadgeProps {
  /** status = semantisk farge · tag = fargeløs kategorietikett */
  kind?: "status" | "tag";
  /**
   * Kun for kind="status".
   * up = bedre/godkjent (--up) · warn = attention/avvik (--dn) ·
   * info = nøytral opplysning (--info) · mut = passiv/venter (--soft) ·
   * ny = blekkfylt «Ny» (ingen farge — nyhet er ikke en verdivurdering)
   */
  tone?: "up" | "warn" | "info" | "mut" | "ny";
  /** Liten prikk i currentColor foran teksten. Kun kind="status". */
  dot?: boolean;
  dataOdId?: string;
  children?: React.ReactNode;
}

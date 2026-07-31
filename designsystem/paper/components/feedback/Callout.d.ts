/**
 * Inline notis inne i et panel eller under et felt (~35 skjermer).
 * Fire toner, ingen flere: nøytral, warn, info, personvern.
 *
 * Ingen venstrekant — 3px venstrekant er OneThingNows signatur.
 * Tone bæres av ikon + etikettfarge + border-tint på --soft-fyll.
 * Brødteksten er ALLTID --fg, aldri tonefarget.
 *
 * Callout eier ikke tomhet: panelnivå = EmptyState, komponentnivå = Region.
 */
export interface CalloutProps {
  /** neutral (notis-ikon, --muted) · warn (varsel, --dn) · info (info, --info) · privacy (laas, --info) */
  tone?: "neutral" | "warn" | "info" | "privacy";
  /** Kort mono versaletikett: «MERK», «PERSONVERN», «VALIDERING» */
  label?: string;
  dataOdId?: string;
  children?: React.ReactNode;
}

/**
 * Frittstående modusbytter for skjermer uten Topbar (~4 skjermer).
 * Topbar har sin egen; denne er samme oppførsel uten navigasjonen.
 */
export interface ThemeToggleProps {
  /** akhq-theme-agencyos (standard) eller akhq-theme-playerhq — flatene huskes hver for seg */
  storageKey?: string;
  /** CSS-selektor for elementet data-theme settes på. Standard <html>. */
  target?: string;
  dataOdId?: string;
}

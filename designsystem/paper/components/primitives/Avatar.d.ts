/**
 * Initialer i sirkel (~35 skjermer). Erstatter de to håndrullede
 * sirklene: initialsirkelen i stall-raden og avatar-plassen i ListRow.
 *
 * Ikke det samme som statussirkelen i StatusCircleRow — den er en
 * tilstandsindikator med samme geometri, ikke en person.
 */
export interface AvatarProps {
  /** Fullt navn. Initialer utledes: «Øyvind Rohjan» → ØR, ettordsnavn → to første. */
  name?: string;
  /** Overstyr utledede initialer (klubb, lag, «G16») */
  initials?: string;
  /** Bilde når det finnes; initialene er fallback, ikke motsatt */
  src?: string;
  /** sm 28px · md 36px (radstandard) · lg 48px (profilhode) */
  size?: "sm" | "md" | "lg";
  /** soft = --soft/--muted (standard) · ink = blekkfylt (innlogget bruker) · outline = kun border */
  tone?: "soft" | "ink" | "outline";
  /** true når navnet står som synlig tekst rett ved — da er avataren aria-hidden */
  decorative?: boolean;
  dataOdId?: string;
}
/** Statisk hjelper: initialer uten sirkelen. Avatar.initials("Øyvind Rohjan") → "ØR" */
export namespace Avatar {
  function initials(name: string): string;
}

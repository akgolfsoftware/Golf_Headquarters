/**
 * Det editorielle fremhevede kortet: kicker + display-tittel + Lora-prosa +
 * handlinger, radius --r-md og den ene myke skyggen (~6 skjermer —
 * onboarding, marketing, tomme førstegangsflater). Erstatter pensjonerte
 * athletic/FeaturedCard. IKKE Panel (arbeidsflatens kort) — aldri inne i
 * arbeidsflater, maks én per skjerm.
 */
export interface FeaturedCardProps {
  kicker?: string;
  title: string;
  /** Prosa (Lora) */
  children?: React.ReactNode;
  /** Bibliotekets Button-noder */
  actions?: React.ReactNode;
  /** Soft-flate uten skygge (sekundær fremheving) */
  soft?: boolean;
  dataOdId?: string;
}

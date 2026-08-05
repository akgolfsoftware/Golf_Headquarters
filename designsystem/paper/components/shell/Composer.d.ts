export interface ComposerContext {
  id: string;
  /** Kort mono-etikett: «Øyvind R.», «uke 31», «P3 SPES» */
  label: string;
  active?: boolean;
}
export interface ComposerProps {
  placeholder?: string;
  /** Styrt modus. Utelat for ustyrt (komponenten holder egen tekst) */
  value?: string;
  onChange?: (value: string) => void;
  /** ⏎ sender, ⇧⏎ gir ny linje */
  onSubmit?: (value: string) => void;
  sendLabel?: string;
  /** Skjules under 420 px container */
  hint?: string;
  /** Kontekstchips: hva spørsmålet gjelder. Toggles, aldri fjernes stille */
  context?: ComposerContext[];
  onContextToggle?: (id: string) => void;
  disabled?: boolean;
  dataOdId?: string;
}

/**
 * details/summary-mønsteret (~5 skjermer): P1–P10-listen og FAQ.
 * Ingen JS-tilstand — nettleseren eier åpen/lukket, så innholdet er
 * søkbart og fungerer uten skript.
 */
export interface AccordionItem {
  id?: string;
  title: React.ReactNode;
  /** Mono-notat ved tittelen: «har fasit», «3 punkter» */
  meta?: React.ReactNode;
  body: React.ReactNode;
  defaultOpen?: boolean;
}
export interface AccordionProps {
  items: AccordionItem[];
  /** Samme name gjør gruppen eksklusiv (bare én åpen). Utelat for flere åpne. */
  name?: string;
  dataOdId?: string;
}

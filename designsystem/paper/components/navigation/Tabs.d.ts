/**
 * In-page-faner (~10 skjermer; agenticos har 5, okonomi 11).
 * 2px understrek på aktiv fane, ingen spor — visuelt distinkt fra
 * SegmentControl, som er --soft-spor med aktivt segment i --surface.
 *
 * Tabs = navigasjon mellom paneler. SegmentControl = eksklusivt valg
 * av en verdi. Ikke bytt dem om.
 */
export interface TabDef { id: string; label: React.ReactNode; count?: number }
export interface TabsProps {
  tabs: TabDef[];
  /** Kontrollert. Uten value brukes første fane. */
  value?: string;
  onChange?: (id: string) => void;
  /** aria-label på tablist — «Faner» er sjelden nok */
  label?: string;
  dataOdId?: string;
}

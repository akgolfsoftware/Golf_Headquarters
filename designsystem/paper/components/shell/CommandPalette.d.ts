export interface CommandItem {
  id?: string;
  label: string;
  /** Gruppeoverskrift. Rekkefølgen i items bevares — relevans, ikke alfabet */
  group?: string;
  /** Ekstra kontekst til høyre, skjules under 420 px container */
  meta?: string;
  /** 1 = samtale · 2 = artefakt i panel · 3 = full flate. Sier hva som skjer */
  level?: 1 | 2 | 3;
  /** Skjulte søkeord — synonymer, gamle navn, forkortelser */
  keywords?: string;
}
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: (reason: string) => void;
  items?: CommandItem[];
  /** Styrt søketekst. Utelat for ustyrt */
  query?: string;
  onQueryChange?: (q: string) => void;
  onPick?: (item: CommandItem) => void;
  placeholder?: string;
  emptyText?: string;
  /** Utløseren fokus returnerer til ved lukking */
  triggerRef?: React.RefObject<HTMLElement>;
  dataOdId?: string;
}

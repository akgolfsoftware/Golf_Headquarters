/**
 * Kontekstveksleren i coach-flatene: «Alle» + grupper + enkeltspillere som
 * radiogroup (~6 skjermer — Spillere, Kalender, Workbench-gruppe).
 * IKKE FilterPills (filtrerer et sett på flaten) — veksleren bytter HVEM
 * hele flaten handler om. Under 420 px kollapser navn til avatarer.
 */
export interface SgvxItem {
  key: string;
  /** Fullt navn eller gruppenavn */
  label: string;
  /** true = gruppe (ingen avatar) */
  group?: boolean;
  /** Antall i gruppen */
  count?: number;
}
export interface SpillerGruppeVekslerProps {
  items: SgvxItem[];
  /** null = Alle */
  value?: string | null;
  onChange?: (key: string | null) => void;
  showAll?: boolean;
  allLabel?: string;
  allCount?: number;
  framed?: boolean;
  dataOdId?: string;
}

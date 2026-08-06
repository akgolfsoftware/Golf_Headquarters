/**
 * Øktas INNHOLD som artefaktkort: tittel, fokus-prosa, øvelsesliste, status
 * (~8 skjermer — tråden, planen, historikken). IKKE SessionCard (økta
 * plassert på TID med pyramidekant) — OektKort er økta som dokument.
 * Ett treffmål. Chips (AKFormelChip, FleksMerke) sendes som footer.
 */
export interface OektKortProps {
  title: string;
  /** «tir 9. aug · 09:00–10:30» */
  timeLabel?: string;
  /** Lora-prosa i du-form */
  focus?: string;
  /** Øvelsesnavn i rekkefølge — skjules under 340 px */
  drills?: string[];
  status?: "planlagt" | "gjennomfort" | "avlyst";
  statusLabel?: string;
  /** Bibliotekets chips/merker — aldri egne */
  footer?: React.ReactNode;
  onClick?: () => void;
  dataOdId?: string;
}

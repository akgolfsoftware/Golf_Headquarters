import type { ProvenanceDisclosureProps } from "./ProvenanceDisclosure";
export interface QueueCardProps {
  /** Avsender: agentnavn eller menneske. Agenter er avsendere, aldri destinasjoner */
  sender?: string;
  /** "coaching" | "drift" — køen er blandet, og raden må si hvilken hatt den hører til */
  kind?: string;
  /** Alder som mono-streng med enhet: "4 t", "12 d" */
  age?: string;
  title?: string;
  /** Grunnlaget i én linje: hva saken faktisk består av */
  children?: React.ReactNode;
  /** Utfall/tilstand — StatusBadge med semantisk tone */
  status?: string;
  statusTone?: "up" | "warn" | "info" | "mut" | "ny";
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  snoozeLabel?: string;
  onSnooze?: () => void;
  /** Satt = raden er utsatt: dempet kort med synlig «utsatt til» og vei tilbake */
  snoozedUntil?: string;
  onUnsnooze?: () => void;
  unsnoozeLabel?: string;
  /** Toppsaken i køen får blekkramme — ikke oransje */
  first?: boolean;
  /** Obligatorisk for agentgenererte saker: et forslag uten proveniens er ikke ferdig */
  provenance?: ProvenanceDisclosureProps;
  provenanceOpen?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}

export const QUEUE_STATUS_OPTIONS = [
  { value: "risk", label: "Risiko" },
  { value: "watch", label: "Følg med" },
  { value: "check", label: "Sjekk inn" },
  { value: "ok", label: "Løst" },
] as const;

export type QueueStatus = (typeof QUEUE_STATUS_OPTIONS)[number]["value"];

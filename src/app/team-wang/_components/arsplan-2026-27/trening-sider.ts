// Egen fil uten "use client": fellessiden (page.tsx) er en serverkomponent og
// kan ikke lese verdier fra en klientmodul (ga 500 «TRENING_SIDER.some is not a function»).
import type { TreningSide } from "./fane-trening";

export const TRENING_SIDER: { key: TreningSide; label: string }[] = [
  { key: "arsplan", label: "Årsplan" },
  { key: "periodisering", label: "Periodisering" },
  { key: "manedsplan", label: "Månedsplan" },
  { key: "ukeplan", label: "Ukeplan" },
  { key: "oktplaner", label: "Øktplaner" },
];

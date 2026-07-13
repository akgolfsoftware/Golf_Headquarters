/**
 * PlayerHQ 5-seksjons IA — ÉN kilde for rutene og etikettene (Bølge 7,
 * 2026-07-13). Både legacy BottomNav (portal/bottom-nav.tsx) og v2-skallet
 * (v2/shell.tsx PLAYERHQ_NAV) bygger fra denne lista, så de to navene
 * aldri glir fra hverandre. Ikoner velges lokalt (Lucide-komponent vs
 * v2-ikonnavn) — ruter og navn bor HER.
 */

export const PLAYERHQ_SEKSJONER = [
  { id: "hjem", label: "Hjem", href: "/portal" },
  { id: "plan", label: "Plan", href: "/portal/planlegge" },
  { id: "gjor", label: "Gjør", href: "/portal/gjennomfore" },
  { id: "analyse", label: "Analyse", href: "/portal/analysere" },
  { id: "meg", label: "Meg", href: "/portal/meg" },
] as const;

export type PlayerhqSeksjonId = (typeof PLAYERHQ_SEKSJONER)[number]["id"];

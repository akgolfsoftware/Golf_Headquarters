/**
 * AgencyOS AX-01-destinasjoner (J-A / J-C, T12).
 * Rail/dock leser herfra — tester kan låse href uten å importere skallet.
 */
export type SkallTab = { id: string; label: string; icon: string; href: string };

export const AGENCYOS_SKALL_TABS: SkallTab[] = [
  { id: "stall", label: "Stall", icon: "users", href: "/admin/spillere" },
  { id: "workbench", label: "Workbench", icon: "target", href: "/admin/plan" },
  { id: "ko", label: "Kø", icon: "inbox", href: "/admin/ko" },
  { id: "jarvis", label: "Jarvis", icon: "bot", href: "/admin/agenticos" },
  { id: "meg", label: "Meg", icon: "user", href: "/admin/profile" },
];

export const AGENCYOS_UNDER_MEG: { id: string; label: string; href: string; adminOnly?: boolean }[] = [
  { id: "konsoll", label: "Konsoll", href: "/admin/agencyos" },
  { id: "okonomi", label: "Økonomi", href: "/admin/agencyos/okonomi" },
  { id: "kalender", label: "Kalender", href: "/admin/kalender" },
  { id: "jarvis-innboks", label: "Personlig innboks", href: "/meg", adminOnly: true },
];

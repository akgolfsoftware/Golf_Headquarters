/**
 * AgencyOS-menyen i Precision Athletics (Anders 28.09.2026, grillingen runde 8):
 * Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Mer har Booking ·
 * Grupper · Tester · Økonomi · Oppsett. Økonomi bare for head coach (ADMIN).
 * Kilde: Claude Design 7d7c2994, ui_kits/_shared/ia.js (AK_IA.aos).
 *
 * Ren data og ren funksjon — ikonene kobles på i skallet.
 */

export type AosPunktId = "cockpit" | "innboks" | "stall" | "kalender" | "workbench" | "mer";
export type AosMerId = "booking" | "grupper" | "tester" | "okonomi" | "oppsett";

export const AOS_MENY: ReadonlyArray<{ id: AosPunktId; label: string; href: string }> = [
  { id: "cockpit", label: "Cockpit", href: "/admin/agencyos" },
  { id: "innboks", label: "Innboks", href: "/admin/innboks" },
  { id: "stall", label: "Stall", href: "/admin/spillere" },
  { id: "kalender", label: "Kalender", href: "/admin/kalender" },
  { id: "workbench", label: "Workbench", href: "/admin/planlegge" },
];

export const AOS_MER: ReadonlyArray<{ id: AosMerId; label: string; href: string; bareHeadCoach?: true }> = [
  { id: "booking", label: "Booking", href: "/admin/bookinger" },
  { id: "grupper", label: "Grupper", href: "/admin/grupper" },
  { id: "tester", label: "Tester", href: "/admin/tester" },
  { id: "okonomi", label: "Økonomi", href: "/admin/agencyos/okonomi", bareHeadCoach: true },
  { id: "oppsett", label: "Oppsett", href: "/admin/oppsett" },
];

export const AOS_HURTIG: ReadonlyArray<{ id: string; label: string; href: string }> = [
  { id: "okt", label: "Ny økt i Workbench", href: "/admin/planlegge" },
  { id: "melding", label: "Ny melding til spiller", href: "/admin/innboks" },
  { id: "runde", label: "Registrer runde", href: "/admin/runder" },
  { id: "jarvis", label: "Spør Jarvis", href: "/admin/jarvis" },
  { id: "booking", label: "Ny booking", href: "/admin/bookinger/ny" },
];

/** Adresser som hører til et menypunkt uten å ligge under punktets egen adresse. */
const PREFIKS: ReadonlyArray<[string, AosPunktId | AosMerId]> = [
  ["/admin/agencyos/okonomi", "okonomi"],
  ["/admin/agencyos", "cockpit"],
  ["/admin/innboks", "innboks"], ["/admin/ko", "innboks"], ["/admin/queue", "innboks"],
  ["/admin/godkjenninger", "innboks"], ["/admin/kommunikasjon", "innboks"], ["/admin/jarvis", "cockpit"],
  ["/admin/spillere", "stall"], ["/admin/stall", "stall"],
  ["/admin/kalender", "kalender"], ["/admin/availability", "kalender"],
  ["/admin/planlegge", "workbench"], ["/admin/workbench", "workbench"], ["/admin/coach-workbench", "workbench"],
  ["/admin/plan", "workbench"], ["/admin/plan-templates", "workbench"],
  ["/admin/bookinger", "booking"], ["/admin/services", "booking"],
  ["/admin/grupper", "grupper"],
  ["/admin/tester", "tester"],
  ["/admin/oppsett", "oppsett"], ["/admin/profile", "oppsett"], ["/admin/team", "oppsett"],
];

const under = (path: string, p: string) => path === p || path.startsWith(p + "/");

/** Menypunktet som lyser for en adresse. Mer-punkter lyser «mer» i menyen. */
export function aktivtAosPunkt(path: string): { punkt: AosPunktId | null; mer: AosMerId | null } {
  const treff = PREFIKS.filter(([p]) => under(path, p)).sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? null;
  if (!treff) return { punkt: null, mer: null };
  if (AOS_MER.some((m) => m.id === treff)) return { punkt: "mer", mer: treff as AosMerId };
  return { punkt: treff as AosPunktId, mer: null };
}

export function synligeMer(erHeadCoach: boolean) {
  return AOS_MER.filter((m) => erHeadCoach || !m.bareHeadCoach);
}

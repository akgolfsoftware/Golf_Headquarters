/**
 * AgencyOS-menyen er variant C (Anders 16.10.2026, beslutninger.md §AGENCYOS-MENYEN
 * BLIR VARIANT C): søk først og punktene i tre grupper — Daglig · Spillere · Drift.
 * Økonomi bare for head coach (ADMIN). Data Golf står i Drift når coach-siden DG-01
 * finnes under /admin (pakke 10); til da er den ikke i menyen.
 * Fasit: docs/design-system/utkast-agencyos/meny.html, variant C.
 *
 * Mer-siden (/admin/mer) virker fortsatt og bruker AOS_MER.
 * Ren data og ren funksjon — ikonene kobles på i skallet.
 */

export type AosMerId = "booking" | "grupper" | "tester" | "okonomi" | "oppsett";
export type AosId = "cockpit" | "innboks" | "kalender" | "stall" | "workbench" | AosMerId;
export type AosPunkt = { id: AosId; label: string; href: string; bareHeadCoach?: true };

export const AOS_MER: ReadonlyArray<{ id: AosMerId; label: string; href: string; bareHeadCoach?: true }> = [
  { id: "booking", label: "Booking", href: "/admin/bookinger" },
  { id: "grupper", label: "Grupper", href: "/admin/grupper" },
  { id: "tester", label: "Tester", href: "/admin/tester" },
  { id: "okonomi", label: "Økonomi", href: "/admin/agencyos/okonomi", bareHeadCoach: true },
  { id: "oppsett", label: "Oppsett", href: "/admin/oppsett" },
];

const merPunkt = (id: AosMerId): AosPunkt => AOS_MER.find((m) => m.id === id)!;

export const AOS_GRUPPER: ReadonlyArray<{ id: "daglig" | "spillere" | "drift"; label: string; punkter: ReadonlyArray<AosPunkt> }> = [
  { id: "daglig", label: "Daglig", punkter: [
    { id: "cockpit", label: "Cockpit", href: "/admin/agencyos" },
    { id: "innboks", label: "Innboks", href: "/admin/innboks" },
    { id: "kalender", label: "Kalender", href: "/admin/kalender" },
  ] },
  { id: "spillere", label: "Spillere", punkter: [
    { id: "stall", label: "Stall", href: "/admin/spillere" },
    { id: "workbench", label: "Workbench", href: "/admin/planlegge" },
    merPunkt("grupper"),
    merPunkt("tester"),
  ] },
  { id: "drift", label: "Drift", punkter: [merPunkt("booking"), merPunkt("okonomi"), merPunkt("oppsett")] },
];

/** Gruppene med punktene denne brukeren skal se (Økonomi bare for head coach). */
export function synligeGrupper(erHeadCoach: boolean) {
  return AOS_GRUPPER.map((g) => ({ ...g, punkter: g.punkter.filter((p) => erHeadCoach || !p.bareHeadCoach) }));
}

export const AOS_HURTIG: ReadonlyArray<{ id: string; label: string; href: string }> = [
  { id: "okt", label: "Ny økt i Workbench", href: "/admin/planlegge" },
  { id: "melding", label: "Ny melding til spiller", href: "/admin/innboks" },
  { id: "runde", label: "Registrer runde", href: "/admin/runder" },
  { id: "jarvis", label: "Spør Jarvis", href: "/admin/jarvis" },
  { id: "booking", label: "Ny booking", href: "/admin/bookinger/ny" },
];

/** Adresser som hører til et menypunkt uten å ligge under punktets egen adresse. */
const PREFIKS: ReadonlyArray<[string, AosId]> = [
  ["/admin/agencyos/okonomi", "okonomi"],
  ["/admin/agencyos", "cockpit"],
  ["/admin/innboks", "innboks"], ["/admin/ko", "innboks"], ["/admin/queue", "innboks"],
  ["/admin/godkjenninger", "innboks"], ["/admin/kommunikasjon", "innboks"], ["/admin/jarvis", "cockpit"],
  ["/admin/spillere", "stall"], ["/admin/stall", "stall"],
  ["/admin/kalender", "kalender"], ["/admin/availability", "kalender"],
  ["/admin/planlegge", "workbench"], ["/admin/workbench", "workbench"], ["/admin/coach-workbench", "workbench"],
  ["/admin/plan", "workbench"], ["/admin/plan-templates", "workbench"], ["/admin/ovelser", "workbench"],
  ["/admin/bookinger", "booking"], ["/admin/services", "booking"],
  ["/admin/grupper", "grupper"],
  ["/admin/tester", "tester"],
  ["/admin/oppsett", "oppsett"], ["/admin/profile", "oppsett"], ["/admin/team", "oppsett"],
];

const under = (path: string, p: string) => path === p || path.startsWith(p + "/");

/** Menypunktet som lyser for en adresse, eller null (for eksempel /admin/mer). */
export function aktivtAosId(path: string): AosId | null {
  return PREFIKS.filter(([p]) => under(path, p)).sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? null;
}

export function synligeMer(erHeadCoach: boolean) {
  return AOS_MER.filter((m) => erHeadCoach || !m.bareHeadCoach);
}

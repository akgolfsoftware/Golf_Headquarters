// Capability-Based Access Control (CBAC).
// Roller mappes til capabilities i kode; fremtidige tabeller kan overstyre.

import type { UserRole } from "@/generated/prisma/client";

export const Capability = {
  VIEW_OWN_PROFILE: "view_own_profile",
  EDIT_OWN_PROFILE: "edit_own_profile",
  VIEW_OWN_BOOKINGS: "view_own_bookings",
  CREATE_BOOKING: "create_booking",
  VIEW_CHILDREN: "view_children",
  VIEW_ALL_PLAYERS: "view_all_players",
  EDIT_PLAYER_PLAN: "edit_player_plan",
  VIEW_FINANCE: "view_finance",
  MANAGE_FACILITIES: "manage_facilities",
  MANAGE_USERS: "manage_users",
  // G6 (2026-08-16): per-trener capability-styring. Rolle-default under kan
  // overstyres per bruker via user_capabilities (GRANT/REVOKE) — se
  // effective-capabilities.ts. ADMIN er immun mot overrides.
  VIEW_GROUP_PLANS: "view_group_plans",
  EDIT_GROUP_PLANS: "edit_group_plans",
  MANAGE_GROUPS: "manage_groups",
  VIEW_PLAYER_DATA: "view_player_data",
  MANAGE_TESTS: "manage_tests",
  MANAGE_BOOKINGS: "manage_bookings",
  USE_AGENTS: "use_agents",
  INVITE_USERS: "invite_users",
  VIEW_REPORTS: "view_reports",
  // T8 (2026-08-16): ekstern lesetilgang (Team Norway/WANG). INGEN rolle-default
  // får disse — de grantes eksplisitt per bruker (GUEST + GRANT-override) av
  // opprettEksternLeser. Dataporten er src/lib/auth/ekstern-leser-scope.ts:
  // capability åpner /innsyn-flaten, samtykke (DelingsSamtykke) åpner dataene.
  VIEW_SHARED_TEST_RESULTS: "view_shared_test_results",
  VIEW_SHARED_STATS: "view_shared_stats",
  // KOMPLETT_PROFIL (TN-12, Claw batch 3, 01.09.2026) — den andre av de «to
  // bryterne» i §FORRETNINGSMODELL: SPILLERLISENSER. Kun capabilityen —
  // selve dataleveransen (treningsplan/TrackMan/analyse til /innsyn) er ikke
  // bygget ennå, dette er samtykke- og tilgangsgrunnlaget for den.
  VIEW_SHARED_FULL_PROFILE: "view_shared_full_profile",
} as const;

export type Capability = (typeof Capability)[keyof typeof Capability];

/**
 * Norske beskrivelser for admin-UI (/admin/settings/tilgang + inviter-flaten).
 * Én linje per capability — hold dem korte nok for en tabellcelle.
 */
export const CAPABILITY_BESKRIVELSER: Record<Capability, string> = {
  [Capability.VIEW_OWN_PROFILE]: "Se egen profil",
  [Capability.EDIT_OWN_PROFILE]: "Endre egen profil",
  [Capability.VIEW_OWN_BOOKINGS]: "Se egne bookinger",
  [Capability.CREATE_BOOKING]: "Opprette booking",
  [Capability.VIEW_CHILDREN]: "Se egne barn (forelder)",
  [Capability.VIEW_ALL_PLAYERS]: "Se alle spillere",
  [Capability.EDIT_PLAYER_PLAN]: "Endre spiller-plan",
  [Capability.VIEW_FINANCE]: "Se økonomidata",
  [Capability.MANAGE_FACILITIES]: "Administrere fasiliteter",
  [Capability.MANAGE_USERS]: "Administrere brukere",
  [Capability.VIEW_GROUP_PLANS]: "Se gruppeplaner",
  [Capability.EDIT_GROUP_PLANS]: "Endre gruppeårsplan og utrulling",
  [Capability.MANAGE_GROUPS]: "Opprette og endre grupper og medlemmer",
  [Capability.VIEW_PLAYER_DATA]: "Se spillerdata (stats, runder, TrackMan)",
  [Capability.MANAGE_TESTS]: "Opprette og tildele tester",
  [Capability.MANAGE_BOOKINGS]: "Administrere bookinger (admin)",
  [Capability.USE_AGENTS]: "Bruke AI-agenter (AgenticOS, Caddie)",
  [Capability.INVITE_USERS]: "Invitere nye brukere",
  [Capability.VIEW_REPORTS]: "Se rapporter",
  [Capability.VIEW_SHARED_TEST_RESULTS]: "Se delte testresultater (ekstern leser)",
  [Capability.VIEW_SHARED_STATS]: "Se delt statistikk (ekstern leser)",
  [Capability.VIEW_SHARED_FULL_PROFILE]: "Se delt komplett profil (ekstern leser)",
};

export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  PLAYER: [
    Capability.VIEW_OWN_PROFILE,
    Capability.EDIT_OWN_PROFILE,
    Capability.VIEW_OWN_BOOKINGS,
    Capability.CREATE_BOOKING,
  ],
  PARENT: [
    Capability.VIEW_OWN_PROFILE,
    Capability.EDIT_OWN_PROFILE,
    Capability.VIEW_CHILDREN,
    Capability.VIEW_OWN_BOOKINGS,
    Capability.CREATE_BOOKING,
  ],
  // COACH-defaulten dekker det trenere gjør i dag (grupper, planer, tester,
  // spillerdata, booking) slik at ingen eksisterende coach mister funksjonalitet
  // ved deploy. VIEW_FINANCE / MANAGE_USERS / MANAGE_FACILITIES / USE_AGENTS /
  // INVITE_USERS er bevisst utenfor — de grantes per trener av Anders.
  COACH: [
    Capability.VIEW_OWN_PROFILE,
    Capability.EDIT_OWN_PROFILE,
    Capability.VIEW_ALL_PLAYERS,
    Capability.EDIT_PLAYER_PLAN,
    Capability.VIEW_OWN_BOOKINGS,
    Capability.CREATE_BOOKING,
    Capability.VIEW_GROUP_PLANS,
    Capability.EDIT_GROUP_PLANS,
    Capability.MANAGE_GROUPS,
    Capability.VIEW_PLAYER_DATA,
    Capability.MANAGE_TESTS,
    Capability.MANAGE_BOOKINGS,
    Capability.VIEW_REPORTS,
  ],
  ADMIN: Object.values(Capability),
  GUEST: [
    // Read-only — kan se egen profil + fasilitet/booking-oversikt.
    // Fasilitet/booking-tilgang håndheves via allow-lister på relevante
    // admin-pages (calendar/facilities/bookings).
    Capability.VIEW_OWN_PROFILE,
  ],
};

export function can(role: UserRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function hasRole(
  role: UserRole,
  allowed: UserRole | UserRole[]
): boolean {
  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
}

/**
 * Dual-role: COACH/ADMIN med egen spillerprofil bruker PlayerHQ som spiller.
 * Når allow-listen inkluderer PLAYER, skal coach/admin ikke kastes til /admin.
 */
export function canAccessPortalRoute(
  role: UserRole,
  allowed: UserRole | UserRole[],
): boolean {
  if (hasRole(role, allowed)) return true;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return (
    roles.includes("PLAYER") &&
    (role === "COACH" || role === "ADMIN")
  );
}

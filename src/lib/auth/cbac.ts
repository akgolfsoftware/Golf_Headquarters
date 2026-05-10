// Capability-Based Access Control (CBAC).
// Roller mappes til capabilities i kode; fremtidige tabeller kan overstyre.

import { UserRole } from "@/generated/prisma/client";

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
} as const;

export type Capability = (typeof Capability)[keyof typeof Capability];

const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
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
  COACH: [
    Capability.VIEW_OWN_PROFILE,
    Capability.EDIT_OWN_PROFILE,
    Capability.VIEW_ALL_PLAYERS,
    Capability.EDIT_PLAYER_PLAN,
    Capability.VIEW_OWN_BOOKINGS,
    Capability.CREATE_BOOKING,
  ],
  ADMIN: Object.values(Capability),
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

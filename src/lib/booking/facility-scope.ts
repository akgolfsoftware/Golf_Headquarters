/**
 * Multi-coach + multi-facility scope helpers for AgencyOS booking/calendar.
 * Pure functions — no Prisma. Used by kalender filters and ny-booking wizard.
 */

export type FacilityOption = {
  id: string;
  name: string;
  /** Optional short code for chips */
  code?: string | null;
};

export type CoachOption = {
  id: string;
  name: string;
  facilityIds: string[];
};

/**
 * Coaches available at a facility (empty facilityId = all coaches).
 */
export function coachesForFacility(
  coaches: CoachOption[],
  facilityId: string | null | undefined,
): CoachOption[] {
  if (!facilityId) return coaches;
  return coaches.filter(
    (c) => c.facilityIds.length === 0 || c.facilityIds.includes(facilityId),
  );
}

/**
 * Facilities a coach can work at (empty list = all / unscoped).
 */
export function facilitiesForCoach(
  facilities: FacilityOption[],
  coach: CoachOption | null | undefined,
): FacilityOption[] {
  if (!coach || coach.facilityIds.length === 0) return facilities;
  const set = new Set(coach.facilityIds);
  return facilities.filter((f) => set.has(f.id));
}

/**
 * Validate coach+facility pair for quick-book.
 */
export function isValidCoachFacilityPair(
  coach: CoachOption | null | undefined,
  facilityId: string | null | undefined,
): boolean {
  if (!coach) return false;
  if (!facilityId) return true;
  if (coach.facilityIds.length === 0) return true;
  return coach.facilityIds.includes(facilityId);
}

export function facilityChipLabel(f: FacilityOption): string {
  return f.code?.trim() || f.name;
}

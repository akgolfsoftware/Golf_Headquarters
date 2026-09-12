/** Melding fra spiller går bare til coachen hen faktisk er tildelt. Ingen Prisma. */

export function kanSendeCoachMelding(input: {
  viewerRole: string;
  requestedCoachId: string;
  enrolledCoachId: string | null;
  mottakerRolle: string | null;
}): boolean {
  if (input.viewerRole !== "PLAYER") return false;
  if (!input.enrolledCoachId || !input.requestedCoachId) return false;
  if (input.enrolledCoachId !== input.requestedCoachId) return false;
  return input.mottakerRolle === "COACH";
}

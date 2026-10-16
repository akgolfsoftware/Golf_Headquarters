/** Tilgang til å godkjenne eller avvise et PlanAction-forslag. Ingen Prisma. */

export function kanBehandlePlanAction(input: {
  viewerId: string;
  viewerRole: string;
  actionUserId: string;
  actionCoachId: string | null;
  harSpillerTilgang: boolean;
}): boolean {
  if (input.actionUserId === input.viewerId) return true;
  // Head coach (ADMIN) ser alle coachede spillere, men ikke selvbetjente: tilgang avgjøres av stallen.
  if (input.viewerRole === "ADMIN") return input.harSpillerTilgang;
  if (input.viewerRole !== "COACH") return false;
  if (input.actionCoachId && input.actionCoachId !== input.viewerId) return false;
  return input.harSpillerTilgang;
}

/** Tilgang til å godkjenne eller avvise et PlanAction-forslag. Ingen Prisma. */

export function kanBehandlePlanAction(input: {
  viewerId: string;
  viewerRole: string;
  actionUserId: string;
  actionCoachId: string | null;
  harSpillerTilgang: boolean;
}): boolean {
  if (input.actionUserId === input.viewerId) return true;
  if (input.viewerRole === "ADMIN") return true;
  if (input.viewerRole !== "COACH") return false;
  if (input.actionCoachId && input.actionCoachId !== input.viewerId) return false;
  return input.harSpillerTilgang;
}

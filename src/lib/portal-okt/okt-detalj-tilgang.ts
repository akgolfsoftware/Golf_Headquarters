/** Tilgang til V2-øktarket. Ingen Prisma — kan testes uten database. */

const SYNLIG_DELTAKER = new Set(["ACCEPTED", "ATTENDED"]);

export function kanSeOktDetalj(input: {
  viewerId: string;
  studentId: string | null;
  coachId: string | null;
  hostId: string | null;
  participants: ReadonlyArray<{ userId: string; status: string }>;
  hasPlayerAccess: boolean;
}): boolean {
  if (input.studentId === input.viewerId) return true;
  if (input.coachId === input.viewerId) return true;
  if (input.hostId === input.viewerId) return true;
  if (input.participants.some((p) => p.userId === input.viewerId && SYNLIG_DELTAKER.has(p.status))) {
    return true;
  }
  return Boolean(input.studentId && input.hasPlayerAccess);
}

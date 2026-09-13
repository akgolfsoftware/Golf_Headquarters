import { Prisma } from "@/generated/prisma/client";

type CoachMessage = { content: string; ts: string; sentById: string };
type CoachBrief = { melding: string; sentAt: string; sentById: string };

export type CoachLiveChange =
  | { kind: "message"; value: CoachMessage }
  | { kind: "brief"; value: CoachBrief }
  | { kind: "rating"; rating: number; at: string; note?: string };

/**
 * Kalles etter serverens rolle- og inputkontroll. Samme coachgrense sjekkes
 * i selve skrivingen. JSON-felter flettes og meldinger legges til i én UPDATE,
 * uten at en tidligere lest kopi kan overskrive samtidige endringer.
 * Samme JSONB-prinsipp som portal-live/summary-field.ts.
 */
export function coachLiveSummaryUpdate(
  sessionId: string,
  actorId: string,
  isAdmin: boolean,
  change: CoachLiveChange,
) {
  const base = Prisma.sql`(CASE WHEN jsonb_typeof("completedSummary") = 'object'
    THEN "completedSummary" ELSE '{}'::jsonb END)`;
  const summary = change.kind === "message"
    ? Prisma.sql`${base} || jsonb_build_object('coachMessages',
        (CASE WHEN jsonb_typeof("completedSummary" -> 'coachMessages') = 'array'
          THEN "completedSummary" -> 'coachMessages' ELSE '[]'::jsonb END)
        || ${JSON.stringify([change.value])}::jsonb)`
    : Prisma.sql`${base} || ${JSON.stringify(change.kind === "brief"
        ? { coachBrief: change.value }
        : { coachRating: change.rating, coachRatedAt: change.at, coachRatedById: actorId })}::jsonb`;
  // Et tomt vurderingsnotat skal fortsatt bevare eksisterende notes.
  const notes = change.kind === "rating" && change.note
    ? Prisma.sql`, "notes" = ${change.note}`
    : Prisma.empty;
  const owner = isAdmin ? Prisma.empty : Prisma.sql`AND "coachId" = ${actorId}`;

  return Prisma.sql`
    UPDATE "training_sessions_v2"
    SET "completedSummary" = ${summary}, "updatedAt" = NOW() ${notes}
    WHERE "id" = ${sessionId} ${owner}
  `;
}

import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";

const Id = z.string().min(1).max(200);
export const GroupPublicationExpectedSchema = z.object({
  sources: z.array(z.object({ id: Id, hash: z.string().regex(/^[a-f0-9]{64}$/) }).strict()).min(1).max(100),
  members: z.array(z.object({ userId: Id, joinedAt: z.iso.datetime() }).strict()).max(1000),
  schedules: z.array(z.object({ id: Id, startAt: z.iso.datetime(), endAt: z.iso.datetime(), recurring: z.string().nullable(), kind: z.string().nullable(), updatedAt: z.iso.datetime() }).strict()).max(1000),
}).strict();
export type GroupPublicationExpected = z.infer<typeof GroupPublicationExpectedSchema>;

/** Samme fullstendige kildegrunnlag før bekreftelse og inne i publiseringstransaksjonen. */
export function groupPublicationSnapshot(
  sources: readonly { id: string; drills: readonly { id: string }[] }[],
  members: readonly { userId: string; joinedAt: Date }[],
  schedules: readonly { id: string; startAt: Date; endAt: Date; recurring: string | null; kind: string | null; updatedAt: Date }[],
): GroupPublicationExpected {
  return {
    sources: sources.map(s => ({ id: s.id, hash: createHash("sha256").update(JSON.stringify({ ...s, drills: [...s.drills].sort((a,b) => a.id.localeCompare(b.id)) })).digest("hex") })).sort((a,b) => a.id.localeCompare(b.id)),
    members: members.map(m => ({ userId: m.userId, joinedAt: m.joinedAt.toISOString() })).sort((a,b) => a.userId.localeCompare(b.userId)),
    schedules: schedules.map(s => ({ id: s.id, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString(), recurring: s.recurring, kind: s.kind, updatedAt: s.updatedAt.toISOString() })).sort((a,b) => a.id.localeCompare(b.id)),
  };
}

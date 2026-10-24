import "server-only";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";
import { dato } from "./spiller360-visning";
import type { S360Samtaler } from "./spiller360-typer";

/** Profildeling gir ikke rett til meldinger, private notater eller opptak.
 * Fanen krever i tillegg konkret mottaker/forfatter/opplaster, også for ADMIN.
 * AI/LIVE kan ha en teknisk coachId: den er ikke bevis på deltakelse.
 * Spillerens private Caddie og egne opptak leses aldri gjennom denne porten. */
export async function lastSpiller360Samtaler(viewer: { id: string; role: string }, id: string): Promise<S360Samtaler | null> {
  return medAkProfiler(viewer, async (tx, scope) => {
    const spiller = await tx.user.findFirst({ where: { AND: [scope, { id }] }, select: { id: true } });
    if (!spiller) return null;
    const [traader, notat, videoer] = await Promise.all([
      // Bare antall fra JSON, aldri meldingsinnhold til server-/klientpayloaden.
      tx.$queryRaw<Array<{ id: string; antall: number; updatedAt: Date }>>`
        SELECT id, CASE WHEN jsonb_typeof(messages) = 'array'
          THEN jsonb_array_length(messages) ELSE 0 END AS antall, "updatedAt"
        FROM coaching_sessions
        WHERE "userId" = ${id} AND "coachId" = ${viewer.id} AND kind = 'DIRECT'
        ORDER BY "updatedAt" DESC, id ASC LIMIT 12`,
      tx.coachNote.findFirst({ where: { playerId: id, coachId: viewer.id },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        select: { content: true, updatedAt: true, coach: { select: { name: true } } } }),
      tx.sessionVideo.findMany({ where: { playerId: id, coachId: viewer.id, status: "READY" },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 3,
        select: { id: true, title: true, createdAt: true } }),
    ]);
    return {
      traader: traader.map(t => ({ id: t.id, type: "Meldinger", antall: t.antall, sist: dato(t.updatedAt) })),
      notat: notat ? { tekst: notat.content, coach: notat.coach.name ?? "—", dato: dato(notat.updatedAt) } : null,
      videoer: videoer.map(v => ({ id: v.id, tittel: v.title, dato: dato(v.createdAt), kilde: "Coach" })),
    };
  });
}

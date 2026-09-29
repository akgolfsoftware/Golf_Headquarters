/**
 * Innboks › Spillere — åpne spørsmål fra spillere (Question, status OPEN).
 *
 * Samme tilgangsregel som coachens spørsmålsliste (/portal/coach/sporsmal):
 * sporsmalListeFilter med coachens egne spillere. Svaret sendes med den
 * eksisterende handlingen svarPaSporsmal, som sjekker tilgangen på nytt.
 * Spørsmål ubesvart i over 24 timer haster (beslutninger.md §Åpne punkter
 * etter runde 19–26).
 */
import "server-only";

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { sporsmalListeFilter } from "@/lib/portal-okt/coach-sporsmal-tilgang";
import { prisma } from "@/lib/prisma";

export type SporsmalVm = {
  id: string;
  spillerId: string;
  spiller: string;
  tittel: string;
  tekst: string;
  opprettetIso: string;
};

export async function lastApneSporsmal(user: { id: string; role: string }): Promise<SporsmalVm[]> {
  const egneSpillere =
    user.role === "ADMIN"
      ? []
      : await prisma.user.findMany({ where: coachScopedPlayerWhere(user), select: { id: true } });
  const rader = await prisma.question.findMany({
    where: {
      AND: [
        sporsmalListeFilter({
          viewerId: user.id,
          viewerRole: user.role,
          coachedPlayerIds: egneSpillere.map((s) => s.id),
        }),
        { status: "OPEN" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, askerUserId: true, title: true, body: true, createdAt: true },
  });
  const navn = new Map(
    (
      await prisma.user.findMany({
        where: { id: { in: [...new Set(rader.map((r) => r.askerUserId))] } },
        select: { id: true, name: true },
      })
    ).map((u) => [u.id, u.name ?? "Spiller"] as const),
  );
  return rader.map((r) => ({
    id: r.id,
    spillerId: r.askerUserId,
    spiller: navn.get(r.askerUserId) ?? "Spiller",
    tittel: r.title,
    tekst: r.body,
    opprettetIso: r.createdAt.toISOString(),
  }));
}

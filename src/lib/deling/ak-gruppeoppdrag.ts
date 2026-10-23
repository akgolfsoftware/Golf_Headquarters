import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { akProfilGruppeWhere, medAkProfiler, type AkProfilGrunnlag } from "./ak-profil-lesing";

export type AkGruppeoppdrag = { gruppeId: string; coachId: string };

/** Bare oppdragsruting, ingen spillerprofiler eller varig tilgangsliste. */
export async function hentAkGruppeoppdrag(): Promise<AkGruppeoppdrag[]> {
  const grupper = await prisma.group.findMany({ where: { ...akProfilGruppeWhere(),
    coach: { is: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null } },
  }, select: { id: true, coachId: true }, orderBy: { id: "asc" } });
  return grupper.flatMap(g => g.coachId ? [{ gruppeId: g.id, coachId: g.coachId }] : []);
}

/** Oppdraget får bare gruppens ansvarlige trener, med fersk deling under lås. */
export async function medAkGruppeoppdrag<T>(oppdrag: AkGruppeoppdrag,
  jobb: (tx: Prisma.TransactionClient, scope: Prisma.UserWhereInput, grunnlag: readonly AkProfilGrunnlag[]) => Promise<T>,
  medGrunnlag = false,
): Promise<T | null> {
  if (typeof oppdrag.coachId !== "string" || !oppdrag.coachId.trim() ||
      typeof oppdrag.gruppeId !== "string" || !oppdrag.gruppeId.trim()) return null;
  const aktor = await prisma.user.findFirst({ where: { id: oppdrag.coachId, deletedAt: null,
    role: { in: ["ADMIN", "COACH"] } }, select: { id: true, role: true } });
  if (!aktor) return null;
  return medAkProfiler(aktor, async (tx, scope, grunnlag) => {
    // Eierskifte etter ruting må ikke sende data til forrige trener. Gruppe og
    // aktør er allerede låst; ADMIN kan heller ikke bruke andre gruppers ja.
    const gruppe = await tx.group.findFirst({ where: { ...akProfilGruppeWhere(),
      id: oppdrag.gruppeId, coachId: aktor.id }, select: { id: true } });
    if (!gruppe) return null;
    return jobb(tx, scope, grunnlag);
  }, "handling", { gruppeId: oppdrag.gruppeId, medGrunnlag });
}

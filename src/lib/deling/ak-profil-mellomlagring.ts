import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { medAkGruppeoppdrag, type AkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "./ak-profil-regler";

const id = z.string().min(1).max(200).refine(value => value === value.trim());
const bevisSchema = z.object({
  versjon: z.literal(1), scope: z.literal(AK_PROFIL_SCOPE), tekstVersjon: z.literal(AK_PROFIL_VERSJON),
  spillerId: id, gruppeId: id, coachId: id, fingeravtrykk: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type AkProfilBevis = z.infer<typeof bevisSchema>;
type Tx = Prisma.TransactionClient;

/**
 * Collect an explicitly scoped value plus server-only equality evidence under the
 * existing sharing locks. Callback must only use tx; no network calls under locks.
 * Caller owns purpose validation and must minimize any subsequent model input.
 * This helper does not authorize a new background/learning purpose. It proves
 * access continuity only, not unchanged training data, plan version or content.
 */
export async function hentMedAkProfilBevis<T>(oppdrag: AkGruppeoppdrag, spillerId: unknown,
  hent: (tx: Tx, spillerWhere: Prisma.UserWhereInput) => Promise<T>,
): Promise<{ bevis: AkProfilBevis; verdi: T } | null> {
  const spiller = id.safeParse(spillerId);
  if (!spiller.success) return null;
  return medAkGruppeoppdrag(oppdrag, async (tx, scope, grunnlag) => {
    const treff = grunnlag.filter(g => g.spillerId === spiller.data && g.gruppeId === oppdrag.gruppeId);
    if (treff.length !== 1) return null;
    const where: Prisma.UserWhereInput = { AND: [scope, { id: spiller.data }] };
    if (!await tx.user.findFirst({ where, select: { id: true } })) return null;
    const bevis: AkProfilBevis = { versjon: 1, scope: AK_PROFIL_SCOPE, tekstVersjon: AK_PROFIL_VERSJON,
      spillerId: spiller.data, gruppeId: oppdrag.gruppeId, coachId: oppdrag.coachId, fingeravtrykk: treff[0].fingeravtrykk };
    return { bevis, verdi: await hent(tx, where) };
  }, true);
}

/**
 * Expected evidence must come from trusted server storage, never a client's new
 * "current" proof. Evidence alone confers no access: every lock, current role,
 * owner, membership and consent check is repeated. Comparison AND mutation occur
 * within that same transaction. No network call or nested/global transaction here.
 */
export async function brukMedSammeAkProfilBevis<T>(oppdrag: AkGruppeoppdrag, spillerId: unknown,
  lagretBevis: unknown, bruk: (tx: Tx, spillerWhere: Prisma.UserWhereInput) => Promise<T>,
): Promise<{ verdi: T } | null> {
  const spiller = id.safeParse(spillerId);
  const forventet = bevisSchema.safeParse(lagretBevis);
  if (!spiller.success || !forventet.success || forventet.data.spillerId !== spiller.data ||
    forventet.data.gruppeId !== oppdrag.gruppeId || forventet.data.coachId !== oppdrag.coachId) return null;
  return medAkGruppeoppdrag(oppdrag, async (tx, scope, grunnlag) => {
    const treff = grunnlag.filter(g => g.spillerId === spiller.data && g.gruppeId === oppdrag.gruppeId);
    if (treff.length !== 1 || treff[0].fingeravtrykk !== forventet.data.fingeravtrykk) return null;
    const where: Prisma.UserWhereInput = { AND: [scope, { id: spiller.data }] };
    if (!await tx.user.findFirst({ where, select: { id: true } })) return null;
    return { verdi: await bruk(tx, where) };
  }, true);
}

import "server-only";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { krevNavngittTrener, navngittTrenerHarTilgang } from "./navngitt";

const Valg = z.object({
  etterSpiller: z.string().min(1).max(120).optional(),
  etterGruppe: z.string().min(1).max(120).optional(),
}).strict().refine((p) => Boolean(p.etterSpiller) === Boolean(p.etterGruppe));

/** Navngitte, fortsatt gyldige delinger. Medlemskap eller gammel gruppedeling er ikke nok. */
export async function hentTrenerensDelteSpillere(input: unknown = {}) {
  const trener = await krevNavngittTrener();
  const parsed = Valg.safeParse(input);
  if (!parsed.success) return null;
  const p = parsed.data;
  return prisma.$transaction(async (tx) => {
    // DISTINCT i databasen før LIMIT: flere invitasjoner til samme spiller/miljø
    // skal verken lage duplikater eller fylle opp en listeside. Kun ID-er hentes
    // før den gjeldende delingen er kontrollert under samme spillerlås som tilbakekall.
    const kandidater = await tx.$queryRaw<{ userId: string; mottakerGruppeId: string }[]>(Prisma.sql`
      SELECT DISTINCT "userId", "mottakerGruppeId"
      FROM public.trener_delings_invitasjoner
      WHERE "acceptedByUserId" = ${trener.id} AND "mottakerEpost" = ${trener.epost}
        AND "acceptedAt" IS NOT NULL AND "revokedAt" IS NULL
        ${p.etterSpiller && p.etterGruppe ? Prisma.sql`AND ("userId", "mottakerGruppeId") > (${p.etterSpiller}, ${p.etterGruppe})` : Prisma.empty}
      ORDER BY "userId", "mottakerGruppeId" LIMIT 21
    `);
    const side = kandidater.slice(0, 20);
    const spillere: { id: string; navn: string; gruppeId: string; gruppeNavn: string }[] = [];
    // Stabil låserekkefølge også når samme trener har flere samtidige lister.
    for (const rad of side) {
      if (!(await navngittTrenerHarTilgang(tx, trener, rad.userId, rad.mottakerGruppeId))) continue;
      const [spiller, gruppe] = await Promise.all([
        tx.user.findUniqueOrThrow({ where: { id: rad.userId }, select: { name: true } }),
        tx.group.findUniqueOrThrow({ where: { id: rad.mottakerGruppeId }, select: { name: true } }),
      ]);
      spillere.push({ id: rad.userId, navn: spiller.name, gruppeId: rad.mottakerGruppeId, gruppeNavn: gruppe.name });
    }
    const siste = side.at(-1);
    return { spillere, nesteSide: kandidater.length > 20 && siste ? { etterSpiller: siste.userId, etterGruppe: siste.mottakerGruppeId } : null };
  }, { timeout: 15_000 });
}

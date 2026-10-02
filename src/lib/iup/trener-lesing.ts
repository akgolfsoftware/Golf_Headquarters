import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { krevNavngittTrener, navngittTrenerHarTilgang } from "@/lib/deling/navngitt";
import { lesIupLagring } from "./lagringskontrakt";

const Lesing = z.object({
  spillerId: z.string().min(1).max(120), gruppeId: z.string().min(1).max(120),
  besvarelseId: z.string().min(1).max(120), forRevisjon: z.number().int().positive().optional(),
}).strict();

/** Samme spillereide kilde i begge trenerflater. Utkast forlater aldri eierens skjerm. */
export async function hentTrenerIup(input: unknown) {
  const trener = await krevNavngittTrener();
  const parsed = Lesing.safeParse(input);
  if (!parsed.success) return null;
  const p = parsed.data;
  return prisma.$transaction(async (tx) => {
    if (!(await navngittTrenerHarTilgang(tx, trener, p.spillerId, p.gruppeId))) return null;
    const hode = await tx.iupBesvarelse.findFirst({ where: {
      id: p.besvarelseId, userId: p.spillerId, user: { deletedAt: null, anonymisertAt: null }, levertRevisjon: { not: null },
    }, include: { revisjoner: {
      where: { status: "LEVERT", ...(p.forRevisjon ? { revisjon: { lt: p.forRevisjon } } : {}) },
      orderBy: { revisjon: "desc" }, take: 21,
    } } });
    if (!hode) return null;
    const periodeStart = hode.periodeStart.toISOString().slice(0, 10);
    const periodeSlutt = hode.periodeSlutt.toISOString().slice(0, 10);
    const side = hode.revisjoner.slice(0, 20);
    return {
      id: hode.id, type: hode.type, versjon: hode.versjon, niva: hode.niva, periodeStart, periodeSlutt,
      levertRevisjon: hode.levertRevisjon,
      nesteRevisjon: hode.revisjoner.length > 20 ? side.at(-1)!.revisjon : null,
      revisjoner: side.map((rad) => {
        const lest = lesIupLagring({ type: hode.type, periodeStart, periodeSlutt, forventetRevisjon: rad.revisjon - 1, requestId: rad.requestId, besvarelse: rad.payload });
        const gyldig = lest.ok && lest.data.besvarelse.status === "LEVERT" && lest.data.kildeSha256 === hode.kildeSha256
          && lest.data.requestHash === rad.requestHash && lest.data.besvarelse.versjon === hode.versjon && lest.data.niva === hode.niva;
        return { revisjon: rad.revisjon, createdAt: rad.createdAt.toISOString(), innhold: gyldig && lest.ok ? lest.data.besvarelse : null, kildeEllerFormatAvviker: !gyldig };
      }),
    };
  });
}

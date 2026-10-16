import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { krevNavngittTrener, navngittTrenerHarTilgang } from "@/lib/deling/navngitt";
import { lesIupLagring } from "./lagringskontrakt";

const Lesing = z.object({
  spillerId: z.string().min(1).max(120), gruppeId: z.string().min(1).max(120),
  besvarelseId: z.string().min(1).max(120), forRevisjon: z.number().int().positive().optional(),
}).strict();

const Oversikt = z.object({
  spillerId: z.string().min(1).max(120), gruppeId: z.string().min(1).max(120),
  forDato: z.iso.date().optional(), forId: z.string().min(1).max(120).optional(),
}).strict().refine((p) => Boolean(p.forDato) === Boolean(p.forId));

/** Bare leverte perioder. Utkastets dato, innhold og revisjonsnummer deles ikke. */
export async function hentTrenerIupOversikt(input: unknown) {
  const trener = await krevNavngittTrener();
  const parsed = Oversikt.safeParse(input);
  if (!parsed.success) return null;
  const p = parsed.data;
  return prisma.$transaction(async (tx) => {
    if (!(await navngittTrenerHarTilgang(tx, trener, p.spillerId, p.gruppeId))) return null;
    const spiller = await tx.user.findUniqueOrThrow({ where: { id: p.spillerId }, select: { id: true, name: true } });
    const rader = await tx.iupBesvarelse.findMany({ where: {
      userId: spiller.id, levertRevisjon: { not: null }, ...(p.forDato && p.forId ? { OR: [
        { periodeStart: { lt: new Date(`${p.forDato}T00:00:00Z`) } },
        { periodeStart: new Date(`${p.forDato}T00:00:00Z`), id: { lt: p.forId } },
      ] } : {}),
    }, select: { id: true, type: true, versjon: true, niva: true, periodeStart: true, periodeSlutt: true, levertRevisjon: true,
      revisjoner: { where: { status: "LEVERT" }, orderBy: { revisjon: "desc" }, take: 1, select: { createdAt: true } },
    }, orderBy: [{ periodeStart: "desc" }, { id: "desc" }], take: 21 });
    const side = rader.slice(0, 20), siste = side.at(-1);
    return { spiller,
      nesteSide: rader.length > 20 && siste ? { forDato: siste.periodeStart.toISOString().slice(0, 10), forId: siste.id } : null,
      besvarelser: side.map((r) => ({ id: r.id, type: r.type, versjon: r.versjon, niva: r.niva,
        periodeStart: r.periodeStart.toISOString().slice(0, 10), periodeSlutt: r.periodeSlutt.toISOString().slice(0, 10),
        levertRevisjon: r.levertRevisjon, levert: r.revisjoner[0]?.createdAt.toISOString() ?? null,
      })),
    };
  });
}

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

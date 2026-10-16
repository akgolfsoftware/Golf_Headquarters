import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { aktivIupTilknytningWhere, iupSynligForSpillerWhere } from "./tilknytning";
import { IupValgSchema } from "./valg";

/** Gjenoppta samme skjematype/kilde/nivå/periode også om den er utenfor første side. */
export async function finnEgenIup(input: unknown) {
  const bruker = await requireSpillerActionUser();
  const parsed = IupValgSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  const v = parsed.data;
  const rad = await prisma.iupBesvarelse.findFirst({
    where: { userId: bruker.id, user: { deletedAt: null, anonymisertAt: null },
      type: v.type, versjon: v.versjon, niva: v.niva,
      periodeStart: new Date(`${v.periodeStart}T00:00:00.000Z`), periodeSlutt: new Date(`${v.periodeSlutt}T00:00:00.000Z`),
    }, select: { id: true },
  });
  return { ok: true as const, id: rad?.id ?? null };
}

const Side = z.object({
  forDato: z.iso.datetime().optional(),
  forId: z.string().min(1).max(120).optional(),
}).strict().refine((p) => Boolean(p.forDato) === Boolean(p.forId));

/** Kun eierens metadata, og bare ved aktivt WANG-/TN-medlemskap (04.10.2026). Eksport går egen vei. */
export async function hentEgenIupOversikt(input: unknown = {}) {
  const bruker = await requireSpillerActionUser();
  const parsed = Side.safeParse(input);
  if (!parsed.success) return null;
  const { forDato, forId } = parsed.data;
  const eier = { deletedAt: null, anonymisertAt: null };
  const [medlemskap, rader] = await Promise.all([
    prisma.groupMember.findFirst({ where: { userId: bruker.id, user: eier, ...aktivIupTilknytningWhere() }, select: { id: true } }),
    prisma.iupBesvarelse.findMany({
      where: { userId: bruker.id, user: eier, ...(forDato && forId ? { OR: [
        { updatedAt: { lt: new Date(forDato) } },
        { updatedAt: new Date(forDato), id: { lt: forId } },
      ] } : {}) },
      select: { id: true, type: true, versjon: true, niva: true, periodeStart: true, periodeSlutt: true,
        revisjon: true, levertRevisjon: true, updatedAt: true,
        revisjoner: { orderBy: { revisjon: "desc" }, take: 1, select: { status: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 21,
    }),
  ]);
  if (medlemskap === null) return null;
  const side = rader.slice(0, 20);
  const siste = side.at(-1);
  return {
    kanSvare: true,
    nesteSide: rader.length > 20 && siste ? { forDato: siste.updatedAt.toISOString(), forId: siste.id } : null,
    besvarelser: side.map((rad) => ({
      id: rad.id, type: rad.type, versjon: rad.versjon, niva: rad.niva,
      periodeStart: rad.periodeStart.toISOString().slice(0, 10), periodeSlutt: rad.periodeSlutt.toISOString().slice(0, 10),
      revisjon: rad.revisjon, levertRevisjon: rad.levertRevisjon, sistLagret: rad.updatedAt.toISOString(),
      status: rad.revisjoner[0]?.status ?? "UKJENT",
    })),
  };
}

/** Vis inngangen bare for aktive WANG-/TN-deltakere. Ender medlemskapet, forsvinner den (04.10.2026). */
export async function harEgenIupInngang() {
  const bruker = await requireSpillerActionUser();
  const eier = await prisma.user.findFirst({ where: iupSynligForSpillerWhere(bruker.id), select: { id: true } });
  return eier !== null;
}

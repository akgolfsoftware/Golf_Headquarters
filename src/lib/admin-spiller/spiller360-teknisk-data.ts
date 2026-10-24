import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { hentTekniskPlan } from "@/lib/teknisk-plan/tp-last";
import { planVisning } from "@/lib/teknisk-plan/tp-visning";
import { velgPlan } from "@/lib/teknisk-plan/tp-oversikt";
import { dato } from "./spiller360-visning";
import type { S360Tp } from "./spiller360-typer";

/** Intern leser. Kalleren eier tilgangskontrollen og holder transaksjonen. */
export async function lastSpiller360Teknisk(id: string, db: Prisma.TransactionClient): Promise<S360Tp> {
  const planer = await db.technicalPlan.findMany({
    where: { userId: id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, navn: true, status: true, startDato: true, sluttDato: true, updatedAt: true },
  });
  const valgt = velgPlan(planer);
  const rad = valgt ? await hentTekniskPlan({ id: valgt.id, userId: id }, db) : null;
  const STATUS: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };
  return {
    planer: planer.map((p) => ({
      id: p.id, navn: p.navn, status: STATUS[p.status] ?? p.status,
      periode: `${dato(p.startDato)}–${p.sluttDato ? dato(p.sluttDato) : "åpen"}`, oppdatert: dato(p.updatedAt),
    })),
    aktiv: rad ? planVisning(rad, { loggAntall: 5 }) : null,
    aktivId: rad?.id ?? null,
  };
}

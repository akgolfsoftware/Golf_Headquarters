import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { lesIupLagring } from "./lagringskontrakt";
import type { IupBesvarelse } from "./utviklingssjekk";
import type { IupSesongevaluering } from "./sesongevaluering";

export type LevertIupProfilrad = {
  id: string;
  type: "UTVIKLINGSSJEKK" | "SESONGEVALUERING";
  versjon: string;
  niva: string;
  periodeStart: string;
  periodeSlutt: string;
  levert: string;
  revisjon: number;
  innhold: IupBesvarelse | IupSesongevaluering | null;
  kildeEllerFormatAvviker: boolean;
};

/**
 * Leser kun den nåværende, leverte revisjonen fra en allerede tilgangskontrollert
 * transaksjon. Kalleren må beholde samme profil-/spillerlås gjennom lesingen.
 * Utkast blir aldri hentet eller sendt videre til trenerflaten.
 */
export async function lesLeverteIupForProfil(tx: Prisma.TransactionClient, spillerId: string): Promise<LevertIupProfilrad[]> {
  const rader = await tx.iupBesvarelse.findMany({
    where: { userId: spillerId, user: { deletedAt: null, anonymisertAt: null }, levertRevisjon: { not: null } },
    select: {
      id: true, type: true, versjon: true, niva: true, periodeStart: true, periodeSlutt: true,
      levertRevisjon: true, kildeSha256: true,
      revisjoner: { where: { status: "LEVERT" }, orderBy: { revisjon: "desc" }, take: 1,
        select: { revisjon: true, requestId: true, requestHash: true, payload: true, createdAt: true } },
    },
    orderBy: [{ periodeStart: "desc" }, { id: "desc" }],
  });

  return rader.flatMap((rad) => {
    const revisjon = rad.revisjoner[0];
    if (!revisjon || rad.levertRevisjon === null) return [];
    const periodeStart = rad.periodeStart.toISOString().slice(0, 10);
    const periodeSlutt = rad.periodeSlutt.toISOString().slice(0, 10);
    const lest = lesIupLagring({ type: rad.type, periodeStart, periodeSlutt,
      forventetRevisjon: revisjon.revisjon - 1, requestId: revisjon.requestId, besvarelse: revisjon.payload });
    const gyldig = revisjon.revisjon === rad.levertRevisjon && lest.ok
      && lest.data.besvarelse.status === "LEVERT"
      && lest.data.kildeSha256 === rad.kildeSha256
      && lest.data.requestHash === revisjon.requestHash
      && lest.data.besvarelse.versjon === rad.versjon
      && lest.data.niva === rad.niva;
    return [{ id: rad.id, type: rad.type as LevertIupProfilrad["type"], versjon: rad.versjon, niva: rad.niva,
      periodeStart, periodeSlutt, levert: revisjon.createdAt.toISOString(), revisjon: revisjon.revisjon,
      innhold: gyldig && lest.ok ? lest.data.besvarelse : null, kildeEllerFormatAvviker: !gyldig }];
  });
}

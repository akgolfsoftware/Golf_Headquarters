// Data-lastere for AgencyOS e-post-innboks. Ren lesing — ingen mutasjon
// (mutasjoner ligger i actions.ts). Returnerer klient-klare view-modeller
// (dato formatert som streng) — ingen rå Date over RSC-grensen, per
// eksisterende v2-mønster (se AdminRunderV2Round.dato).
import "server-only";

import { prisma } from "@/lib/prisma";
import type { InnboksEpost } from "@/generated/prisma/client";

export type InnboksEpostVm = {
  id: string;
  fraEpost: string;
  fraNavn: string | null;
  emne: string;
  brodtekst: string;
  mottattAt: string; // «10. jul 09:14»
  status: string;
  utkastSvar: string | null;
  harUtkast: boolean;
};

function tilVm(e: InnboksEpost): InnboksEpostVm {
  return {
    id: e.id,
    fraEpost: e.fraEpost,
    fraNavn: e.fraNavn,
    emne: e.emne,
    brodtekst: e.brodtekst,
    mottattAt: e.mottattAt.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: e.status,
    utkastSvar: e.utkastSvar,
    harUtkast: e.utkastGenerertAt !== null,
  };
}

/** Full liste for /admin/innboks-epost — nyeste først. */
export async function loadAlleEpost(): Promise<InnboksEpostVm[]> {
  const rader = await prisma.innboksEpost.findMany({ orderBy: { mottattAt: "desc" } });
  return rader.map(tilVm);
}

export type InnboksSammendrag = {
  antallNye: number;
  siste: InnboksEpostVm[];
};

/** Kompakt sammendrag for cockpit-modulen: antall nye + siste 3 mottatt. */
export async function loadInnboksSammendrag(): Promise<InnboksSammendrag> {
  const [antallNye, siste] = await Promise.all([
    prisma.innboksEpost.count({ where: { status: "NY" } }),
    prisma.innboksEpost.findMany({
      orderBy: { mottattAt: "desc" },
      take: 3,
    }),
  ]);
  return { antallNye, siste: siste.map(tilVm) };
}

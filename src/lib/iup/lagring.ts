import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { rateLimit } from "@/lib/rate-limit";
import { lesIupLagring, type ValidertIupLagring } from "./lagringskontrakt";
import { aktivIupTilknytningWhere } from "./tilknytning";

export type IupLagringsresultat =
  | { ok: true; id: string; revisjon: number; gjeldendeRevisjon: number; gjentatt: boolean }
  | { ok: false; kode: "UGYLDIG" | "KONFLIKT" | "REQUEST_GJENBRUKT" | "KILDE_ENDRET" | "FOR_MANGE" | "IKKE_IUP_DELTAKER"; melding: string };

function konflikt(): IupLagringsresultat {
  return { ok: false, kode: "KONFLIKT", melding: "Besvarelsen er endret i en annen visning. Hent siste versjon før du lagrer igjen." };
}

async function skrivRevisjon(tx: Prisma.TransactionClient, userId: string, p: ValidertIupLagring): Promise<IupLagringsresultat> {
  // Ny kontroll i transaksjonen: en konto slettet etter innlogging kan ikke skrive.
  const eier = await tx.user.findFirst({ where: { id: userId, deletedAt: null, anonymisertAt: null }, select: { id: true } });
  if (!eier) throw new Error("forbidden");
  const medlemskap = await tx.groupMember.findFirst({ where: { userId, ...aktivIupTilknytningWhere() }, select: { id: true } });
  if (!medlemskap) return { ok: false, kode: "IKKE_IUP_DELTAKER", melding: "Spørsmålssjekkene gjelder aktive spillere i WANG eller Team Norway." };
  const nokkel = {
    userId, type: p.type, versjon: p.besvarelse.versjon, niva: p.niva,
    periodeStart: new Date(`${p.periodeStart}T00:00:00.000Z`),
    periodeSlutt: new Date(`${p.periodeSlutt}T00:00:00.000Z`),
  };
  const eksisterende = await tx.iupBesvarelse.findUnique({ where: { userId_type_versjon_niva_periodeStart_periodeSlutt: nokkel } });
  // En gammel klient kan ikke opprette en ny, tom besvarelse med et gammelt revisjonsnummer.
  if (!eksisterende && p.forventetRevisjon !== 0) return konflikt();
  const hode = eksisterende ?? await tx.iupBesvarelse.create({ data: { ...nokkel, kildeSha256: p.kildeSha256 } });
  if (hode.kildeSha256 !== p.kildeSha256) {
    return { ok: false, kode: "KILDE_ENDRET", melding: "Spørsmålskilden er endret. Historiske svar må beholdes med opprinnelig kilde." };
  }
  const kvittering = await tx.iupRevisjon.findUnique({ where: { besvarelseId_requestId: { besvarelseId: hode.id, requestId: p.requestId } } });
  if (kvittering) {
    if (kvittering.requestHash !== p.requestHash) return { ok: false, kode: "REQUEST_GJENBRUKT", melding: "Samme lagrings-ID kan ikke brukes til forskjellige endringer." };
    return { ok: true, id: hode.id, revisjon: kvittering.revisjon, gjeldendeRevisjon: hode.revisjon, gjentatt: true };
  }
  if (hode.revisjon !== p.forventetRevisjon) return konflikt();
  const revisjon = hode.revisjon + 1;
  const endret = await tx.iupBesvarelse.updateMany({
    where: { id: hode.id, userId, revisjon: p.forventetRevisjon },
    data: { revisjon, ...(p.besvarelse.status === "LEVERT" ? { levertRevisjon: revisjon } : {}) },
  });
  if (endret.count !== 1) return konflikt();
  await tx.iupRevisjon.create({ data: {
    besvarelseId: hode.id, revisjon, requestId: p.requestId, requestHash: p.requestHash,
    status: p.besvarelse.status, payload: p.besvarelse,
  } });
  return { ok: true, id: hode.id, revisjon, gjeldendeRevisjon: revisjon, gjentatt: false };
}

/** Spilleren skriver kun sine egne svar. Organisasjons-ID og målspiller tas aldri fra klienten. */
export async function lagreEgenIup(input: unknown): Promise<IupLagringsresultat> {
  const bruker = await requireSpillerActionUser();
  const lest = lesIupLagring(input);
  if (!lest.ok) return { ok: false, kode: "UGYLDIG", melding: lest.melding };
  const grense = await rateLimit({ key: `iup:lagre:${bruker.id}`, max: 60, windowMs: 60_000 });
  if (!grense.ok) return { ok: false, kode: "FOR_MANGE", melding: "For mange lagringer. Vent litt og prøv igjen." };
  // Parallelle førstegangslagringer kan kollidere på den naturlige nøkkelen.
  // Ny transaksjon leser kvitteringen eller gir versjonskonflikt, aldri dobbel lagring.
  for (let forsok = 0; forsok < 3; forsok++) {
    try {
      return await prisma.$transaction((tx) => skrivRevisjon(tx, bruker.id, lest.data), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !["P2002", "P2034"].includes(error.code)) throw error;
      if (forsok === 2) return konflikt();
    }
  }
  return konflikt();
}

const Lesing = z.object({ id: z.string().min(1).max(120), forRevisjon: z.number().int().positive().optional() }).strict();

/** Eierens historikk, 20 revisjoner per side. Fremmed ID og manglende ID svarer likt. */
export async function hentEgenIup(input: unknown) {
  const bruker = await requireSpillerActionUser();
  const parsed = Lesing.safeParse(input);
  if (!parsed.success) return null;
  const hode = await prisma.iupBesvarelse.findFirst({
    where: { id: parsed.data.id, userId: bruker.id, user: { deletedAt: null, anonymisertAt: null } },
    include: { revisjoner: {
      where: parsed.data.forRevisjon ? { revisjon: { lt: parsed.data.forRevisjon } } : {},
      orderBy: { revisjon: "desc" }, take: 21,
    } },
  });
  if (!hode) return null;
  const periodeStart = hode.periodeStart.toISOString().slice(0, 10);
  const periodeSlutt = hode.periodeSlutt.toISOString().slice(0, 10);
  const siderader = hode.revisjoner.slice(0, 20);
  return {
    id: hode.id, type: hode.type, versjon: hode.versjon, niva: hode.niva, periodeStart, periodeSlutt,
    revisjon: hode.revisjon, levertRevisjon: hode.levertRevisjon,
    nesteRevisjon: hode.revisjoner.length > 20 ? siderader.at(-1)!.revisjon : null,
    revisjoner: siderader.map((rad) => {
      const lest = lesIupLagring({ type: hode.type, periodeStart, periodeSlutt, forventetRevisjon: rad.revisjon - 1, requestId: rad.requestId, besvarelse: rad.payload });
      const gyldig = lest.ok && lest.data.kildeSha256 === hode.kildeSha256
        && lest.data.requestHash === rad.requestHash && lest.data.besvarelse.status === rad.status
        && lest.data.besvarelse.versjon === hode.versjon && lest.data.niva === hode.niva;
      return { revisjon: rad.revisjon, status: rad.status, createdAt: rad.createdAt.toISOString(),
        innhold: gyldig && lest.ok ? lest.data.besvarelse : null,
        kildeEllerFormatAvviker: !gyldig,
      };
    }),
  };
}

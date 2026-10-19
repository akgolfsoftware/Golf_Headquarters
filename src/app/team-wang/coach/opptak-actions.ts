"use server";

/**
 * Server actions for Opptak (WANG-31, -32) og Koordinering mellom skolene (WANG-33).
 *
 * Kandidatene er mindreårige. Bare sportssjef skriver, og skolen (gruppe-ID) avgjøres alltid her på serveren
 * via hentWangCoachGruppeId — aldri fra nettleseren. En trener avvises med «Denne siden er lukket».
 * Kontaktloggen lagrer hvem, hvem de snakket med og når; aldri innhold. Revisjonsloggen får ingen navn.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { hentWangCoachGruppeId, WangDataUtilgjengeligError } from "@/app/team-wang/_data/wang-tilgang";
import { kanSeWangAdministrasjon, wangRolleFor } from "@/app/team-wang/_data/wang-rolle";
import { osloIdagIso } from "@/app/team-wang/_data/wang-trener-data";
import { KANDIDAT_STATUS, KONTAKT_MOTTAKER, opptakSkoleaar } from "@/app/team-wang/_data/wang-opptak-visning";

export type OpptakResultat = { ok: true } | { ok: false; feil: string };

const LUKKET = "Denne siden er lukket. Opptak er bare for sportssjef.";
const STI = "/team-wang/coach";

type Sportssjef = { id: string; navn: string; gruppeId: string };

async function krevSportssjef(): Promise<Sportssjef | { feil: string }> {
  const bruker = await getCurrentUser();
  if (!bruker) return { feil: "Du må logge inn på nytt." };
  if (!kanSeWangAdministrasjon(wangRolleFor(bruker))) return { feil: LUKKET };
  try {
    const gruppeId = await hentWangCoachGruppeId(bruker);
    if (!gruppeId) return { feil: LUKKET };
    return { id: bruker.id, navn: bruker.name?.trim() || "Sportssjef", gruppeId };
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) return { feil: error.message };
    throw error;
  }
}

const IdInput = z.object({ kandidatId: z.string().min(1).max(64) });

const NyKandidat = z.object({
  navn: z.string().trim().min(2).max(120),
  klubb: z.string().trim().max(120).optional().transform((v) => v || null),
  fodselsaar: z.number().int().min(2000).max(2030).nullable().optional(),
});

export async function leggTilKandidat(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = NyKandidat.safeParse(raw);
  if (!input.success) return { ok: false, feil: "Skriv navnet (minst to tegn). Fødselsår må være et årstall." };

  const kandidat = await prisma.wangKandidat.create({
    data: {
      groupId: ss.gruppeId,
      skoleaar: opptakSkoleaar(osloIdagIso()),
      navn: input.data.navn,
      klubb: input.data.klubb,
      fodselsaar: input.data.fodselsaar ?? null,
      createdById: ss.id,
    },
    select: { id: true },
  });
  await audit({ actorId: ss.id, action: "wang.opptak.kandidat_lagt_til", target: kandidat.id, metadata: { groupId: ss.gruppeId } });
  revalidatePath(STI);
  return { ok: true };
}

const NyStatus = IdInput.extend({ status: z.enum(KANDIDAT_STATUS) });

export async function settKandidatStatus(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = NyStatus.safeParse(raw);
  if (!input.success) return { ok: false, feil: "Ukjent status." };

  // Bare egen skoles kandidater: groupId i where-filteret.
  const { count } = await prisma.wangKandidat.updateMany({
    where: { id: input.data.kandidatId, groupId: ss.gruppeId },
    data: { status: input.data.status },
  });
  if (count === 0) return { ok: false, feil: "Fant ikke kandidaten ved din skole." };
  await audit({ actorId: ss.id, action: "wang.opptak.status", target: input.data.kandidatId, metadata: { status: input.data.status } });
  revalidatePath(STI);
  return { ok: true };
}

export async function fjernKandidat(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = IdInput.safeParse(raw);
  if (!input.success) return { ok: false, feil: "Ugyldig kandidat." };

  // Stjerner og kontaktlogg slettes med (ON DELETE CASCADE).
  const { count } = await prisma.wangKandidat.deleteMany({ where: { id: input.data.kandidatId, groupId: ss.gruppeId } });
  if (count === 0) return { ok: false, feil: "Fant ikke kandidaten ved din skole." };
  await audit({ actorId: ss.id, action: "wang.opptak.kandidat_fjernet", target: input.data.kandidatId, metadata: { groupId: ss.gruppeId } });
  revalidatePath(STI);
  return { ok: true };
}

const Plasser = z.object({ plasser: z.number().int().min(0).max(99).nullable() });

export async function settPlasser(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = Plasser.safeParse(raw);
  if (!input.success) return { ok: false, feil: "Plasser må være et tall fra 0 til 99." };

  const skoleaar = opptakSkoleaar(osloIdagIso());
  await prisma.wangOpptak.upsert({
    where: { groupId_skoleaar: { groupId: ss.gruppeId, skoleaar } },
    create: { groupId: ss.gruppeId, skoleaar, plasser: input.data.plasser, updatedById: ss.id },
    update: { plasser: input.data.plasser, updatedById: ss.id },
  });
  await audit({ actorId: ss.id, action: "wang.opptak.plasser", target: ss.gruppeId, metadata: { skoleaar, plasser: input.data.plasser } });
  revalidatePath(STI);
  return { ok: true };
}

/**
 * Kandidaten skolen kan merke eller logge kontakt med: egen kandidat, eller en annen skoles kandidat som
 * allerede er delt i koordineringen (har stjerne eller kontakt). Samme skoleår som opptaket som pågår.
 */
async function erKoordinerbar(kandidatId: string, gruppeId: string): Promise<boolean> {
  const kandidat = await prisma.wangKandidat.findFirst({
    where: { id: kandidatId, skoleaar: opptakSkoleaar(osloIdagIso()) },
    select: { groupId: true },
  });
  if (!kandidat) return false;
  if (kandidat.groupId === gruppeId) return true;
  const [stjerne, kontakt] = await Promise.all([
    prisma.wangKandidatStjerne.findFirst({ where: { kandidatId }, select: { id: true } }),
    prisma.wangKandidatKontakt.findFirst({ where: { kandidatId }, select: { id: true } }),
  ]);
  return Boolean(stjerne || kontakt);
}

const Stjerne = IdInput.extend({ merket: z.boolean() });

export async function settStjerne(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = Stjerne.safeParse(raw);
  if (!input.success) return { ok: false, feil: "Ugyldig kandidat." };
  if (!(await erKoordinerbar(input.data.kandidatId, ss.gruppeId))) return { ok: false, feil: "Fant ikke kandidaten." };

  if (input.data.merket) {
    await prisma.wangKandidatStjerne.upsert({
      where: { kandidatId_groupId: { kandidatId: input.data.kandidatId, groupId: ss.gruppeId } },
      create: { kandidatId: input.data.kandidatId, groupId: ss.gruppeId, createdById: ss.id },
      update: {},
    });
  } else {
    await prisma.wangKandidatStjerne.deleteMany({ where: { kandidatId: input.data.kandidatId, groupId: ss.gruppeId } });
  }
  await audit({ actorId: ss.id, action: "wang.koordinering.stjerne", target: input.data.kandidatId, metadata: { merket: input.data.merket } });
  revalidatePath(STI);
  return { ok: true };
}

const Kontakt = IdInput.extend({
  mottaker: z.enum(KONTAKT_MOTTAKER),
  /** «YYYY-MM-DD» (Oslo-dato), ikke fram i tid. */
  dato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function loggKontakt(raw: unknown): Promise<OpptakResultat> {
  const ss = await krevSportssjef();
  if ("feil" in ss) return { ok: false, feil: ss.feil };
  const input = Kontakt.safeParse(raw);
  if (!input.success || input.data.dato > osloIdagIso()) {
    return { ok: false, feil: "Velg hvem du snakket med og en dato som ikke er fram i tid." };
  }
  if (!(await erKoordinerbar(input.data.kandidatId, ss.gruppeId))) return { ok: false, feil: "Fant ikke kandidaten." };

  const [y, m, d] = input.data.dato.split("-").map(Number);
  await prisma.wangKandidatKontakt.create({
    data: {
      kandidatId: input.data.kandidatId,
      groupId: ss.gruppeId,
      personRolle: "Sportssjef",
      personNavn: ss.navn,
      mottaker: input.data.mottaker,
      // Middag UTC = samme kalenderdag i Oslo hele året.
      kontaktetAt: new Date(Date.UTC(y, m - 1, d, 12)),
      createdById: ss.id,
    },
  });
  await audit({ actorId: ss.id, action: "wang.koordinering.kontakt", target: input.data.kandidatId, metadata: { mottaker: input.data.mottaker } });
  revalidatePath(STI);
  return { ok: true };
}

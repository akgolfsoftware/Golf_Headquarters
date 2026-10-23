import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { forelderKanEndreAkAnalyse } from "./ak-analyse-regler";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON, delerAkProfil } from "./ak-profil-regler";
import { akProfilGruppeWhere, AK_PROFIL_RAD_SELECT, AK_PROFIL_TRANSAKSJON } from "./ak-profil-lesing";
import { laas, databasetid, laasGruppemedlemskap, laasBrukere, laasForesattRelasjon } from "./ak-analyse-laas";

const idSchema = z.string().trim().min(1).max(200);
const txValg = AK_PROFIL_TRANSAKSJON;
async function aktivAktor(tx: Prisma.TransactionClient, aktor: { id: string; role: string }) {
  const rad = await tx.user.findFirst({ where: { id: aktor.id, deletedAt: null }, select: { role: true } });
  return rad?.role === aktor.role;
}
export type AkProfilValg = { gruppeId: string; gruppeNavn: string; deler: boolean; harLagretJa?: boolean; kanGi: boolean; kreverForesatt: boolean; forelderKanEndre: boolean };

/** Kun etter sidevakt for egen konto eller godkjent forelderrelasjon. Ikke en leserett. */
export async function hentAkProfilValg(spillerId: string): Promise<AkProfilValg[]> {
  const spiller = await prisma.user.findFirst({ where: { id: spillerId, role: "PLAYER", deletedAt: null },
    select: { dateOfBirth: true, requiresGuardianConsent: true } });
  if (!spiller) return [];
  const historikk = await prisma.delingsSamtykke.findMany({ where: { userId: spillerId, scope: AK_PROFIL_SCOPE }, select: AK_PROFIL_RAD_SELECT });
  const foreldre = await prisma.parentRelation.findMany({ where: { childId: spillerId, approved: true }, select: { parentId: true } });
  const grupper = await prisma.group.findMany({ where: { OR: [
    { ...akProfilGruppeWhere(), members: { some: { userId: spillerId, role: "PLAYER", endedAt: null } } },
    { id: { in: historikk.map(r => r.mottakerGruppeId) } },
  ] }, select: { id: true, name: true } , orderBy: { name: "asc" } });
  const aktive = await prisma.group.findMany({ where: { ...akProfilGruppeWhere(),
    members: { some: { userId: spillerId, role: "PLAYER", endedAt: null } },
  }, select: { id: true } });
  const naa = new Date();
  const kreverForesatt = maaHaForesattSamtykke(spiller, naa);
  return grupper.map(g => ({
    harLagretJa: (() => {
      const rader = historikk.filter(r => r.mottakerGruppeId === g.id && r.mottakerUserId === null);
      const tid = Math.max(...rader.map(r => r.createdAt.getTime()));
      return rader.some(r => r.createdAt.getTime() === tid && r.gitt);
    })(), gruppeId: g.id, gruppeNavn: g.name,
    deler: delerAkProfil(historikk, { spillerId, gruppeId: g.id, ...spiller, foresattIder: foreldre.map(f => f.parentId), naa }),
    kanGi: aktive.some(a => a.id === g.id), kreverForesatt,
    forelderKanEndre: forelderKanEndreAkAnalyse(kreverForesatt, spiller.dateOfBirth, naa),
  }));
}

export const akProfilSvarSchema = z.object({ gruppeId: idSchema, gitt: z.boolean(), tekstVersjon: z.literal(AK_PROFIL_VERSJON) }).strict();

/** Aktøren kommer fra innloggingen i server-actionen. Ingen ADMIN-overstyring. */
export async function settAkProfilValg(aktor: { id: string; role: string }, spillerId: string, input: unknown): Promise<{ ok: true } | { ok: false; feil: string }> {
  const parsed = akProfilSvarSchema.safeParse(input);
  if (!parsed.success || !idSchema.safeParse(spillerId).success) return { ok: false, feil: "Valget er utdatert eller ugyldig. Last siden på nytt." };
  const { gruppeId, gitt } = parsed.data;
  if (aktor.id === spillerId ? aktor.role !== "PLAYER" : aktor.role !== "PARENT") {
    return { ok: false, feil: "Du kan ikke endre dette valget for spilleren." };
  }
  return prisma.$transaction(async tx => {
    await laas(tx, gruppeId);
    if (aktor.id !== spillerId && !await tx.parentRelation.findFirst({
      where: { parentId: aktor.id, childId: spillerId, approved: true }, select: { id: true },
    })) return { ok: false as const, feil: "Du kan ikke endre dette valget for spilleren." };
    if (gitt && !await tx.group.findFirst({ where: { id: gruppeId, ...akProfilGruppeWhere(),
      members: { some: { userId: spillerId, role: "PLAYER", endedAt: null } },
    }, select: { id: true } })) return { ok: false as const, feil: "Du må være aktivt medlem av en AK Golf-gruppe for å dele med den." };
    // Trekk skal virke også etter utmelding/arkivering; bare nytt ja trenger gruppen.
    const medlemskap = gitt ? await laasGruppemedlemskap(tx, gruppeId) : [];
    const kontoer = await laasBrukere(tx, [spillerId, aktor.id]);
    if (![spillerId, aktor.id].every(id => kontoer.some(k => k.id === id))) return { ok: false as const, feil: "Kontoen er ikke tilgjengelig." };
    const relasjoner = aktor.id !== spillerId ? await laasForesattRelasjon(tx, aktor.id, spillerId) : [];
    const naa = await databasetid(tx);
    if (!await aktivAktor(tx, aktor)) return { ok: false as const, feil: "Kontoen har ikke tilgang til dette valget." };
    const spiller = await tx.user.findFirst({ where: { id: spillerId, role: "PLAYER", deletedAt: null },
      select: { dateOfBirth: true, requiresGuardianConsent: true } });
    if (!spiller) return { ok: false as const, feil: "Spilleren er ikke tilgjengelig." };
    const kreverForesatt = maaHaForesattSamtykke(spiller, naa);
    const selv = aktor.id === spillerId && aktor.role === "PLAYER";
    if (!selv) {
      if (aktor.role !== "PARENT" || !forelderKanEndreAkAnalyse(kreverForesatt, spiller.dateOfBirth, naa) || !await tx.parentRelation.findFirst({
        where: { id: { in: relasjoner.map(r => r.id) }, parentId: aktor.id, childId: spillerId, approved: true }, select: { id: true },
      })) return { ok: false as const, feil: "Du kan ikke endre dette valget for spilleren." };
    } else if (gitt && kreverForesatt) {
      return { ok: false as const, feil: "En godkjent forelder må gi tillatelsen. Du kan alltid trekke delingen selv." };
    }
    if (gitt) {
      const gruppe = await tx.group.findFirst({ where: { id: gruppeId, ...akProfilGruppeWhere(),
        members: { some: { id: { in: medlemskap.map(m => m.id) }, userId: spillerId, role: "PLAYER", endedAt: null } },
      }, select: { id: true } });
      if (!gruppe) return { ok: false as const, feil: "Du må være aktivt medlem av en AK Golf-gruppe for å dele med den." };
    }
    if (!gitt && !await tx.delingsSamtykke.findFirst({ where: { userId: spillerId,
      scope: AK_PROFIL_SCOPE, mottakerGruppeId: gruppeId, mottakerUserId: null }, select: { id: true },
    })) return { ok: false as const, feil: "Det finnes ikke noe lagret valg for denne gruppen." };
    // Trekk virker også etter utmelding/arkivering. Det gir aldri ny tilgang.
    // Tidspunkt settes etter låsen, ikke til transaksjonens mulige ventestart.
    await tx.delingsSamtykke.create({ data: { userId: spillerId, scope: AK_PROFIL_SCOPE, mottakerGruppeId: gruppeId,
      mottakerUserId: null, gitt, createdAt: naa, tekstVersjon: AK_PROFIL_VERSJON, gittAvUserId: aktor.id, gittAvRolle: selv ? "SELV" : "FORESATT",
    } });
    await tx.auditLog.create({ data: { actorId: aktor.id, action: gitt ? "deling.ak-profil.gitt" : "deling.ak-profil.trukket",
      target: `User:${spillerId}`, metadata: { scope: AK_PROFIL_SCOPE, gruppeId, tekstVersjon: AK_PROFIL_VERSJON },
    } });
    return { ok: true as const };
  }, txValg);
}

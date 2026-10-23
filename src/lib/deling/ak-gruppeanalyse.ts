import "server-only";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { AK_ANALYSE_SCOPE, AK_ANALYSE_VERSJON, delerAkAnalyse, forelderKanEndreAkAnalyse } from "./ak-analyse-regler";

import { laas, databasetid, laasGruppemedlemskap, laasBrukere, laasForesattRelasjon } from "./ak-analyse-laas";

const idSchema = z.string().trim().min(1).max(200);
type Tx = Prisma.TransactionClient;
const txValg = { maxWait: 10_000, timeout: 20_000 };
const radSelect = { scope: true, mottakerGruppeId: true, mottakerUserId: true, gitt: true,
  gittAvRolle: true, tekstVersjon: true, createdAt: true } as const;

async function aktivAktor(tx: Tx, aktor: { id: string; role: string }) {
  const rad = await tx.user.findFirst({ where: { id: aktor.id, deletedAt: null }, select: { role: true } });
  return rad?.role === aktor.role;
}

/** Kilden til analyse-ID-er er serveren, aldri en spillerliste fra klienten. */
export async function medAkGruppeanalyse<T>(gruppeId: string, les: (tx: Tx, spillerIds: string[]) => Promise<T>): Promise<T | null> {
  gruppeId = idSchema.parse(gruppeId);
  const bruker = await requireCapability(Capability.MANAGE_GROUPS);
  if (bruker.role !== "ADMIN" && bruker.role !== "COACH") return null;
  return prisma.$transaction(async tx => {
    await laas(tx, gruppeId);
    // Avvis utenforstående før medlemsrader hentes/låses. Dette er bare en
    // tidlig port; den avgjørende kontrollen gjentas mot låste rader nedenfor.
    if (!await tx.group.findFirst({ where: { id: gruppeId, managedByAkGolf: true, arkivertAt: null,
      ...(bruker.role === "ADMIN" ? {} : { OR: [{ coachId: bruker.id }, { members: { some: {
        userId: bruker.id, endedAt: null, role: { in: ["COACH", "ASSISTANT"] },
      } } }] }),
    }, select: { id: true } })) return null;
    const medlemskap = await laasGruppemedlemskap(tx, gruppeId);
    const kontoer = await laasBrukere(tx, [...medlemskap.map(m => m.userId), bruker.id]);
    if (!kontoer.some(k => k.id === bruker.id)) return null;
    const naa = await databasetid(tx);
    if (!await aktivAktor(tx, bruker)) return null;
    const gruppe = await tx.group.findFirst({ where: { id: gruppeId, managedByAkGolf: true, arkivertAt: null,
      ...(bruker.role === "ADMIN" ? {} : { OR: [{ coachId: bruker.id }, { members: { some: {
        id: { in: medlemskap.map(m => m.id) }, userId: bruker.id, endedAt: null, role: { in: ["COACH", "ASSISTANT"] },
      } } }] }),
    }, select: { id: true } });
    if (!gruppe) return null;
    const spillere = await tx.user.findMany({ where: { id: { in: medlemskap.map(m => m.userId) }, role: "PLAYER", deletedAt: null,
      groupMemberships: { some: { id: { in: medlemskap.map(m => m.id) }, groupId: gruppeId, role: "PLAYER", endedAt: null } },
    }, select: { id: true, dateOfBirth: true, requiresGuardianConsent: true } });
    if (!spillere.length) return les(tx, []);
    const rader = await tx.delingsSamtykke.findMany({ where: { userId: { in: spillere.map(s => s.id) },
      scope: AK_ANALYSE_SCOPE, mottakerGruppeId: gruppeId, mottakerUserId: null,
    }, select: { userId: true, ...radSelect } });
    const tillatte = spillere.filter(s => delerAkAnalyse(rader.filter(r => r.userId === s.id), gruppeId,
      maaHaForesattSamtykke(s, naa), s.dateOfBirth, naa)).map(s => s.id);
    return les(tx, tillatte);
  }, txValg);
}

export type AkAnalyseValg = { gruppeId: string; gruppeNavn: string; deler: boolean; kanGi: boolean; kreverForesatt: boolean; forelderKanEndre: boolean };

/** Kun etter at siden har kontrollert eierskap eller godkjent forelderrelasjon. */
export async function hentAkAnalyseValg(spillerId: string): Promise<AkAnalyseValg[]> {
  const spiller = await prisma.user.findFirst({ where: { id: spillerId, deletedAt: null },
    select: { dateOfBirth: true, requiresGuardianConsent: true } });
  if (!spiller) return [];
  const historikk = await prisma.delingsSamtykke.findMany({ where: { userId: spillerId, scope: AK_ANALYSE_SCOPE }, select: radSelect });
  const grupper = await prisma.group.findMany({ where: { OR: [
    { managedByAkGolf: true, arkivertAt: null, members: { some: { userId: spillerId, role: "PLAYER", endedAt: null } } },
    { id: { in: historikk.map(r => r.mottakerGruppeId) } },
  ] }, select: { id: true, name: true, managedByAkGolf: true, arkivertAt: true,
    members: { where: { userId: spillerId, role: "PLAYER", endedAt: null }, select: { id: true } },
  }, orderBy: { name: "asc" } });
  const kreverForesatt = maaHaForesattSamtykke(spiller);
  return grupper.map(g => ({ gruppeId: g.id, gruppeNavn: g.name,
    deler: delerAkAnalyse(historikk, g.id, kreverForesatt, spiller.dateOfBirth),
    kanGi: g.managedByAkGolf && !g.arkivertAt && g.members.length > 0, kreverForesatt,
    forelderKanEndre: forelderKanEndreAkAnalyse(kreverForesatt, spiller.dateOfBirth),
  }));
}

export const akAnalyseSvarSchema = z.object({ gruppeId: idSchema, gitt: z.boolean(), tekstVersjon: z.literal(AK_ANALYSE_VERSJON) }).strict();

/** Aktøren kommer fra innloggingen i server-actionen. Ingen ADMIN-overstyring. */
export async function settAkAnalyseValg(aktor: { id: string; role: string }, spillerId: string, input: unknown): Promise<{ ok: true } | { ok: false; feil: string }> {
  const parsed = akAnalyseSvarSchema.safeParse(input);
  if (!parsed.success || !idSchema.safeParse(spillerId).success) return { ok: false, feil: "Valget er utdatert eller ugyldig. Last siden på nytt." };
  const { gruppeId, gitt } = parsed.data;
  if (aktor.id === spillerId ? !["PLAYER", "COACH", "ADMIN"].includes(aktor.role) : aktor.role !== "PARENT") {
    return { ok: false, feil: "Du kan ikke endre dette valget for spilleren." };
  }
  return prisma.$transaction(async tx => {
    await laas(tx, gruppeId);
    if (aktor.id !== spillerId && !await tx.parentRelation.findFirst({
      where: { parentId: aktor.id, childId: spillerId, approved: true }, select: { id: true },
    })) return { ok: false as const, feil: "Du kan ikke endre dette valget for spilleren." };
    if (gitt && !await tx.group.findFirst({ where: { id: gruppeId, managedByAkGolf: true, arkivertAt: null,
      members: { some: { userId: spillerId, role: "PLAYER", endedAt: null } },
    }, select: { id: true } })) return { ok: false as const, feil: "Du må være aktivt medlem av en AK Golf-gruppe for å dele med den." };
    // Trekk skal virke også etter utmelding/arkivering; bare nytt ja trenger gruppen.
    const medlemskap = gitt ? await laasGruppemedlemskap(tx, gruppeId) : [];
    const kontoer = await laasBrukere(tx, [spillerId, aktor.id]);
    if (![spillerId, aktor.id].every(id => kontoer.some(k => k.id === id))) return { ok: false as const, feil: "Kontoen er ikke tilgjengelig." };
    const relasjoner = aktor.id !== spillerId ? await laasForesattRelasjon(tx, aktor.id, spillerId) : [];
    const naa = await databasetid(tx);
    if (!await aktivAktor(tx, aktor)) return { ok: false as const, feil: "Kontoen har ikke tilgang til dette valget." };
    const spiller = await tx.user.findFirst({ where: { id: spillerId, deletedAt: null },
      select: { dateOfBirth: true, requiresGuardianConsent: true } });
    if (!spiller) return { ok: false as const, feil: "Spilleren er ikke tilgjengelig." };
    const kreverForesatt = maaHaForesattSamtykke(spiller, naa);
    const selv = aktor.id === spillerId && ["PLAYER", "COACH", "ADMIN"].includes(aktor.role);
    if (!selv) {
      if (aktor.role !== "PARENT" || !forelderKanEndreAkAnalyse(kreverForesatt, spiller.dateOfBirth, naa) || !await tx.parentRelation.findFirst({
        where: { id: { in: relasjoner.map(r => r.id) }, parentId: aktor.id, childId: spillerId, approved: true }, select: { id: true },
      })) return { ok: false as const, feil: "Du kan ikke endre dette valget for spilleren." };
    } else if (gitt && kreverForesatt) {
      return { ok: false as const, feil: "En godkjent forelder må gi tillatelsen. Du kan alltid trekke delingen selv." };
    }
    if (gitt) {
      const gruppe = await tx.group.findFirst({ where: { id: gruppeId, managedByAkGolf: true, arkivertAt: null,
        members: { some: { id: { in: medlemskap.map(m => m.id) }, userId: spillerId, role: "PLAYER", endedAt: null } },
      }, select: { id: true } });
      if (!gruppe) return { ok: false as const, feil: "Du må være aktivt medlem av en AK Golf-gruppe for å dele med den." };
    }
    if (!gitt && !await tx.delingsSamtykke.findFirst({ where: { userId: spillerId,
      scope: AK_ANALYSE_SCOPE, mottakerGruppeId: gruppeId, mottakerUserId: null }, select: { id: true },
    })) return { ok: false as const, feil: "Det finnes ikke noe lagret valg for denne gruppen." };
    // Trekk virker også etter utmelding/arkivering. Det gir aldri ny tilgang.
    // Tidspunkt settes etter låsen, ikke til transaksjonens mulige ventestart.
    await tx.delingsSamtykke.create({ data: { userId: spillerId, scope: AK_ANALYSE_SCOPE, mottakerGruppeId: gruppeId,
      mottakerUserId: null, gitt, createdAt: naa, tekstVersjon: AK_ANALYSE_VERSJON, gittAvUserId: aktor.id, gittAvRolle: selv ? "SELV" : "FORESATT",
    } });
    await tx.auditLog.create({ data: { actorId: aktor.id, action: gitt ? "deling.ak-analyse.gitt" : "deling.ak-analyse.trukket",
      target: `User:${spillerId}`, metadata: { scope: AK_ANALYSE_SCOPE, gruppeId, tekstVersjon: AK_ANALYSE_VERSJON },
    } });
    return { ok: true as const };
  }, txValg);
}

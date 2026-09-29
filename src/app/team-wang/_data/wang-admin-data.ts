import "server-only";

import { prisma } from "@/lib/prisma";
import { calculateAge, maaHaForesattSamtykke } from "@/lib/auth/minor";
import { endOfWeek, startOfWeek } from "@/lib/uke-helpers";
import {
  byggTrenerRader,
  telBesatte,
  vurderSamtykke,
  type BesattePlasser,
  type SamtykkeStatus,
  type TrenerRad,
  type TrinnFilter,
} from "./wang-admin-regler";

/**
 * Datalastere for WANG Administrasjon. Alle tar gruppens id fra porten
 * (krevWangSportssjef().gruppe.id), aldri en slug — demobrukeren står i
 * demogruppen. Ingen oppdiktede tall: finnes ikke raden, blir svaret tomt.
 */

// ---------------------------------------------------------------- WANG-19

export type TrenereData = { rader: TrenerRad[]; aktiveElever: number };

export async function hentTrenere(gruppeId: string): Promise<TrenereData> {
  const [gruppe, medlemmer, aktiveElever] = await Promise.all([
    prisma.group.findUnique({ where: { id: gruppeId }, select: { hovedcoachId: true } }),
    prisma.groupMember.findMany({
      where: { groupId: gruppeId, role: { in: ["COACH", "ASSISTANT"] } },
      select: { userId: true, role: true, joinedAt: true, endedAt: true, user: { select: { name: true, email: true } } },
    }),
    prisma.groupMember.count({ where: { groupId: gruppeId, role: "PLAYER", endedAt: null } }),
  ]);
  const rader = byggTrenerRader(
    medlemmer.map((m) => ({ userId: m.userId, navn: m.user.name, epost: m.user.email, gruppeRolle: m.role, joinedAt: m.joinedAt, endedAt: m.endedAt })),
    gruppe?.hovedcoachId ?? null,
  );
  return { rader, aktiveElever };
}

// ---------------------------------------------------------------- WANG-34

export type SamtykkeElev = {
  userId: string;
  navn: string;
  alder: number | null;
  status: SamtykkeStatus;
  detalj: string;
};

export async function hentSamtykker(gruppeId: string): Promise<SamtykkeElev[]> {
  const elever = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, role: "PLAYER", endedAt: null },
    select: { user: { select: { id: true, name: true, dateOfBirth: true, requiresGuardianConsent: true } } },
  });
  if (elever.length === 0) return [];
  const rader = await prisma.delingsSamtykke.findMany({
    where: { mottakerGruppeId: gruppeId, userId: { in: elever.map((e) => e.user.id) } },
    select: { userId: true, scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
  });
  const naa = new Date();
  return elever
    .map(({ user }) => {
      const mine = rader.filter((r) => r.userId === user.id);
      const kreverForesatt = maaHaForesattSamtykke({ requiresGuardianConsent: user.requiresGuardianConsent, dateOfBirth: user.dateOfBirth }, naa);
      const v = vurderSamtykke(mine, gruppeId, kreverForesatt);
      return { userId: user.id, navn: user.name, alder: calculateAge(user.dateOfBirth, naa), status: v.status, detalj: v.detalj };
    })
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
}

// ---------------------------------------------------------------- WANG-26

export type SkoleOppforing = { id: string; dato: Date; trinn: string | null; kategori: string; tittel: string; notat: string | null };

/**
 * Skoledata for uka som inneholder `dag` (norsk kalender). Radene er felles
 * for alle grupper og lagres som naiv lokal midnatt (se skoledata-importen i
 * AgencyOS), så grensene er uke-helpers' lokale midnatter.
 */
export async function hentSkoleuke(dag: Date, trinn: TrinnFilter): Promise<{ fra: Date; til: Date; oppforinger: SkoleOppforing[] }> {
  const fra = startOfWeek(dag);
  const til = endOfWeek(dag);
  const rader = await prisma.schoolScheduleEntry.findMany({
    where: {
      date: { gte: fra, lt: til },
      ...(trinn === "alle" ? {} : { OR: [{ classYear: trinn }, { classYear: null }] }),
    },
    orderBy: [{ date: "asc" }, { category: "asc" }, { title: "asc" }],
    select: { id: true, date: true, classYear: true, category: true, title: true, note: true },
  });
  return {
    fra,
    til,
    oppforinger: rader.map((r) => ({ id: r.id, dato: r.date, trinn: r.classYear, kategori: r.category, tittel: r.title, notat: r.note })),
  };
}

// ---------------------------------------------------------------- WANG-32

/**
 * Besatte plasser = aktive elever i gruppen per trinn (User.schoolYear).
 * Rammen (totalt) og ventelisten finnes ikke i basen og kommer ikke herfra.
 */
export async function hentBesattePlasser(gruppeId: string): Promise<BesattePlasser> {
  const elever = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, role: "PLAYER", endedAt: null },
    select: { user: { select: { schoolYear: true } } },
  });
  return telBesatte(elever.map((e) => e.user.schoolYear));
}

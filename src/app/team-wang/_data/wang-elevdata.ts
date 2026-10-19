// Server-only: elevdata for WANG-trenerflaten (pakke 7 Elever, W2 i nattkjøringen 18.10).
//
// - Klasse (User.schoolYear, VG1–VG3) er skoleopplysning som coach/admin fører, og vises for alle
//   elevene i treners egen gruppe.
// - HCP, kategori A–K og Fireukerssjekken er elevens egne data. De vises bare når eleven (og
//   forelder under 16) har delt profilen med akkurat denne treneren: navngittTrenerHarTilgang,
//   som også krever aktivt WANG-medlemskap for eleven og treneren (beslutninger.md §ÉN IUP).
//   Tilgangen sjekkes på hvert oppslag og i samme transaksjon som lesingen.

import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { avgScoreFromHcp } from "@/lib/stats/sg-estimator";
import { krevNavngittTrener, navngittTrenerHarTilgang } from "@/lib/deling/navngitt";
import { lesLeverteIupForProfil } from "@/lib/iup/trener-profil-lesing";
import type { IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import {
  TOM_ELEVINFO,
  type WangElevdata,
  type WangElevInfo,
  type WangFireukerssjekk,
} from "./wang-elevdata-visning";

type Tx = Prisma.TransactionClient;
type Trener = { id: string; epost: string };
type HarTilgang = (tx: Tx, trener: Trener, spillerId: string, gruppeId: string) => Promise<boolean>;

/** Bare trenere med verifisert @wang.no-adresse kan ha fått deling. Alle andre ser «Ikke delt». */
async function hentTrener(): Promise<Trener | null> {
  try {
    return await krevNavngittTrener();
  } catch {
    return null;
  }
}

/**
 * HCP og kategori for én elev, bare når eleven har delt med treneren. Kategori følger
 * hentSpillerAkKategori: snitt brutto score i år, ellers HCP-estimat. Bare runder eleven
 * har delt med coach («Bare deg» teller ikke).
 */
export async function lesDeltElevinfo(
  tx: Tx,
  trener: Trener | null,
  elevId: string,
  gruppeId: string,
  aar: number,
  harTilgang: HarTilgang = navngittTrenerHarTilgang,
): Promise<Pick<WangElevInfo, "delt" | "hcp" | "kategori">> {
  if (!trener || !(await harTilgang(tx, trener, elevId, gruppeId))) {
    return { delt: false, hcp: null, kategori: null };
  }
  const [bruker, runder] = await Promise.all([
    tx.user.findUnique({ where: { id: elevId }, select: { hcp: true } }),
    tx.round.findMany({
      where: { userId: elevId, sharedWithCoach: true, playStatus: "COMPLETED", playedAt: { gte: new Date(Date.UTC(aar, 0, 1)) } },
      select: { score: true },
    }),
  ]);
  const hcp = bruker?.hcp ?? null;
  const snitt = runder.length ? runder.reduce((s, r) => s + r.score, 0) / runder.length : hcp != null ? avgScoreFromHcp(hcp) : null;
  return { delt: true, hcp, kategori: snitt != null ? kategoriFraSnittscore(snitt).kategori : null };
}

/** Klasse for alle elevene i gruppa, HCP og kategori for dem som har delt med treneren. */
export async function hentWangElevdata(gruppeId: string, elevIder: string[]): Promise<WangElevdata> {
  if (elevIder.length === 0) return {};
  const aar = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric" }).format(new Date()));
  const [klasser, trener] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: elevIder } }, select: { id: true, schoolYear: true } }),
    hentTrener(),
  ]);
  const klasse = new Map(klasser.map((k) => [k.id, k.schoolYear?.trim() || null]));
  const ut: WangElevdata = Object.fromEntries(elevIder.map((id) => [id, { ...TOM_ELEVINFO, klasse: klasse.get(id) ?? null }]));
  if (!trener) return ut;
  // Én transaksjon, én elev om gangen: tilgangssjekken låser eleven, og lesingen skjer under samme lås.
  await prisma.$transaction(async (tx) => {
    for (const id of elevIder) ut[id] = { ...ut[id], ...(await lesDeltElevinfo(tx, trener, id, gruppeId, aar)) };
  }, { timeout: 20_000 });
  return ut;
}

/** Leverte fireukerssjekker for én elev. «Ikke delt» uten gyldig deling til denne treneren. */
export async function lesWangFireukerssjekk(
  tx: Tx,
  trener: Trener | null,
  elevId: string,
  gruppeId: string,
  harTilgang: HarTilgang = navngittTrenerHarTilgang,
): Promise<WangFireukerssjekk> {
  if (!trener || !(await harTilgang(tx, trener, elevId, gruppeId))) return { status: "ikke-delt" };
  const runder = (await lesLeverteIupForProfil(tx, elevId))
    .filter((r) => r.type === "UTVIKLINGSSJEKK")
    .map((r) => ({
      id: r.id,
      periodeStart: r.periodeStart,
      periodeSlutt: r.periodeSlutt,
      levert: r.levert.slice(0, 10),
      innhold: r.innhold && "svar" in r.innhold ? (r.innhold as IupBesvarelse) : null,
    }));
  const malIder = [...new Set(runder.flatMap((r) => Object.keys(r.innhold?.prosessmal ?? {})))];
  const mal = malIder.length
    ? await tx.goal.findMany({ where: { id: { in: malIder }, userId: elevId }, select: { id: true, title: true } })
    : [];
  return { status: "delt", runder, prosessmal: Object.fromEntries(mal.map((m) => [m.id, m.title])) };
}

export async function hentWangFireukerssjekk(gruppeId: string, elevId: string): Promise<WangFireukerssjekk> {
  const trener = await hentTrener();
  if (!trener) return { status: "ikke-delt" };
  return prisma.$transaction((tx) => lesWangFireukerssjekk(tx, trener, elevId, gruppeId));
}

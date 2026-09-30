import "server-only";

import { audit } from "@/lib/audit";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

import {
  ForslagInput,
  SamtaleInput,
  dagTilDato,
  kanSvare,
  lesUtviklingssjekk,
  sjekkStatus,
  type Flate,
  type ForslagStatus,
  type ForslagType,
  type SamtaleType,
  type SjekkStatus,
  type Utviklingssjekk,
} from "./regler";

/**
 * Datalag for fireukerssjekk, trenerforslag og samtale (Pakke 1).
 *
 * Tilgang: `OppfolgingKontekst` lages bare av `krevWangTrener()` (WANG) og
 * `krevTnTrenerflate()` (Team Norway), som slipper inn Sportssjef/Trener og
 * TN-trener og ingen andre. Elev og foresatt kommer aldri hit. Alt leses og
 * skrives på `flate` + `groupId` fra konteksten, og en elev må være aktiv
 * spiller i den gruppen. Elevdata er PII om mindreårige: navn hentes bare her,
 * bak porten, og skrives aldri til logg eller sky.
 */

export type OppfolgingKontekst = { flate: Flate; groupId: string; trenerId: string };

/** Lesing trenger bare flate og gruppe; skriving krever også hvem treneren er. */
export type LesKontekst = Pick<OppfolgingKontekst, "flate" | "groupId">;

export type OppfolgingResultat<T = null> = { ok: true; data: T } | { ok: false; feil: string };

export async function erAktivElev(groupId: string, elevId: string): Promise<boolean> {
  const m = await prisma.groupMember.findFirst({
    where: { groupId, userId: elevId, ...aktivtSpillerMedlemskapWhere() },
    select: { id: true },
  });
  return m !== null;
}

async function navnFor(ids: string[]): Promise<Map<string, string>> {
  const unike = [...new Set(ids)];
  if (unike.length === 0) return new Map();
  const rader = await prisma.user.findMany({ where: { id: { in: unike } }, select: { id: true, name: true } });
  return new Map(rader.map((r) => [r.id, r.name?.trim() || "Uten navn"]));
}

// ---------------------------------------------------------------- Fireukerssjekk

export type SjekkRad = {
  id: string;
  elevId: string;
  elevNavn: string;
  periodeStart: Date;
  periodeSlutt: Date;
  frist: Date;
  levertAt: Date | null;
  prosessmaal: string | null;
  utviklingssjekk: Utviklingssjekk | null;
  paaminnelseSendtAt: Date | null;
  status: SjekkStatus;
};

/** Sjekker i gruppa, nyeste frist først. Innleveringer eleven har gjort er lesbare her; ingenting skrives. */
export async function hentFireukerssjekker(k: LesKontekst, naa: Date, elevId?: string): Promise<SjekkRad[]> {
  const rader = await prisma.fireukerssjekk.findMany({
    where: { flate: k.flate, groupId: k.groupId, ...(elevId ? { userId: elevId } : {}) },
    orderBy: [{ frist: "desc" }],
    take: 200,
  });
  const navn = await navnFor(rader.map((r) => r.userId));
  return rader.map((r) => ({
    id: r.id,
    elevId: r.userId,
    elevNavn: navn.get(r.userId) ?? "Uten navn",
    periodeStart: r.periodeStart,
    periodeSlutt: r.periodeSlutt,
    frist: r.frist,
    levertAt: r.levertAt,
    prosessmaal: r.prosessmaal,
    utviklingssjekk: lesUtviklingssjekk(r.utviklingssjekk),
    paaminnelseSendtAt: r.paaminnelseSendtAt,
    status: sjekkStatus(r, naa),
  }));
}

// ---------------------------------------------------------------- Forslag

export type ForslagRad = {
  id: string;
  elevId: string;
  elevNavn: string;
  type: ForslagType;
  tekst: string;
  status: ForslagStatus;
  svar: string | null;
  svartAt: Date | null;
  createdAt: Date;
};

function tilType(v: string): ForslagType {
  return v === "PLAN" || v === "IUP" || v === "SAMTALE" || v === "VURDERING" ? v : "PLAN";
}
function tilStatus(v: string): ForslagStatus {
  return v === "GODTATT" || v === "AVVIST" ? v : "VENTER";
}

/** Forslag treneren i gruppa har sendt, nyeste først. */
export async function hentForslag(k: LesKontekst, elevId?: string): Promise<ForslagRad[]> {
  const rader = await prisma.trenerForslag.findMany({
    where: { flate: k.flate, groupId: k.groupId, ...(elevId ? { elevId } : {}) },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });
  const navn = await navnFor(rader.map((r) => r.elevId));
  return rader.map((r) => ({
    id: r.id,
    elevId: r.elevId,
    elevNavn: navn.get(r.elevId) ?? "Uten navn",
    type: tilType(r.type),
    tekst: r.tekst,
    status: tilStatus(r.status),
    svar: r.svar,
    svartAt: r.svartAt,
    createdAt: r.createdAt,
  }));
}

/** Treneren foreslår; ingenting endres i plan eller IUP før eleven godtar. */
export async function opprettForslag(k: OppfolgingKontekst, rå: unknown): Promise<OppfolgingResultat<{ id: string }>> {
  const p = ForslagInput.safeParse(rå);
  if (!p.success) return { ok: false, feil: p.error.issues[0]?.message ?? "Ugyldig forslag" };
  if (!(await erAktivElev(k.groupId, p.data.elevId))) return { ok: false, feil: "Eleven er ikke aktiv spiller i gruppa di." };
  const rad = await prisma.trenerForslag.create({
    data: { flate: k.flate, groupId: k.groupId, trenerId: k.trenerId, elevId: p.data.elevId, type: p.data.type, tekst: p.data.tekst, status: "VENTER" },
    select: { id: true },
  });
  await audit({ actorId: k.trenerId, action: "trener_forslag.opprett", target: rad.id, metadata: { flate: k.flate, type: p.data.type } });
  return { ok: true, data: { id: rad.id } };
}

/**
 * Elevens svar (kalles fra PlayerHQ, ikke fra trenerflaten). Bare eleven forslaget
 * er til kan svare, og bare når statusen er VENTER.
 */
export async function svarPaaForslag(elevId: string, forslagId: string, til: ForslagStatus, svar: string | null): Promise<OppfolgingResultat> {
  const f = await prisma.trenerForslag.findUnique({ where: { id: forslagId }, select: { elevId: true, status: true } });
  if (!f || f.elevId !== elevId) return { ok: false, feil: "Fant ikke forslaget." };
  if (!kanSvare(tilStatus(f.status), til)) return { ok: false, feil: "Forslaget er allerede besvart." };
  const tekst = svar?.trim() ? svar.trim().slice(0, 1000) : null;
  // Betinget på status i selve oppdateringen, så to samtidige svar ikke begge går gjennom.
  const r = await prisma.trenerForslag.updateMany({ where: { id: forslagId, elevId, status: "VENTER" }, data: { status: til, svar: tekst, svartAt: new Date() } });
  if (r.count === 0) return { ok: false, feil: "Forslaget er allerede besvart." };
  await audit({ actorId: elevId, action: "trener_forslag.svar", target: forslagId, metadata: { status: til } });
  return { ok: true, data: null };
}

// ---------------------------------------------------------------- Samtale

export type SamtaleRad = {
  id: string;
  elevId: string;
  elevNavn: string;
  dato: Date;
  type: SamtaleType;
  avtalt: string;
  fireukerssjekkId: string | null;
};

function tilSamtaleType(v: string): SamtaleType {
  return v === "FIREUKERSSJEKK" || v === "OPPFOLGING" ? v : "ANNET";
}

export async function hentSamtaler(k: LesKontekst, elevId?: string): Promise<SamtaleRad[]> {
  const rader = await prisma.elevSamtale.findMany({
    where: { flate: k.flate, groupId: k.groupId, ...(elevId ? { elevId } : {}) },
    orderBy: [{ dato: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  const navn = await navnFor(rader.map((r) => r.elevId));
  return rader.map((r) => ({
    id: r.id,
    elevId: r.elevId,
    elevNavn: navn.get(r.elevId) ?? "Uten navn",
    dato: r.dato,
    type: tilSamtaleType(r.type),
    avtalt: r.avtalt,
    fireukerssjekkId: r.fireukerssjekkId,
  }));
}

export async function opprettSamtale(k: OppfolgingKontekst, rå: unknown): Promise<OppfolgingResultat<{ id: string }>> {
  const p = SamtaleInput.safeParse(rå);
  if (!p.success) return { ok: false, feil: p.error.issues[0]?.message ?? "Ugyldig samtale" };
  const dato = dagTilDato(p.data.dag);
  if (!dato) return { ok: false, feil: "Datoen finnes ikke." };
  if (!(await erAktivElev(k.groupId, p.data.elevId))) return { ok: false, feil: "Eleven er ikke aktiv spiller i gruppa di." };
  if (p.data.fireukerssjekkId) {
    // Koblingen må peke på en sjekk for samme elev i samme gruppe og flate.
    const sjekk = await prisma.fireukerssjekk.findFirst({
      where: { id: p.data.fireukerssjekkId, flate: k.flate, groupId: k.groupId, userId: p.data.elevId },
      select: { id: true },
    });
    if (!sjekk) return { ok: false, feil: "Fireukerssjekken hører ikke til denne eleven." };
  }
  const rad = await prisma.elevSamtale.create({
    data: {
      flate: k.flate,
      groupId: k.groupId,
      elevId: p.data.elevId,
      trenerId: k.trenerId,
      dato,
      type: p.data.type,
      avtalt: p.data.avtalt,
      fireukerssjekkId: p.data.fireukerssjekkId ?? null,
    },
    select: { id: true },
  });
  await audit({ actorId: k.trenerId, action: "elev_samtale.opprett", target: rad.id, metadata: { flate: k.flate, type: p.data.type } });
  return { ok: true, data: { id: rad.id } };
}

// ---------------------------------------------------------------- Oppsummering til «trenger deg»

export type OppfolgingTall = {
  /** Elever med forfalt, ikke levert fireukerssjekk. */
  sjekkIkkeLevert: string[];
  /** Elever med minst ett forslag som venter svar. */
  forslagVenter: string[];
};

/** Elev-id-er som trenger trenerens oppfølging, for WANG-43 og TN-01. Bare aktive elever i gruppa telles. */
export async function hentOppfolgingTall(k: LesKontekst, naa: Date): Promise<OppfolgingTall> {
  const [forfalt, venter] = await Promise.all([
    prisma.fireukerssjekk.findMany({
      where: { flate: k.flate, groupId: k.groupId, levertAt: null, frist: { lt: naa } },
      select: { userId: true },
    }),
    prisma.trenerForslag.findMany({
      where: { flate: k.flate, groupId: k.groupId, status: "VENTER" },
      select: { elevId: true },
    }),
  ]);
  const ider = [...new Set([...forfalt.map((r) => r.userId), ...venter.map((r) => r.elevId)])];
  if (ider.length === 0) return { sjekkIkkeLevert: [], forslagVenter: [] };
  const aktive = await prisma.groupMember.findMany({
    where: { groupId: k.groupId, userId: { in: ider }, ...aktivtSpillerMedlemskapWhere() },
    select: { userId: true },
  });
  const aktivSet = new Set(aktive.map((a) => a.userId));
  return {
    sjekkIkkeLevert: [...new Set(forfalt.map((r) => r.userId))].filter((id) => aktivSet.has(id)),
    forslagVenter: [...new Set(venter.map((r) => r.elevId))].filter((id) => aktivSet.has(id)),
  };
}

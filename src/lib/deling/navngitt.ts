import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertCoachRole, assertParentRole, assertSpillerRole } from "@/lib/auth/action-guards";
import { createClient } from "@/lib/supabase/server";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { TEAM_NORWAY_SLUG, aktivtSpillerMedlemskapWhere, aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { rateLimit } from "@/lib/rate-limit";
import {
  NAVNGITT_PROFIL_SCOPE, NAVNGITT_PROFIL_TEKST_VERSJON, trenerEpostDomene,
  NyTrenerInvitasjonSchema, AksepterTrenerInvitasjonSchema, TrekkTrenerDelingSchema, gjeldendeNavngittSamtykke,
} from "./navngitt-regler";

type Tx = Prisma.TransactionClient;
const aktiv = { deletedAt: null, anonymisertAt: null };
const feil = () => ({ ok: false as const, melding: "Delingen kunne ikke behandles. Kontroller valgene og prøv igjen." });
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

async function transaksjon<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let forsok = 0; ; forsok++) {
    try { return await prisma.$transaction(fn, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
    catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError) || !["P2034", "P2002"].includes(e.code) || forsok >= 2) throw e;
    }
  }
}
async function laasEier(tx: Tx, spillerId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`trenerdeling:${spillerId}`}, 0))::text`;
}
async function hentAktor() {
  const bruker = await getCurrentUser();
  return bruker?.role === "PARENT" ? assertParentRole(bruker) : assertSpillerRole(bruker);
}
async function foresattIder(tx: Tx, spillerId: string) {
  const relasjoner = await tx.parentRelation.findMany({
    where: { childId: spillerId, approved: true, parent: { ...aktiv, role: "PARENT" } }, select: { parentId: true },
  });
  return relasjoner.map((r) => r.parentId);
}
/** Identiteten kommer fra innlogging; en foresatt må ha en godkjent relasjon. */
async function aktorForSpiller(tx: Tx, aktorId: string, spillerId: string, gi: boolean) {
  const [aktor, spiller, foresatte] = await Promise.all([
    tx.user.findFirst({ where: { id: aktorId, ...aktiv }, select: { id: true, role: true } }),
    tx.user.findFirst({ where: { id: spillerId, ...aktiv }, select: { id: true, role: true, dateOfBirth: true, requiresGuardianConsent: true } }),
    foresattIder(tx, spillerId),
  ]);
  if (!aktor || !spiller || !["PLAYER", "COACH", "ADMIN"].includes(spiller.role)) return null;
  if (aktor.id === spiller.id && aktor.role !== "PARENT") {
    if (gi && maaHaForesattSamtykke(spiller)) return null;
    return "SELV" as const;
  }
  return aktor.role === "PARENT" && foresatte.includes(aktor.id) ? "FORESATT" as const : null;
}
/** WANG avgrenses til elevens skolegruppe. TN kan få eksplisitt deling fra WANG-elever uten TN-medlemskap. */
async function delingsMiljo(tx: Tx, spillerId: string, gruppeId: string, epost: string) {
  const domene = trenerEpostDomene(epost);
  const gruppe = await tx.group.findFirst({ where: { id: gruppeId, arkivertAt: null }, select: { id: true, slug: true, program: true } });
  if (!gruppe || !domene) return false;
  const wang = gruppe.program === "WANG_UNG" || gruppe.program === "WANG_TOPPIDRETT";
  if (domene === "WANG" && !wang) return false;
  if (domene === "TEAM_NORWAY" && gruppe.slug !== TEAM_NORWAY_SLUG) return false;
  const medlem = await tx.groupMember.findFirst({ where: {
    userId: spillerId, user: aktiv, ...aktivtSpillerMedlemskapWhere(),
    ...(domene === "WANG" ? { groupId: gruppe.id } : {
      group: { arkivertAt: null, OR: [{ program: { in: ["WANG_UNG", "WANG_TOPPIDRETT"] } }, { slug: TEAM_NORWAY_SLUG }] },
    }),
  }, select: { id: true } });
  return medlem !== null;
}
async function trenerIMiljo(tx: Tx, trenerId: string, gruppeId: string, epost: string) {
  const trener = await tx.user.findFirst({ where: { id: trenerId, ...aktiv, role: { in: ["COACH", "ADMIN"] } }, select: { email: true } });
  if (!trener || trener.email.trim().toLowerCase() !== epost) return false;
  return Boolean(await tx.groupMember.findFirst({ where: {
    groupId: gruppeId, ...aktivtTrenerMedlemskapWhere(trenerId), group: { arkivertAt: null },
  }, select: { id: true } }));
}

/** Lager en lenke, sender ingen e-post. Råtoken gis bare ved første vellykkede oppretting. */
export async function opprettTrenerInvitasjon(input: unknown) {
  const aktor = await hentAktor();
  const parsed = NyTrenerInvitasjonSchema.safeParse(input);
  if (!parsed.success) return feil();
  if (!(await rateLimit({ key: `trenerdeling:ny:${aktor.id}`, max: 10, windowMs: 60_000 })).ok) return feil();
  const p = parsed.data;
  const token = randomBytes(32).toString("hex");
  return transaksjon(async (tx) => {
    await laasEier(tx, p.spillerId);
    const rolle = await aktorForSpiller(tx, aktor.id, p.spillerId, true);
    if (!rolle || !(await delingsMiljo(tx, p.spillerId, p.gruppeId, p.epost))) return feil();
    const finnes = await tx.trenerDelingsInvitasjon.findUnique({ where: { id: p.requestId } });
    if (finnes) {
      if (finnes.userId !== p.spillerId || finnes.gittAvUserId !== aktor.id || finnes.mottakerGruppeId !== p.gruppeId || finnes.mottakerEpost !== p.epost || finnes.tekstVersjon !== p.tekstVersjon) return feil();
      return { ok: true as const, id: finnes.id, token: null, expiresAt: finnes.expiresAt.toISOString(), gjentatt: true };
    }
    const now = new Date();
    const rad = await tx.trenerDelingsInvitasjon.create({ data: {
      id: p.requestId, userId: p.spillerId, mottakerGruppeId: p.gruppeId, mottakerEpost: p.epost,
      tokenHash: tokenHash(token), tekstVersjon: p.tekstVersjon, gittAvUserId: aktor.id, gittAvRolle: rolle,
      createdAt: now, expiresAt: new Date(now.getTime() + 7 * 86_400_000),
    } });
    return { ok: true as const, id: rad.id, token, expiresAt: rad.expiresAt.toISOString(), gjentatt: false };
  });
}

/** Verifisert Auth-e-post er nødvendig; verken token eller et redigert profilfelt gir tilgang alene. */
export async function krevNavngittTrener() {
  const bruker = assertCoachRole(await getCurrentUser());
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  const auth = data.user;
  const epost = auth?.email?.trim().toLowerCase();
  if (error || !auth || auth.id !== bruker.authId || !auth.email_confirmed_at || !epost || epost !== bruker.email.trim().toLowerCase() || !trenerEpostDomene(epost)) throw new Error("forbidden");
  return { id: bruker.id, epost };
}

export async function aksepterTrenerInvitasjon(input: unknown) {
  const trener = await krevNavngittTrener();
  const parsed = AksepterTrenerInvitasjonSchema.safeParse(input);
  if (!parsed.success || !(await rateLimit({ key: `trenerdeling:aksept:${trener.id}`, max: 20, windowMs: 60_000 })).ok) return feil();
  const hash = tokenHash(parsed.data.token);
  return transaksjon(async (tx) => {
    const funnet = await tx.trenerDelingsInvitasjon.findUnique({ where: { tokenHash: hash }, select: { userId: true } });
    if (!funnet) return feil();
    await laasEier(tx, funnet.userId);
    const rad = await tx.trenerDelingsInvitasjon.findUnique({ where: { tokenHash: hash } });
    if (!rad || rad.revokedAt || rad.mottakerEpost !== trener.epost || rad.tekstVersjon !== NAVNGITT_PROFIL_TEKST_VERSJON) return feil();
    if (!(await delingsMiljo(tx, rad.userId, rad.mottakerGruppeId, trener.epost)) || !(await trenerIMiljo(tx, trener.id, rad.mottakerGruppeId, trener.epost))) return feil();
    const rolle = await aktorForSpiller(tx, rad.gittAvUserId, rad.userId, true);
    if (rolle !== rad.gittAvRolle) return feil();
    if (rad.acceptedAt) return rad.acceptedByUserId === trener.id ? { ok: true as const, id: rad.id, spillerId: rad.userId, gruppeId: rad.mottakerGruppeId, gjentatt: true } : feil();
    if (rad.expiresAt.getTime() <= Date.now()) return feil();
    await tx.trenerDelingsInvitasjon.update({ where: { id: rad.id }, data: { acceptedAt: new Date(), acceptedByUserId: trener.id } });
    await tx.delingsSamtykke.create({ data: {
      id: rad.id, userId: rad.userId, scope: NAVNGITT_PROFIL_SCOPE, mottakerGruppeId: rad.mottakerGruppeId,
      mottakerUserId: trener.id, gitt: true, tekstVersjon: rad.tekstVersjon, gittAvUserId: rad.gittAvUserId, gittAvRolle: rad.gittAvRolle,
    } });
    return { ok: true as const, id: rad.id, spillerId: rad.userId, gruppeId: rad.mottakerGruppeId, gjentatt: false };
  });
}

/** Kan trekkes etter utmelding/utløpt abonnement. Trekker også parallelle lenker til samme trener/miljø. */
export async function trekkTrenerDeling(input: unknown) {
  const aktor = await hentAktor();
  const parsed = TrekkTrenerDelingSchema.safeParse(input);
  if (!parsed.success) return feil();
  return transaksjon(async (tx) => {
    const p = parsed.data;
    await laasEier(tx, p.spillerId);
    const rolle = await aktorForSpiller(tx, aktor.id, p.spillerId, false);
    if (!rolle) return feil();
    const rad = await tx.trenerDelingsInvitasjon.findFirst({ where: { id: p.invitasjonId, userId: p.spillerId } });
    if (!rad) return feil();
    await tx.trenerDelingsInvitasjon.updateMany({ where: {
      userId: p.spillerId, mottakerGruppeId: rad.mottakerGruppeId, mottakerEpost: rad.mottakerEpost, revokedAt: null,
    }, data: { revokedAt: new Date() } });
    if (rad.acceptedByUserId) await tx.delingsSamtykke.create({ data: {
      id: randomUUID(), userId: p.spillerId, scope: NAVNGITT_PROFIL_SCOPE, mottakerGruppeId: rad.mottakerGruppeId,
      mottakerUserId: rad.acceptedByUserId, gitt: false, tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, gittAvUserId: aktor.id, gittAvRolle: rolle,
    } });
    return { ok: true as const };
  });
}

/** Felles port for nye fullprofil-oppslag. Må kjøres på hvert oppslag, aldri vedvarende mellomlagres. */
export async function navngittTrenerHarTilgang(tx: Tx, trener: { id: string; epost: string }, spillerId: string, gruppeId: string) {
  // Lesing og tilbaketrekking har samme lås. Behold transaksjonen gjennom dataoppslaget.
  await laasEier(tx, spillerId);
  if (!(await delingsMiljo(tx, spillerId, gruppeId, trener.epost)) || !(await trenerIMiljo(tx, trener.id, gruppeId, trener.epost))) return false;
  const [spiller, foresatte, rader] = await Promise.all([
    tx.user.findFirst({ where: { id: spillerId, ...aktiv }, select: { requiresGuardianConsent: true, dateOfBirth: true } }),
    foresattIder(tx, spillerId),
    tx.delingsSamtykke.findMany({ where: { userId: spillerId, scope: NAVNGITT_PROFIL_SCOPE, mottakerGruppeId: gruppeId, mottakerUserId: trener.id }, orderBy: { createdAt: "desc" }, take: 2 }),
  ]);
  if (!spiller) return false;
  const samtykke = gjeldendeNavngittSamtykke(rader, { gruppeId, trenerId: trener.id, spillerId, kreverForesatt: maaHaForesattSamtykke(spiller), foresattIder: foresatte });
  if (!samtykke) return false;
  return Boolean(await tx.trenerDelingsInvitasjon.findFirst({ where: {
    id: samtykke.id, userId: spillerId, mottakerGruppeId: gruppeId, mottakerEpost: trener.epost,
    acceptedByUserId: trener.id, acceptedAt: { not: null }, revokedAt: null,
  }, select: { id: true } }));
}

const DelingsOversikt = z.object({
  spillerId: z.string().min(1).max(120).optional(),
  forDato: z.iso.datetime().optional(), forId: z.string().min(1).max(120).optional(),
}).strict().refine((p) => Boolean(p.forDato) === Boolean(p.forId));

/** Eier/foresatt ser egne delinger også etter utmelding. Aldri token eller hash. */
export async function hentEgenTrenerdeling(input: unknown = {}) {
  const aktor = await hentAktor();
  const parsed = DelingsOversikt.safeParse(input);
  if (!parsed.success) return null;
  const p = parsed.data;
  const spillerId = p.spillerId ?? aktor.id;
  return prisma.$transaction(async (tx) => {
    await laasEier(tx, spillerId);
    if (!(await aktorForSpiller(tx, aktor.id, spillerId, false))) return null;
    const spiller = await tx.user.findUniqueOrThrow({ where: { id: spillerId }, select: { id: true, name: true } });
    const medlemskap = await tx.groupMember.findMany({ where: {
      userId: spillerId, ...aktivtSpillerMedlemskapWhere(), group: { arkivertAt: null,
        OR: [{ program: { in: ["WANG_UNG", "WANG_TOPPIDRETT"] } }, { slug: TEAM_NORWAY_SLUG }],
      },
    }, select: { group: { select: { id: true, name: true, slug: true, program: true } } } });
    const tn = medlemskap.length ? await tx.group.findUnique({ where: { slug: TEAM_NORWAY_SLUG, arkivertAt: null }, select: { id: true, name: true, slug: true, program: true } }) : null;
    const grupper = [...new Map([...medlemskap.map((m) => m.group), ...(tn ? [tn] : [])].map((g) => [g.id, g])).values()];
    const rader = await tx.trenerDelingsInvitasjon.findMany({ where: {
      userId: spillerId, ...(p.forDato && p.forId ? { OR: [
        { createdAt: { lt: new Date(p.forDato) } }, { createdAt: new Date(p.forDato), id: { lt: p.forId } },
      ] } : {}),
    }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 21,
    select: { id: true, mottakerGruppeId: true, mottakerEpost: true, gittAvRolle: true,
      createdAt: true, expiresAt: true, acceptedAt: true, revokedAt: true, acceptedByUserId: true },
    });
    const side = rader.slice(0, 20), siste = side.at(-1);
    const gruppenavn = await tx.group.findMany({ where: { id: { in: side.map((r) => r.mottakerGruppeId) } }, select: { id: true, name: true } });
    const navn = new Map(gruppenavn.map((g) => [g.id, g.name]));
    return {
      spiller, foresattVisning: aktor.id !== spillerId,
      kanGi: Boolean(medlemskap.length && await aktorForSpiller(tx, aktor.id, spillerId, true)),
      grupper: grupper.map((g) => ({ id: g.id, navn: g.name, domene: g.slug === TEAM_NORWAY_SLUG ? "golfforbundet.no" : "wang.no" })),
      nesteSide: rader.length > 20 && siste ? { forDato: siste.createdAt.toISOString(), forId: siste.id } : null,
      invitasjoner: await Promise.all(side.map(async (r) => ({
        id: r.id, gruppeNavn: navn.get(r.mottakerGruppeId) ?? "Tidligere miljø", epost: r.mottakerEpost,
        gittAvRolle: r.gittAvRolle, opprettet: r.createdAt.toISOString(), utlop: r.expiresAt.toISOString(),
        status: r.revokedAt ? "TRUKKET" as const : r.acceptedAt ? (
          r.acceptedByUserId && await navngittTrenerHarTilgang(tx, { id: r.acceptedByUserId, epost: r.mottakerEpost }, spillerId, r.mottakerGruppeId)
            ? "AKTIV" as const : "STENGT" as const
        ) : r.expiresAt.getTime() <= Date.now() ? "UTLOPT" as const : "VENTER" as const,
      }))),
    };
  });
}

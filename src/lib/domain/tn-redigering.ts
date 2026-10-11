import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { hentTnArbeidskontekst, type TnArbeidskontekst, type TnBruker } from "@/lib/domain/tn-arbeidsflate";
import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage/supabase-storage";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";

/**
 * Skrivelaget for Team Norway-skjermene (Anders 27.09.2026: alle logiske knapper).
 * Samlinger og økter er gruppehendelser (`GroupSchedule`), samlinger med
 * kind «SAMLING» som i gruppekalenderen. Uttak, spillerstatus og college har
 * egne tabeller (scripts/add-tn-handlinger-2026-09-27.ts).
 *
 * Tilgang: trener i Team Norway-gruppen eller plattformadmin
 * (`kanAdministrere`), som ellers i Team Norway. Plattformrollen kreves ikke
 * (Anders 26.09.2026). Hver skriving er avgrenset til gruppen i konteksten, så
 * en id fra en annen gruppe gir «finnes ikke», aldri en endring.
 */

export type TnSkrivResultat<T = undefined> = { ok: true; data?: T } | { ok: false; feil: string };

class TnSkrivFeil extends Error {}

async function krevTrener(bruker: TnBruker): Promise<TnArbeidskontekst> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst?.kanAdministrere) throw new TnSkrivFeil("Bare trenere i Team Norway-gruppen kan gjøre dette.");
  return kontekst;
}

async function krevSpillerIGruppe(groupId: string, userId: string) {
  const medlem = await prisma.groupMember.findFirst({ where: { groupId, userId, ...aktivtSpillerMedlemskapWhere() }, select: { id: true } });
  if (!medlem) throw new TnSkrivFeil("Spilleren er ikke med i gruppen.");
  return medlem;
}

type SpillerdataDb = Pick<Prisma.TransactionClient, "tnSpillerstatus" | "tnCollege">;

/**
 * Spillerens egne data (lisens, helseattest, antidoping, college) skrives bare
 * når spilleren har delt profilen med denne treneren (D-04, D-05, TO-04).
 * Delingen kontrolleres under samme lås som tilbaketrekking. Plattform-ADMIN
 * er AK Golf, ikke organisasjonen, og slipper gjennom som før.
 */
async function skrivMedDeling<T>(
  bruker: TnBruker,
  gruppeId: string,
  spillerId: string,
  skriv: (db: SpillerdataDb) => Promise<T>,
): Promise<T> {
  if (bruker.role === "ADMIN") return skriv(prisma);
  const resultat = await medNavngittProfil(bruker.id, spillerId, gruppeId, async (tx) => ({ verdi: await skriv(tx) }));
  if (!resultat) throw new TnSkrivFeil("Spilleren har ikke delt profilen med deg.");
  return resultat.verdi;
}

async function kjor<T>(fn: () => Promise<T>, standardfeil: string): Promise<TnSkrivResultat<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof TnSkrivFeil) return { ok: false, feil: err.message };
    console.error("[tn-redigering]", err);
    return { ok: false, feil: standardfeil };
  }
}

const dagStreng = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Velg en dato.");
const tekst = (maks: number) => z.string().trim().max(maks);

/** «2026-10-19» + «08:30» (Oslo) → tidspunkt. */
function osloTid(dag: string, klokke = "00:00") {
  const [a, m, d] = dag.split("-").map(Number);
  const [t, min] = klokke.split(":").map(Number);
  return naivOsloTilTidspunkt(new Date(a!, m! - 1, d!, t ?? 0, min ?? 0));
}

// ── Samlinger (TN-04) ──

export const SamlingSchema = z.object({
  tittel: tekst(200).min(1, "Skriv et navn på samlingen."),
  sted: tekst(200).optional(),
  fra: dagStreng,
  til: dagStreng,
  notat: tekst(4000).optional(),
});

export async function lagreSamling(bruker: TnBruker, id: string | null, input: unknown): Promise<TnSkrivResultat<{ id: string }>> {
  const parsed = SamlingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  const d = parsed.data;
  if (d.til < d.fra) return { ok: false, feil: "Sluttdato kan ikke være før startdato." };
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const data = { title: d.tittel, location: d.sted || null, description: d.notat || null, startAt: osloTid(d.fra), endAt: osloTid(d.til, "23:59"), kind: "SAMLING" };
    if (id) {
      const { count } = await prisma.groupSchedule.updateMany({ where: { id, groupId: kontekst.gruppe.id, kind: "SAMLING" }, data });
      if (count === 0) throw new TnSkrivFeil("Samlingen finnes ikke.");
      return { id };
    }
    const ny = await prisma.groupSchedule.create({ data: { ...data, groupId: kontekst.gruppe.id, recurring: "NONE" }, select: { id: true } });
    return { id: ny.id };
  }, "Kunne ikke lagre samlingen.");
}

export async function slettSamling(bruker: TnBruker, id: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const { count } = await prisma.groupSchedule.deleteMany({ where: { id, groupId: kontekst.gruppe.id, kind: "SAMLING" } });
    if (count === 0) throw new TnSkrivFeil("Samlingen finnes ikke.");
    return undefined;
  }, "Kunne ikke slette samlingen.");
}

// ── Økter i månedsplanen (TN-11) ──

/** Vanlige økter har kind null. `NOT { kind }` ville utelatt null-radene i SQL. */
const IKKE_SAMLING = { OR: [{ kind: null }, { kind: { not: "SAMLING" } }] };

const klokkeStreng = z.string().regex(/^\d{2}:\d{2}$/, "Velg klokkeslett.");

export const OktSchema = z.object({
  tittel: tekst(200).min(1, "Skriv hva økten er."),
  dato: dagStreng,
  fra: klokkeStreng,
  til: klokkeStreng,
  sted: tekst(200).optional(),
  beskrivelse: tekst(4000).optional(),
});

export async function lagreOkt(bruker: TnBruker, id: string | null, input: unknown): Promise<TnSkrivResultat<{ id: string }>> {
  const parsed = OktSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  const d = parsed.data;
  if (d.til <= d.fra) return { ok: false, feil: "Økten må slutte etter at den starter." };
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const data = { title: d.tittel, location: d.sted || null, description: d.beskrivelse || null, startAt: osloTid(d.dato, d.fra), endAt: osloTid(d.dato, d.til) };
    if (id) {
      const { count } = await prisma.groupSchedule.updateMany({ where: { id, groupId: kontekst.gruppe.id, ...IKKE_SAMLING }, data });
      if (count === 0) throw new TnSkrivFeil("Økten finnes ikke.");
      return { id };
    }
    const ny = await prisma.groupSchedule.create({ data: { ...data, groupId: kontekst.gruppe.id, recurring: "NONE" }, select: { id: true } });
    return { id: ny.id };
  }, "Kunne ikke lagre økten.");
}

export async function slettOkt(bruker: TnBruker, id: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const { count } = await prisma.groupSchedule.deleteMany({ where: { id, groupId: kontekst.gruppe.id, ...IKKE_SAMLING } });
    if (count === 0) throw new TnSkrivFeil("Økten finnes ikke.");
    return undefined;
  }, "Kunne ikke slette økten.");
}

// ── Testdag (TN-03) ──

export const TestdagEndreSchema = z.object({
  tittel: tekst(200).min(1, "Skriv et navn på testdagen."),
  sted: tekst(200).optional(),
  tidspunkt: z.string().datetime({ message: "Ugyldig tidspunkt." }),
});

export async function endreTestdag(bruker: TnBruker, id: string, input: unknown): Promise<TnSkrivResultat> {
  const parsed = TestdagEndreSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const { count } = await prisma.testDay.updateMany({
      where: { id, groupId: kontekst.gruppe.id, status: { in: ["PLANNED", "ACTIVE"] } },
      data: { title: parsed.data.tittel, location: parsed.data.sted || null, scheduledAt: new Date(parsed.data.tidspunkt) },
    });
    if (count === 0) throw new TnSkrivFeil("Testdagen finnes ikke, eller er avsluttet.");
    return undefined;
  }, "Kunne ikke endre testdagen.");
}

/** Sletter bare en testdag uten førte resultater. Førte resultater er målinger og slettes aldri herfra. */
export async function slettTestdag(bruker: TnBruker, id: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const dag = await prisma.testDay.findFirst({ where: { id, groupId: kontekst.gruppe.id }, select: { participants: { where: { status: "DONE" }, select: { id: true } } } });
    if (!dag) throw new TnSkrivFeil("Testdagen finnes ikke.");
    if (dag.participants.length > 0) throw new TnSkrivFeil("Testdagen har førte resultater og kan ikke slettes. Avslutt den i stedet.");
    await prisma.testDay.delete({ where: { id } });
    return undefined;
  }, "Kunne ikke slette testdagen.");
}

// ── Gruppeposter og dokumenter (TN-13, TN-14) ──

async function postTilgang(bruker: TnBruker, postId: string) {
  const post = await prisma.tnPost.findUnique({ where: { id: postId }, select: { id: true, groupId: true, authorUserId: true, kind: true, vedlegg: { select: { id: true, path: true } } } });
  if (!post?.groupId) throw new TnSkrivFeil("Innlegget finnes ikke.");
  const kontekst = await hentTnArbeidskontekst(bruker);
  const erForfatter = post.authorUserId === bruker.id;
  const erTrener = kontekst?.gruppe.id === post.groupId && kontekst.kanAdministrere;
  return { post, erForfatter, erTrener };
}

export async function endrePost(bruker: TnBruker, postId: string, nyTekst: unknown): Promise<TnSkrivResultat<{ groupId: string }>> {
  const parsed = tekst(2000).min(1, "Innlegget kan ikke være tomt.").safeParse(nyTekst);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig tekst." };
  return kjor(async () => {
    const { post, erForfatter } = await postTilgang(bruker, postId);
    if (!erForfatter) throw new TnSkrivFeil("Bare den som skrev innlegget kan endre det.");
    await prisma.tnPost.update({ where: { id: post.id }, data: { tekst: parsed.data, editedAt: new Date() } });
    return { groupId: post.groupId! };
  }, "Kunne ikke endre innlegget.");
}

export async function slettPost(bruker: TnBruker, postId: string): Promise<TnSkrivResultat<{ groupId: string }>> {
  return kjor(async () => {
    const { post, erForfatter, erTrener } = await postTilgang(bruker, postId);
    if (!erForfatter && !erTrener) throw new TnSkrivFeil("Bare forfatteren eller en trener kan slette innlegget.");
    await prisma.tnPost.delete({ where: { id: post.id } });
    await Promise.all(post.vedlegg.map((v) => deleteFile(STORAGE_BUCKETS.TN_POST_VEDLEGG, v.path)));
    return { groupId: post.groupId! };
  }, "Kunne ikke slette innlegget.");
}

/** Sletter ett dokument. Er det eneste vedlegget på en ren opplasting, går opplastingen også. */
export async function slettDokument(bruker: TnBruker, attachmentId: string): Promise<TnSkrivResultat<{ groupId: string }>> {
  return kjor(async () => {
    const vedlegg = await prisma.tnPostAttachment.findUnique({ where: { id: attachmentId }, select: { id: true, path: true, postId: true } });
    if (!vedlegg) throw new TnSkrivFeil("Dokumentet finnes ikke.");
    const { post, erForfatter, erTrener } = await postTilgang(bruker, vedlegg.postId);
    if (!erForfatter && !erTrener) throw new TnSkrivFeil("Bare den som lastet opp eller en trener kan slette dokumentet.");
    if (post.kind === "DOKUMENT" && post.vedlegg.length === 1) await prisma.tnPost.delete({ where: { id: post.id } });
    else await prisma.tnPostAttachment.delete({ where: { id: vedlegg.id } });
    await deleteFile(STORAGE_BUCKETS.TN_POST_VEDLEGG, vedlegg.path);
    return { groupId: post.groupId! };
  }, "Kunne ikke slette dokumentet.");
}

// ── Uttak (TN-05) ──

export const UTTAK_STATUS = ["UTTATT", "RESERVE", "IKKE_UTTATT"] as const;

export const UttakSchema = z.object({
  spillerId: z.string().min(1).max(64),
  arrangement: tekst(200).min(1, "Skriv hvilket arrangement uttaket gjelder."),
  status: z.enum(UTTAK_STATUS),
  begrunnelse: tekst(2000).optional(),
});

export async function lagreUttak(bruker: TnBruker, input: unknown): Promise<TnSkrivResultat> {
  const parsed = UttakSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  const d = parsed.data;
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    await krevSpillerIGruppe(kontekst.gruppe.id, d.spillerId);
    await prisma.tnUttak.upsert({
      where: { groupId_userId_arrangement: { groupId: kontekst.gruppe.id, userId: d.spillerId, arrangement: d.arrangement } },
      create: { groupId: kontekst.gruppe.id, userId: d.spillerId, arrangement: d.arrangement, status: d.status, begrunnelse: d.begrunnelse || null, decidedById: bruker.id },
      update: { status: d.status, begrunnelse: d.begrunnelse || null, decidedById: bruker.id, decidedAt: new Date() },
    });
    return undefined;
  }, "Kunne ikke lagre uttaket.");
}

export async function slettUttak(bruker: TnBruker, id: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const { count } = await prisma.tnUttak.deleteMany({ where: { id, groupId: kontekst.gruppe.id } });
    if (count === 0) throw new TnSkrivFeil("Uttaket finnes ikke.");
    return undefined;
  }, "Kunne ikke fjerne uttaket.");
}

// ── Lisens, helseattest og antidoping (TN-10) ──

export const LISENS_STATUS = ["BETALT", "UBETALT", "FRITAK"] as const;
const valgfriDag = z.union([dagStreng, z.literal("")]).optional();

export const SpillerstatusSchema = z.object({
  spillerId: z.string().min(1).max(64),
  aar: z.number().int().min(2000).max(2100),
  lisensStatus: z.union([z.enum(LISENS_STATUS), z.literal("")]).optional(),
  lisensBetaltDato: valgfriDag,
  helseattestUtloper: valgfriDag,
  antidopingSignert: valgfriDag,
});

const somDato = (v: string | undefined) => (v ? new Date(`${v}T00:00:00.000Z`) : null);

export async function lagreSpillerstatus(bruker: TnBruker, input: unknown): Promise<TnSkrivResultat> {
  const parsed = SpillerstatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  const d = parsed.data;
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    await krevSpillerIGruppe(kontekst.gruppe.id, d.spillerId);
    const data = {
      lisensStatus: d.lisensStatus || null,
      lisensBetaltDato: somDato(d.lisensBetaltDato),
      helseattestUtloper: somDato(d.helseattestUtloper),
      antidopingSignert: somDato(d.antidopingSignert),
      updatedById: bruker.id,
    };
    await skrivMedDeling(bruker, kontekst.gruppe.id, d.spillerId, (db) => db.tnSpillerstatus.upsert({
      where: { groupId_userId_aar: { groupId: kontekst.gruppe.id, userId: d.spillerId, aar: d.aar } },
      create: { groupId: kontekst.gruppe.id, userId: d.spillerId, aar: d.aar, ...data },
      update: data,
    }));
    return undefined;
  }, "Kunne ikke lagre statusen.");
}

// ── College (TN-06) ──

export const COLLEGE_STATUS = ["INTERESSE", "DIALOG", "TILBUD", "SIGNERT", "STUDERER"] as const;

export const CollegeSchema = z.object({
  spillerId: z.string().min(1).max(64),
  skole: tekst(200).min(1, "Skriv hvilket college det gjelder."),
  status: z.enum(COLLEGE_STATUS),
  startDato: valgfriDag,
  notat: tekst(2000).optional(),
});

export async function lagreCollege(bruker: TnBruker, input: unknown): Promise<TnSkrivResultat> {
  const parsed = CollegeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldige felt." };
  const d = parsed.data;
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    await krevSpillerIGruppe(kontekst.gruppe.id, d.spillerId);
    const data = { skole: d.skole, status: d.status, startDato: somDato(d.startDato), notat: d.notat || null, updatedById: bruker.id };
    await skrivMedDeling(bruker, kontekst.gruppe.id, d.spillerId, (db) => db.tnCollege.upsert({
      where: { groupId_userId: { groupId: kontekst.gruppe.id, userId: d.spillerId } },
      create: { groupId: kontekst.gruppe.id, userId: d.spillerId, ...data },
      update: data,
    }));
    return undefined;
  }, "Kunne ikke lagre college-statusen.");
}

export async function slettCollege(bruker: TnBruker, spillerId: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const { count } = await skrivMedDeling(bruker, kontekst.gruppe.id, spillerId,
      (db) => db.tnCollege.deleteMany({ where: { groupId: kontekst.gruppe.id, userId: spillerId } }));
    if (count === 0) throw new TnSkrivFeil("Spilleren har ingen college-status.");
    return undefined;
  }, "Kunne ikke fjerne college-statusen.");
}

// ── Spillere i gruppen (TN-19) ──

/** Avslutter spillerens medlemskap (endedAt). Historikken beholdes. */
export async function avsluttSpiller(bruker: TnBruker, spillerId: string): Promise<TnSkrivResultat> {
  return kjor(async () => {
    const kontekst = await krevTrener(bruker);
    const medlem = await krevSpillerIGruppe(kontekst.gruppe.id, spillerId);
    await prisma.groupMember.update({ where: { id: medlem.id }, data: { endedAt: new Date() } });
    return undefined;
  }, "Kunne ikke avslutte medlemskapet.");
}

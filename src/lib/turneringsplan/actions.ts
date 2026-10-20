"use server";

/**
 * Turneringsplanleggeren: endringer i spillerens plan.
 * - Spilleren endrer sin egen plan.
 * - AK Golf-coachen endrer direkte (skrivetilgang, `harCoachTilgangTilSpiller`). Spilleren får beskjed og kan angre.
 * - Team Norway-treneren foreslår. Forslaget lagres separat (PlanAction) under delingslåsen, og
 *   planen endres først når spilleren godtar.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCoachActionUser, requireSpillerActionUser } from "@/lib/auth/action-guards";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { notify } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { FORSLAG_TYPE, ForslagSchema, forslagTilPlan, type TurneringsForslag } from "./data";
import { tierFra, type PlanTier } from "./wagr-modell";

type Svar = { ok: true; melding?: string } | { ok: false; feil: string };
type Db = Prisma.TransactionClient;

const Id = z.string().min(1).max(120);
const Tier = z.enum(["A", "B", "C"]);
const LeggTil = z.object({ spillerId: Id.optional(), wagrPlanEventId: Id, tier: Tier.optional() }).strict();
const Endre = z.object({ spillerId: Id.optional(), entryId: Id }).strict();
const Prio = z.object({ spillerId: Id.optional(), entryId: Id, tier: Tier }).strict();
const Fyll = z.object({ spillerId: Id.optional() }).strict();
const Foreslaa = z.object({
  spillerId: Id, handling: z.enum(["ADD", "REMOVE"]), wagrPlanEventId: Id, begrunnelse: z.string().trim().max(1000).optional(),
}).strict();
const Svarinput = z.object({ actionId: Id, beslutning: z.enum(["ACCEPTED", "REJECTED"]) }).strict();
const Trekk = z.object({ actionId: Id }).strict();

function revalider(spillerId: string) {
  revalidatePath("/portal/tren/turneringer");
  revalidatePath(`/admin/spillere/${spillerId}/turneringsplan`);
  revalidatePath(`/team-norway/spiller/${spillerId}/turneringsplan`);
}

/** Hvem skriver: spilleren selv, eller en AK Golf-coach med skrivetilgang. Organisasjonstrenere skriver aldri. */
async function skriver(spillerId: string | undefined): Promise<{ ok: true; spillerId: string; coach: { id: string; name: string | null } | null } | { ok: false; feil: string }> {
  if (!spillerId) {
    const spiller = await requireSpillerActionUser();
    return { ok: true, spillerId: spiller.id, coach: null };
  }
  const coach = await requireCoachActionUser();
  if (coach.id === spillerId) return { ok: true, spillerId, coach: null };
  if (!(await harCoachTilgangTilSpiller(coach, spillerId))) return { ok: false, feil: "Du kan ikke endre denne spillerens plan." };
  return { ok: true, spillerId, coach: { id: coach.id, name: coach.name } };
}

async function varsleSpiller(coach: { name: string | null } | null, spillerId: string, tekst: string) {
  if (!coach) return;
  await notify({ userId: spillerId, type: "plan", title: `${coach.name ?? "Coachen"} endret turneringsplanen`, body: `${tekst} Du kan angre i Turneringer.`, link: "/portal/tren/turneringer" });
}

async function leggInn(db: Db, spillerId: string, wagrPlanEventId: string, tier?: PlanTier): Promise<string | null> {
  const ev = await db.wagrPlanEvent.findUnique({ where: { id: wagrPlanEventId }, select: { id: true, name: true, power: true, country: true } });
  if (!ev) return null;
  const finnes = await db.tournamentEntry.findFirst({ where: { userId: spillerId, wagrPlanEventId, entryStatus: { not: "WITHDRAWN" } }, select: { id: true } });
  if (!finnes) {
    const t = tier ?? tierFra(ev);
    await db.tournamentEntry.create({ data: {
      userId: spillerId, wagrPlanEventId, manualName: ev.name, planTier: t,
      priority: t === "A" ? "MAJOR" : t === "C" ? "LOCAL" : "NORMAL", entryStatus: "PLANNED",
    } });
  }
  return ev.name;
}

export async function leggTilIPlan(input: unknown): Promise<Svar> {
  const p = LeggTil.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig turnering." };
  const s = await skriver(p.data.spillerId);
  if (!s.ok) return s;
  const navn = await leggInn(prisma, s.spillerId, p.data.wagrPlanEventId, p.data.tier);
  if (!navn) return { ok: false, feil: "Turneringen finnes ikke i katalogen." };
  await varsleSpiller(s.coach, s.spillerId, `${navn} er lagt til.`);
  revalider(s.spillerId);
  return { ok: true, melding: `${navn} er lagt til.` };
}

export async function fjernFraPlan(input: unknown): Promise<Svar> {
  const p = Endre.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig rad." };
  const s = await skriver(p.data.spillerId);
  if (!s.ok) return s;
  const e = await prisma.tournamentEntry.findFirst({ where: { id: p.data.entryId, userId: s.spillerId }, select: { id: true, entryStatus: true, manualName: true, tournament: { select: { name: true } } } });
  if (!e) return { ok: false, feil: "Fant ikke turneringen i planen." };
  if (e.entryStatus !== "PLANNED") return { ok: false, feil: "Spilleren har meldt seg på. Trekk påmeldingen på siden for turneringen først." };
  await prisma.tournamentEntry.deleteMany({ where: { id: e.id, userId: s.spillerId, entryStatus: "PLANNED" } });
  const navn = e.manualName ?? e.tournament?.name ?? "Turneringen";
  await varsleSpiller(s.coach, s.spillerId, `${navn} er fjernet.`);
  revalider(s.spillerId);
  return { ok: true, melding: `${navn} er fjernet.` };
}

export async function settPrioritet(input: unknown): Promise<Svar> {
  const p = Prio.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig prioritet." };
  const s = await skriver(p.data.spillerId);
  if (!s.ok) return s;
  const t = p.data.tier;
  const r = await prisma.tournamentEntry.updateMany({
    where: { id: p.data.entryId, userId: s.spillerId },
    data: { planTier: t, priority: t === "A" ? "MAJOR" : t === "C" ? "LOCAL" : "NORMAL" },
  });
  if (r.count !== 1) return { ok: false, feil: "Fant ikke turneringen i planen." };
  revalider(s.spillerId);
  return { ok: true, melding: `Prioritet ${t}.` };
}

/** Fyller planen opp til 14 WAGR-turneringer med forslaget. Ingenting som står der, fjernes. */
export async function fyllMedForslag(input: unknown): Promise<Svar> {
  const p = Fyll.safeParse(input ?? {});
  if (!p.success) return { ok: false, feil: "Ugyldig forespørsel." };
  const s = await skriver(p.data.spillerId);
  if (!s.ok) return s;
  const nye = await prisma.$transaction(async (tx) => {
    const forslag = await forslagTilPlan(tx, s.spillerId);
    for (const f of forslag) await leggInn(tx, s.spillerId, f.id, f.tier);
    return forslag.length;
  }, { timeout: 30_000 });
  if (nye) await varsleSpiller(s.coach, s.spillerId, `${nye} turneringer er lagt til fra forslaget.`);
  revalider(s.spillerId);
  return { ok: true, melding: nye ? `${nye} turneringer lagt til fra forslaget.` : "Planen er alt full, eller ingen turneringer passer." };
}

/** Team Norway-treneren sender et forslag. Spillerens plan røres ikke. */
export async function foreslaaTurnering(input: unknown): Promise<Svar> {
  const trener = await requireCoachActionUser({ tillatDemo: true });
  const p = Foreslaa.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig forslag." };
  if (!(await rateLimit({ key: `turneringsforslag:${trener.id}`, max: 30, windowMs: 60_000 })).ok) return { ok: false, feil: "Vent litt før du sender flere forslag." };
  const kontekst = await hentTnArbeidskontekst(trener);
  if (!kontekst || kontekst.erSpiller || kontekst.rolle !== "COACH") return { ok: false, feil: "Du har ikke trenerrolle i Team Norway." };
  const suggestion: TurneringsForslag = {
    versjon: 1, kind: "TOURNAMENT", organisasjon: "TEAM_NORWAY", handling: p.data.handling,
    wagrPlanEventId: p.data.wagrPlanEventId, begrunnelse: p.data.begrunnelse ?? "",
  };
  const laget = await medNavngittProfil(trener.id, p.data.spillerId, kontekst.gruppe.id, async (tx) => {
    const ev = await tx.wagrPlanEvent.findUnique({ where: { id: p.data.wagrPlanEventId }, select: { name: true } });
    if (!ev) return null;
    const apne = await tx.planAction.findMany({ where: { userId: p.data.spillerId, coachId: trener.id, actionType: FORSLAG_TYPE, status: "PENDING" }, select: { suggestion: true } });
    if (apne.some((a) => { const f = ForslagSchema.safeParse(a.suggestion); return f.success && f.data.wagrPlanEventId === p.data.wagrPlanEventId; })) return ev;
    await tx.planAction.create({ data: {
      userId: p.data.spillerId, coachId: trener.id, actionType: FORSLAG_TYPE, agentName: "TEAM_NORWAY_COACH",
      suggestion: suggestion satisfies Prisma.InputJsonObject, status: "PENDING",
    } });
    return ev;
  });
  if (!laget) return { ok: false, feil: "Spillerens deling er ikke aktiv, eller turneringen finnes ikke." };
  await notify({ userId: p.data.spillerId, type: "plan", title: "Forslag til turneringsplanen", body: `${trener.name ?? "Team Norway"} foreslår: ${p.data.handling === "ADD" ? "legg til" : "fjern"} ${laget.name}.`, link: "/portal/tren/turneringer" });
  revalider(p.data.spillerId);
  return { ok: true, melding: `Forslaget er sendt: ${laget.name}.` };
}

/** Treneren trekker sitt eget, ubesvarte forslag. */
export async function trekkForslag(input: unknown): Promise<Svar> {
  const trener = await requireCoachActionUser({ tillatDemo: true });
  const p = Trekk.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig forslag." };
  const a = await prisma.planAction.findFirst({ where: { id: p.data.actionId, coachId: trener.id, actionType: FORSLAG_TYPE, status: "PENDING" }, select: { id: true, userId: true } });
  if (!a) return { ok: false, feil: "Forslaget er alt besvart eller trukket." };
  await prisma.planAction.updateMany({ where: { id: a.id, status: "PENDING" }, data: { status: "WITHDRAWN", decidedAt: new Date(), decidedById: trener.id } });
  revalider(a.userId);
  return { ok: true, melding: "Forslaget er trukket tilbake." };
}

/** Spilleren godtar eller avviser. Godtatt forslag endrer planen i samme transaksjon, bare én gang. */
export async function svarPaTurneringsforslag(input: unknown): Promise<Svar> {
  const spiller = await requireSpillerActionUser();
  const p = Svarinput.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig svar." };
  const svar = await prisma.$transaction(async (tx): Promise<Svar> => {
    const a = await tx.planAction.findFirst({ where: { id: p.data.actionId, userId: spiller.id, actionType: FORSLAG_TYPE, status: "PENDING" }, select: { id: true, suggestion: true } });
    if (!a) return { ok: false, feil: "Forslaget er alt besvart." };
    const f = ForslagSchema.safeParse(a.suggestion);
    if (!f.success) return { ok: false, feil: "Forslaget kan ikke behandles." };
    const claimed = await tx.planAction.updateMany({ where: { id: a.id, status: "PENDING" }, data: { status: p.data.beslutning, decidedAt: new Date(), decidedById: spiller.id } });
    if (claimed.count !== 1) return { ok: false, feil: "Forslaget er alt besvart." };
    if (p.data.beslutning === "REJECTED") return { ok: true, melding: "Forslaget er avvist." };
    if (f.data.handling === "ADD") {
      const navn = await leggInn(tx, spiller.id, f.data.wagrPlanEventId);
      return navn ? { ok: true, melding: `${navn} er lagt til.` } : { ok: false, feil: "Turneringen finnes ikke lenger." };
    }
    await tx.tournamentEntry.deleteMany({ where: { userId: spiller.id, wagrPlanEventId: f.data.wagrPlanEventId, entryStatus: "PLANNED" } });
    return { ok: true, melding: "Turneringen er fjernet." };
  });
  revalider(spiller.id);
  return svar;
}

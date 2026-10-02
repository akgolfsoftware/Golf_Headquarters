"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCoachActionUser, requireSpillerActionUser } from "@/lib/auth/action-guards";
import { aktivtTrenerMedlemskapWhere, TEAM_NORWAY_SLUG } from "@/lib/domain/grupper";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { rateLimit } from "@/lib/rate-limit";

const Innslag = z.object({
  date: z.iso.date(), startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(5).max(600), title: z.string().trim().min(1).max(120),
  pyramid: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  location: z.string().trim().max(120).optional().nullable(),
}).strict();
const LagForslagSchema = z.object({
  organisasjon: z.enum(["WANG", "TEAM_NORWAY"]), spillerId: z.string().min(1).max(120),
  handling: z.enum(["ADD", "UPDATE", "CANCEL"]), sessionId: z.string().min(1).max(120).optional(),
  etter: Innslag.optional(), begrunnelse: z.string().trim().min(5).max(1000),
}).strict().superRefine((v, ctx) => {
  if (v.handling === "ADD" && (!v.etter || v.sessionId)) ctx.addIssue({ code: "custom", message: "ADD krever ny økt uten økt-ID." });
  if (v.handling !== "ADD" && (!v.sessionId || (v.handling === "UPDATE" && !v.etter) || (v.handling === "CANCEL" && v.etter)))
    ctx.addIssue({ code: "custom", message: "Ugyldig endringsforslag." });
});
const SvarSchema = z.object({ actionId: z.string().min(1).max(120), beslutning: z.enum(["ACCEPTED", "REJECTED"]) }).strict();
const KANONISK_TILSTAND = new Set(["DRAFT", "SCHEDULED", "PUBLISHED"]);
const ORGANISASJON_SLUG: Record<"WANG" | "TEAM_NORWAY", string> = { WANG: "wang-toppidrett", TEAM_NORWAY: TEAM_NORWAY_SLUG };

type Forslag = {
  versjon: 1; organisasjon: "WANG" | "TEAM_NORWAY"; handling: "ADD" | "UPDATE" | "CANCEL";
  sessionId: string | null; expectedUpdatedAt: string | null;
  for: { date: string; startMinute: number; durationMinutes: number; title: string; pyramid: string; location: string | null } | null;
  etter: z.infer<typeof Innslag> | null; begrunnelse: string;
};

function datoKolonne(iso: string) { return new Date(`${iso}T00:00:00.000Z`); }
function osloIdag() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date()); }

/** Treneren lagrer et separat, versjonsfestet forslag. Spillerens aktive plan røres ikke. */
export async function lagTrenerforslag(input: unknown) {
  const trener = await requireCoachActionUser();
  const parsed = LagForslagSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, feil: "Kontroller økt og begrunnelse." };
  if (!(await rateLimit({ key: `trenerforslag:${trener.id}`, max: 20, windowMs: 60_000 })).ok)
    return { ok: false as const, feil: "Vent litt før du sender flere forslag." };
  const p = parsed.data;
  if (p.etter && p.etter.date < osloIdag()) return { ok: false as const, feil: "Treningsforslag må gjelde i dag eller framover." };
  const gruppe = await prisma.group.findFirst({ where: { slug: ORGANISASJON_SLUG[p.organisasjon], arkivertAt: null }, select: { id: true } });
  if (!gruppe) return { ok: false as const, feil: "Organisasjonen er ikke tilgjengelig." };
  const trenerrolle = await prisma.groupMember.findFirst({ where: {
    groupId: gruppe.id, userId: trener.id, role: "COACH", ...aktivtTrenerMedlemskapWhere(trener.id),
  }, select: { id: true } });
  if (!trenerrolle) return { ok: false as const, feil: "Du har ikke trenerrolle i denne organisasjonen." };

  const opprettet = await medNavngittProfil(trener.id, p.spillerId, gruppe.id, async (tx) => {
    const session = p.handling !== "ADD" ? await tx.workbenchSession.findFirst({ where: { id: p.sessionId, playerId: p.spillerId }, select: {
        id: true, date: true, startMinute: true, durationMinutes: true, title: true, pyramid: true, location: true,
        status: true, updatedAt: true, sourceGroupSessionId: true, groupId: true,
      } }) : null;
    if (p.handling !== "ADD") {
      if (!session || !KANONISK_TILSTAND.has(session.status) || session.sourceGroupSessionId || session.groupId) return null;
      if (session.date < datoKolonne(osloIdag())) return null;
    }
    const before = session ? {
      date: session.date.toISOString().slice(0, 10), startMinute: session.startMinute,
      durationMinutes: session.durationMinutes, title: session.title, pyramid: session.pyramid, location: session.location,
    } : null;
    const suggestion: Forslag = {
      versjon: 1, organisasjon: p.organisasjon, handling: p.handling, sessionId: session?.id ?? null,
      expectedUpdatedAt: session?.updatedAt.toISOString() ?? null, for: before,
      etter: p.handling === "CANCEL" || !p.etter ? null : { ...p.etter, location: p.etter.location ?? null }, begrunnelse: p.begrunnelse,
    };
    return tx.planAction.create({ data: {
      userId: p.spillerId, coachId: trener.id, actionType: "WORKBENCH_COACH_PROPOSAL",
      suggestion: suggestion satisfies Prisma.InputJsonObject, status: "PENDING",
      agentName: p.organisasjon === "WANG" ? "WANG_COACH" : "TEAM_NORWAY_COACH",
    }, select: { id: true } });
  });
  if (!opprettet) return { ok: false as const, feil: "Spillerens deling er ikke aktiv, eller økten kan ikke endres." };
  revalidatePath("/portal");
  revalidatePath(`/team-norway/workbench`);
  return { ok: true as const, id: opprettet.id };
}

/** Spillerens innboks viser kun egne, ubesvarte trenerforslag. */
export async function hentMineTrenerforslag() {
  const spiller = await requireSpillerActionUser();
  const rader = await prisma.planAction.findMany({ where: {
    userId: spiller.id, actionType: "WORKBENCH_COACH_PROPOSAL", status: "PENDING",
  }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, coachId: true, suggestion: true, createdAt: true } });
  const trenerIder = [...new Set(rader.map(r => r.coachId).filter((id): id is string => Boolean(id)))];
  const trenere = await prisma.user.findMany({ where: { id: { in: trenerIder } }, select: { id: true, name: true } });
  const navn = new Map(trenere.map(t => [t.id, t.name ?? "Trener"]));
  return rader.flatMap((r) => {
    const parsed = ForslagSchema.safeParse(r.suggestion);
    if (!parsed.success) return [];
    return [{ id: r.id, trener: navn.get(r.coachId ?? "") ?? "Trener", forslag: parsed.data, opprettet: r.createdAt.toISOString() }];
  });
}

const ForslagSchema = z.object({
  versjon: z.literal(1), organisasjon: z.enum(["WANG", "TEAM_NORWAY"]), handling: z.enum(["ADD", "UPDATE", "CANCEL"]),
  sessionId: z.string().nullable(), expectedUpdatedAt: z.iso.datetime().nullable(),
  for: Innslag.extend({}).partial().nullable(), etter: Innslag.nullable(), begrunnelse: z.string().max(1000),
}).strict();

/** Aksept og planendring er én transaksjon; samme forslag kan aldri anvendes to ganger. */
export async function svarPaTrenerforslag(input: unknown) {
  const spiller = await requireSpillerActionUser();
  const parsed = SvarSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, feil: "Ugyldig svar." };
  const { actionId, beslutning } = parsed.data;
  const resultat = await prisma.$transaction(async (tx) => {
    const action = await tx.planAction.findFirst({ where: {
      id: actionId, userId: spiller.id, actionType: "WORKBENCH_COACH_PROPOSAL", status: "PENDING",
    }, select: { id: true, suggestion: true, coachId: true } });
    if (!action) return { ok: false as const, feil: "Forslaget er allerede besvart eller ikke tilgjengelig." };
    const payload = ForslagSchema.safeParse(action.suggestion);
    if (!payload.success) return { ok: false as const, feil: "Forslaget kan ikke behandles." };
    const p = payload.data;
    if (beslutning === "REJECTED") {
      await tx.planAction.updateMany({ where: { id: action.id, userId: spiller.id, status: "PENDING" }, data: {
        status: "REJECTED", decidedAt: new Date(), decidedById: spiller.id,
      } });
      return { ok: true as const, status: "REJECTED" as const };
    }
    if (p.handling === "ADD" && p.etter) {
      await tx.workbenchSession.create({ data: {
        playerId: spiller.id, coachId: action.coachId ?? "", createdBy: action.coachId ?? "",
        date: datoKolonne(p.etter.date), startMinute: p.etter.startMinute, durationMinutes: p.etter.durationMinutes,
        title: p.etter.title, pyramid: p.etter.pyramid, location: p.etter.location ?? null,
        status: "PUBLISHED", publishedAt: new Date(), publishedBy: spiller.id,
        blockType: "OEKT", origin: p.organisasjon, planActionId: action.id,
      } });
    } else {
      const current = p.sessionId ? await tx.workbenchSession.findFirst({ where: { id: p.sessionId, playerId: spiller.id }, select: {
        id: true, updatedAt: true, status: true, sourceGroupSessionId: true, groupId: true,
      } }) : null;
      if (!current || !p.expectedUpdatedAt || current.updatedAt.toISOString() !== p.expectedUpdatedAt ||
        !KANONISK_TILSTAND.has(current.status) || current.sourceGroupSessionId || current.groupId) {
        await tx.planAction.updateMany({ where: { id: action.id, status: "PENDING" }, data: {
          status: "CONFLICT", decidedAt: new Date(), decidedById: spiller.id,
        } });
        return { ok: false as const, feil: "Planen er endret siden forslaget ble laget. Be treneren sende et nytt forslag." };
      }
      const update = p.handling === "CANCEL" ? { status: "CANCELLED" } : p.etter ? {
        date: datoKolonne(p.etter.date), startMinute: p.etter.startMinute, durationMinutes: p.etter.durationMinutes,
        title: p.etter.title, pyramid: p.etter.pyramid, location: p.etter.location ?? null,
      } : null;
      if (!update) return { ok: false as const, feil: "Forslaget mangler endring." };
      const changed = await tx.workbenchSession.updateMany({ where: {
        id: current.id, playerId: spiller.id, updatedAt: current.updatedAt,
      }, data: update });
      if (changed.count !== 1) {
        await tx.planAction.updateMany({ where: { id: action.id, status: "PENDING" }, data: {
          status: "CONFLICT", decidedAt: new Date(), decidedById: spiller.id,
        } });
        return { ok: false as const, feil: "Planen ble endret samtidig. Be treneren sende et nytt forslag." };
      }
    }
    const claimed = await tx.planAction.updateMany({ where: { id: action.id, userId: spiller.id, status: "PENDING" }, data: {
      status: "ACCEPTED", decidedAt: new Date(), decidedById: spiller.id,
    } });
    if (claimed.count !== 1) throw new Error("proposal_already_decided");
    return { ok: true as const, status: "ACCEPTED" as const };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  revalidatePath("/portal");
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath("/team-norway/workbench");
  return resultat;
}

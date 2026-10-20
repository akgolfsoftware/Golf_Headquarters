import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, User } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { girPlayerHqTilgang } from "@/lib/domain/abonnement";
import { tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { hentLydSamtykkeStatus } from "@/lib/recording/lyd-samtykke";
import { byggCoachingOppfolging } from "./coaching-oppfolging";
import { COACHING_EMAIL_DRAFT, CoachingEmailDraft, type CoachingEmailDraftData } from "./coaching-oppfolging-kontrakt";
import { APP_URL } from "@/lib/app-url";

const DAY = 86400000;
type Actor = Pick<User, "id" | "role">;
type Db = Prisma.TransactionClient;
const subscriptionSelect = { kind: true, plan: true, status: true, currentPeriodEnd: true, stripeSubscriptionId: true } as const;
const bookingSelect = { id: true, status: true, userId: true, coachId: true, trainingSessionV2Id: true, startAt: true, guestName: true, guestEmail: true,
  serviceType: { select: { name: true, coachUserId: true } }, coach: { select: { name: true } },
  user: { select: { id: true, name: true, email: true, deletedAt: true, requiresGuardianConsent: true, guardianConsentGivenAt: true, dateOfBirth: true, subscriptions: { select: subscriptionSelect } } } } as const;
function staff(actor: Actor) { if (actor.role !== "ADMIN" && actor.role !== "COACH") throw new Error("forbidden"); }
async function context(db: Db, bookingId: string, actor: Actor, now: Date) {
  staff(actor);
  const b = await db.booking.findUnique({ where: { id: bookingId }, select: bookingSelect });
  if (!b || b.status !== "COMPLETED" || (b.coachId ?? b.serviceType.coachUserId) !== actor.id) return null;
  if (b.user && (b.user.deletedAt || isAwaitingGuardianConsent(b.user))) return null;
  const recipient = b.user?.email ?? b.guestEmail;
  if (!recipient) return null;
  // E-post brukes kun til faktisk konto-/bookingstatus, aldri voice/profilbinding.
  const linked = b.user ?? await db.user.findUnique({ where: { email: recipient.trim().toLowerCase() }, select: { id: true, deletedAt: true, subscriptions: { select: subscriptionSelect } } });
  if (linked?.deletedAt) return null;
  const playerhq = linked && !linked.deletedAt ? linked.subscriptions.some((s) => s.kind === "PLAYERHQ" && girPlayerHqTilgang(s, now)) : false;
  return { b, recipient, linkedId: linked?.id ?? null, playerhq };
}
async function hasNewBooking(db: Db, c: NonNullable<Awaited<ReturnType<typeof context>>>, completedAt: Date, now: Date) {
  return Boolean(await db.booking.findFirst({ where: { id: { not: c.b.id }, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    AND: [{ OR: [{ guestEmail: c.recipient }, ...(c.linkedId ? [{ userId: c.linkedId }] : [])] },
      { OR: [{ createdAt: { gt: completedAt } }, { startAt: { gte: tilNaivVeggklokke(now, "utc") } }] }],
  }, select: { id: true } }));
}
async function eligible(db: Db, draft: CoachingEmailDraftData, actor: Actor, now: Date) {
  if (draft.coachId !== actor.id) return null;
  const completedAt = new Date(draft.completedAt);
  if (completedAt > now) return null;
  const c = await context(db, draft.bookingId, actor, now);
  if (!c) return null;
  const newBooking = await hasNewBooking(db, c, completedAt, now);
  if (draft.kind === "OPPFOLGING" && (now.getTime() - completedAt.getTime() < 14 * DAY || c.playerhq || newBooking)) return null;
  return { ...c, newBooking };
}
function draftFor(bookingId: string, coachId: string, completedAt: Date, kind: "TAKK" | "OPPFOLGING") {
  return CoachingEmailDraft.parse({ bookingId, coachId, completedAt: completedAt.toISOString(), kind,
    subject: kind === "TAKK" ? "Takk for timen" : "Oppfølging etter coachingtime",
    body: kind === "TAKK" ? "Takk for coachingtimen. Ta gjerne kontakt hvis du vil avtale en ny time."
      : "Jeg følger opp coachingtimen. Vil du avtale en ny time? Ta kontakt, eller se ledige tider.",
    tittel: kind === "TAKK" ? "E-postutkast: takk for coachingtimen" : "E-postutkast: oppfølging etter coaching",
    forklaring: kind === "TAKK" ? "Klargjort fra en faktisk fullføring. Coach må lese og godkjenne. Ingenting er sendt."
      : "14 dager etter fullføring, uten ny booking eller PlayerHQ. Vilkårene sjekkes igjen ved godkjenning. Ingenting er sendt." });
}
async function insert(db: Db, draft: CoachingEmailDraftData) {
  // Samme booking/kind får bare ett utkast, også ved samtidige kall.
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"coaching-email:" + draft.bookingId}))`;
  const where = { actionType: COACHING_EMAIL_DRAFT, userId: draft.coachId, coachId: draft.coachId,
    AND: [{ suggestion: { path: ["bookingId"], equals: draft.bookingId } }, { suggestion: { path: ["kind"], equals: draft.kind } }] };
  if (await db.planAction.findFirst({ where, select: { id: true } })) return false;
  await db.planAction.create({ data: { userId: draft.coachId, coachId: draft.coachId, actionType: COACHING_EMAIL_DRAFT,
    agentName: "coaching-oppfolging", status: "PENDING", suggestion: draft } });
  return true;
}

/** Eksplisitt coach-fullføring. Bookingstatus og takk-utkast lagres atomisk. */
export async function fullforBookingerMedUtkast(actor: Actor, now = new Date()) {
  staff(actor);
  return prisma.$transaction(async (tx) => {
    const bookings = await tx.booking.findMany({ where: { status: "CONFIRMED", ...coachBookingScope(actor) }, select: { id: true, coachId: true, serviceType: { select: { coachUserId: true } } } });
    let completed = 0, drafts = 0;
    for (const b of bookings) {
      const changed = await tx.booking.updateMany({ where: { id: b.id, status: "CONFIRMED", ...coachBookingScope(actor) }, data: { status: "COMPLETED" } });
      if (changed.count !== 1) continue;
      completed++;
      const coachId = b.coachId ?? b.serviceType.coachUserId;
      if (!coachId) continue;
      const coach = await tx.user.findUnique({ where: { id: coachId }, select: { id: true, role: true, deletedAt: true } });
      if (!coach || coach.deletedAt || (coach.role !== "COACH" && coach.role !== "ADMIN")) continue;
      const draft = draftFor(b.id, coachId, now, "TAKK");
      if (await eligible(tx, draft, coach, now) && await insert(tx, draft)) drafts++;
    }
    return { completed, drafts };
  });
}

/** Manuel oppdatering i samme kø. Ingen cron, e-post eller varsling. */
export async function klargjorCoachingOppfolging(actor: Actor, now = new Date()) {
  staff(actor);
  const anchors = await prisma.planAction.findMany({ where: { userId: actor.id, coachId: actor.id, actionType: COACHING_EMAIL_DRAFT,
    suggestion: { path: ["kind"], equals: "TAKK" } }, orderBy: { createdAt: "desc" }, take: 100, select: { suggestion: true } });
  let created = 0;
  for (const anchor of anchors) {
    const checked = CoachingEmailDraft.safeParse(anchor.suggestion);
    if (!checked.success || new Date(checked.data.completedAt).getTime() > now.getTime() - 14 * DAY) continue;
    const draft = draftFor(checked.data.bookingId, actor.id, new Date(checked.data.completedAt), "OPPFOLGING");
    const added = await prisma.$transaction(async (tx) => await eligible(tx, draft, actor, now) ? insert(tx, draft) : false);
    if (added) created++;
  }
  return created;
}

/** Godkjente konkrete spiller-ID-er er eneste voice/profilbinding. Ingen navnesøk. */
async function approvedVoice(b: NonNullable<Awaited<ReturnType<typeof context>>>["b"], coachId: string) {
  if (!b.userId || !(await hentLydSamtykkeStatus(b.userId)).tillatt) return null;
  const recordings = await prisma.sessionRecording.findMany({ where: { bookingId: b.id, playerId: b.userId, uploadedById: coachId, status: "DONE" }, select: { id: true } });
  if (!recordings.length) return null;
  const approved = await prisma.planAction.findFirst({ where: { userId: b.userId, coachId, actionType: "FANGST_SJEKKPUNKT", status: "ACCEPTED",
    decidedById: coachId, fangstId: { in: recordings.map((r) => r.id) }, sjekkpunkt: { not: null } }, select: { id: true }, orderBy: { decidedAt: "desc" } });
  return approved ? { playerId: b.userId, href: `/admin/spillere/${encodeURIComponent(b.userId)}` } : null;
}
export async function lastCoachingUtkast(actionId: string) {
  const actor = await requireCoachActionUser();
  const action = await prisma.planAction.findFirst({ where: { id: actionId, userId: actor.id, coachId: actor.id, actionType: COACHING_EMAIL_DRAFT }, select: { suggestion: true, status: true } });
  const parsed = CoachingEmailDraft.safeParse(action?.suggestion);
  if (!parsed.success) return null;
  const c = await eligible(prisma, parsed.data, actor, new Date());
  if (!c) return null;
  const voice = await approvedVoice(c.b, actor.id);
  return { body: parsed.data.body, subject: parsed.data.subject, name: c.b.user?.name ?? c.b.guestName, email: c.recipient, status: action!.status,
    voiceHref: voice?.href ?? null, playerhq: c.playerhq, newBooking: c.newBooking };
}

/** Godkjenning klargjør utkastet. Ingen leverandør, sending eller melding kalles. */
export async function godkjennCoachingUtkast(actionId: string, body?: string) {
  const actor = await requireCoachActionUser();
  return prisma.$transaction(async (tx) => {
    const action = await tx.planAction.findFirst({ where: { id: actionId, userId: actor.id, coachId: actor.id, actionType: COACHING_EMAIL_DRAFT }, select: { suggestion: true, status: true } });
    const parsed = CoachingEmailDraft.safeParse(action?.suggestion);
    if (!parsed.success || !action) throw new Error("Utkastet er ikke tilgjengelig.");
    if (action.status === "ACCEPTED") return { status: "ACCEPTED" as const, applied: false, summary: "E-postutkastet er allerede klargjort. Ingenting er sendt." };
    if (action.status !== "PENDING") return { status: "REJECTED" as const, applied: false, summary: "Utkastet er avvist." };
    const c = await eligible(tx, parsed.data, actor, new Date());
    if (!c) {
      await tx.planAction.updateMany({ where: { id: actionId, status: "PENDING", userId: actor.id, coachId: actor.id }, data: { status: "REJECTED", decidedAt: new Date(), decidedById: actor.id, rejectReason: "Booking, tilgang eller oppfølgingsvilkår er endret." } });
      return { status: "REJECTED" as const, applied: false, summary: "Grunnlaget har endret seg. Utkastet er ikke klargjort." };
    }
    const draft = CoachingEmailDraft.parse({ ...parsed.data, ...(body !== undefined ? { body } : {}) });
    // Valider den faktiske malen før ferdigmerking. Ingen HTML lagres fra klienten.
    byggCoachingOppfolging(draft.kind === "TAKK" ? "takk" : "oppfolging", { status: "COMPLETED", fornavn: c.b.user?.name?.split(" ")[0] ?? c.b.guestName?.split(" ")[0] ?? null,
      coach: c.b.coach?.name ?? null, tjeneste: c.b.serviceType.name, startAt: c.b.startAt, coachTekst: draft.body, bookingUrl: `${APP_URL}/booking`, playerhqUrl: c.playerhq ? `${APP_URL}/portal` : null });
    const changed = await tx.planAction.updateMany({ where: { id: actionId, status: "PENDING", userId: actor.id, coachId: actor.id }, data: {
      status: "ACCEPTED", decidedAt: new Date(), decidedById: actor.id, suggestion: draft, originalSuggestion: parsed.data,
      editedBeforeApproval: draft.body !== parsed.data.body, sjekkpunkt: "E-postutkast klargjort av coachen. Ingenting er sendt." } });
    return { status: "ACCEPTED" as const, applied: changed.count === 1, summary: "E-postutkastet er klargjort. Ingenting er sendt." };
  });
}

import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { CoachingEmailDraft, COACHING_EMAIL_DRAFT } from "./coaching-oppfolging-kontrakt";

type Actor = { id: string; role: "COACH" | "ADMIN" | "PLAYER" };
type Action = { id: string; userId: string; coachId: string; actionType: string; status: string; suggestion: unknown; createdAt: Date; decidedById?: string; sjekkpunkt?: string };
type Where = { id?: string; userId?: string; coachId?: string; actionType?: string; status?: string; suggestion?: { path: string[]; equals: string }; AND?: { suggestion: { path: string[]; equals: string } }[] };
let actor: Actor = { id: "coach", role: "COACH" };
let state = "CONFIRMED";
let actions: Action[] = [];
let newBooking = false;
let playerhq = false;
let insertFails = false;
let voiceAllowed = true;
let linkedPlayer = true;
let voiceReads = 0;
let lock = Promise.resolve();
const first = new Date(Date.now() - 14 * 86400000 - 60000);
function match(a: Action, where: Where) {
  for (const key of ["id", "userId", "coachId", "actionType", "status"] as const) if (where[key] !== undefined && a[key] !== where[key]) return false;
  const draft = CoachingEmailDraft.safeParse(a.suggestion);
  const clauses = [...(where.AND ?? []), ...(where.suggestion ? [{ suggestion: where.suggestion }] : [])];
  return clauses.every((c) => draft.success && draft.data[c.suggestion.path[0] as "bookingId" | "kind"] === c.suggestion.equals);
}
function booking() {
  return { id: "booking", status: state, userId: linkedPlayer ? "player" : null, coachId: "coach", trainingSessionV2Id: null, startAt: new Date("2026-09-20T16:30:00Z"),
    guestName: "Syntetisk gjest", guestEmail: "syntetisk@example.invalid", serviceType: { name: "Syntetisk time", coachUserId: "coach" }, coach: { name: "Syntetisk coach" },
    user: linkedPlayer ? { id: "player", name: "Syntetisk spiller", email: "syntetisk@example.invalid", deletedAt: null, requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: null,
      subscriptions: playerhq ? [{ kind: "PLAYERHQ", plan: "MANUELL", status: "ACTIVE", currentPeriodEnd: null, stripeSubscriptionId: null }] : [] } : null };
}
const db = {
  $executeRaw: async () => 1,
  booking: {
    findMany: async () => state === "CONFIRMED" ? [booking()] : [],
    findUnique: async () => booking(),
    findFirst: async () => newBooking ? { id: "next" } : null,
    updateMany: async ({ where }: { where: { status: string } }) => { if (state !== where.status) return { count: 0 }; state = "COMPLETED"; return { count: 1 }; },
  },
  user: { findUnique: async ({ where }: { where: { id?: string } }) => where.id ? { id: "coach", role: "COACH", deletedAt: null }
    : playerhq ? { id: "email-account", deletedAt: null, subscriptions: [{ kind: "PLAYERHQ", plan: "MANUELL", status: "ACTIVE", currentPeriodEnd: null, stripeSubscriptionId: null }] } : null },
  planAction: {
    findMany: async ({ where }: { where: Where }) => actions.filter((a) => match(a, where)),
    findFirst: async ({ where }: { where: Where }) => {
      if (where.actionType === "FANGST_SJEKKPUNKT") { voiceReads++; return voiceAllowed ? { id: "approved-voice" } : null; }
      return actions.find((a) => match(a, where)) ?? null;
    },
    create: async ({ data }: { data: Omit<Action, "id" | "createdAt"> }) => {
      if (insertFails) throw new Error("syntetisk lagringsfeil");
      const a = { ...data, id: `action-${actions.length}`, createdAt: new Date() }; actions.push(a); return a;
    },
    updateMany: async ({ where, data }: { where: Where; data: Partial<Action> }) => { const a = actions.find((a) => match(a, where)); if (!a) return { count: 0 }; Object.assign(a, data); return { count: 1 }; },
  },
  sessionRecording: { findMany: async ({ where }: { where: { bookingId: string; playerId: string; uploadedById: string } }) => {
    assert.equal(where.bookingId, "booking"); assert.equal(where.playerId, "player"); assert.equal(where.uploadedById, "coach"); voiceReads++;
    return [{ id: "recording" }];
  } },
};
const transaction = async <T>(fn: (tx: typeof db) => Promise<T>): Promise<T> => {
  const prior = lock; let release!: () => void; lock = new Promise((r) => { release = r; }); await prior;
  const saved = { state, actions: structuredClone(actions) };
  try { return await fn(db); } catch (error) { state = saved.state; actions = saved.actions; throw error; } finally { release(); }
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...db, $transaction: transaction } } });
mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => { if (actor.role === "PLAYER") throw new Error("forbidden"); return actor; } } });
mock.module("@/lib/app-url", { namedExports: { APP_URL: "https://syntetisk.example" } });
mock.module("@/lib/recording/lyd-samtykke", { namedExports: { hentLydSamtykkeStatus: async () => ({ tillatt: voiceAllowed }) } });
let queue: typeof import("./coaching-oppfolging-queue");
before(async () => { queue = await import("./coaching-oppfolging-queue"); });
beforeEach(() => { actor = { id: "coach", role: "COACH" }; state = "CONFIRMED"; actions = []; newBooking = playerhq = insertFails = false; voiceAllowed = linkedPlayer = true; voiceReads = 0; lock = Promise.resolve(); });

test("faktisk fullføring gir ett takk-utkast med ekte tidspunkt innen24t", async () => {
  assert.deepEqual(await queue.fullforBookingerMedUtkast(actor, first), { completed: 1, drafts: 1 });
  assert.deepEqual(await queue.fullforBookingerMedUtkast(actor, first), { completed: 0, drafts: 0 });
  assert.equal(actions.length, 1); assert.equal(actions[0].status, "PENDING");
  const draft = CoachingEmailDraft.parse(actions[0].suggestion);
  assert.equal(draft.completedAt, first.toISOString()); assert.equal(actions[0].userId, "coach"); assert.equal(draft.kind, "TAKK");
});
test("lagringsfeil ruller booking og utkast tilbake sammen", async () => {
  insertFails = true; await assert.rejects(queue.fullforBookingerMedUtkast(actor, first), /lagringsfeil/);
  assert.equal(state, "CONFIRMED"); assert.equal(actions.length, 0);
});
test("14d-kandidat er ikke tidlig og parallelle oppdateringer lager ikke duplikat", async () => {
  await queue.fullforBookingerMedUtkast(actor, first);
  assert.equal(await queue.klargjorCoachingOppfolging(actor, new Date(first.getTime() + 13 * 86400000)), 0);
  const counts = await Promise.all([queue.klargjorCoachingOppfolging(actor, new Date(first.getTime() + 14 * 86400000)), queue.klargjorCoachingOppfolging(actor, new Date(first.getTime() + 14 * 86400000))]);
  assert.equal(counts[0] + counts[1], 1); assert.equal(actions.length, 2);
});
test("ny booking eller aktiv PlayerHQ stanser14d ved klargjøring og godkjenning", async () => {
  await queue.fullforBookingerMedUtkast(actor, first);
  newBooking = true; assert.equal(await queue.klargjorCoachingOppfolging(actor), 0);
  newBooking = false; playerhq = true; assert.equal(await queue.klargjorCoachingOppfolging(actor), 0);
  playerhq = false; assert.equal(await queue.klargjorCoachingOppfolging(actor), 1);
  const follow = actions.find((a) => CoachingEmailDraft.parse(a.suggestion).kind === "OPPFOLGING")!;
  playerhq = true; assert.equal((await queue.godkjennCoachingUtkast(follow.id)).status, "REJECTED");
  assert.equal(follow.status, "REJECTED");
});
test("coach må godkjenne selv; redigert tekst klargjøres uten sending", async () => {
  await queue.fullforBookingerMedUtkast(actor, first);
  actor = { id: "other-coach", role: "COACH" }; await assert.rejects(queue.godkjennCoachingUtkast(actions[0].id), /ikke tilgjengelig/);
  actor = { id: "coach", role: "PLAYER" }; await assert.rejects(queue.godkjennCoachingUtkast(actions[0].id), /forbidden/);
  actor = { id: "coach", role: "COACH" };
  const result = await queue.godkjennCoachingUtkast(actions[0].id, "Coachen har redigert dette utkastet.");
  assert.equal(result.status, "ACCEPTED"); assert.match(result.summary, /Ingenting er sendt/);
  assert.equal(CoachingEmailDraft.parse(actions[0].suggestion).body, "Coachen har redigert dette utkastet.");
  assert.equal((await queue.godkjennCoachingUtkast(actions[0].id)).applied, false);
});
test("voiceprofil krever godkjent konkret ID-binding og gjeldende samtykke", async () => {
  await queue.fullforBookingerMedUtkast(actor, first);
  assert.equal((await queue.lastCoachingUtkast(actions[0].id))?.voiceHref, "/admin/spillere/player");
  voiceAllowed = false; assert.equal((await queue.lastCoachingUtkast(actions[0].id))?.voiceHref, null);
  linkedPlayer = false; voiceAllowed = true; voiceReads = 0;
  assert.equal((await queue.lastCoachingUtkast(actions[0].id))?.voiceHref, null); assert.equal(voiceReads, 0);
});
test("historisk booking uten faktisk fullføringstidspunkt blir ikke gjettet", async () => {
  state = "COMPLETED"; assert.equal(await queue.klargjorCoachingOppfolging(actor), 0); assert.equal(actions.length, 0);
  assert.equal(COACHING_EMAIL_DRAFT, "COACHING_EMAIL_DRAFT");
});

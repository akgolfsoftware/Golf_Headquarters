/**
 * AG-05 Flytt økt (pakke 3, natt 17.10): økta flyttes med en gang, men spilleren
 * varsles først når angrefristen er ute. Angre = flytt tilbake uten varsel.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let coach: { id: string; role: string } | null = { id: "coach-a", role: "COACH" };
let okt = { id: "okt-1", playerId: "spiller-a", title: "Wedge 50–90 m", date: new Date("2031-06-10T00:00:00Z"), startMinute: 17 * 60 };
let flyttinger: Array<{ sessionId: string; newDate: string; newStartMinute: number }> = [];
let varsler: Array<{ userId: string; title: string; body?: string }> = [];
let harTilgang = 1;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!coach) throw new Error("unauthenticated");
      return coach;
    },
  },
});
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({}) } });
mock.module("@/lib/notifications", { namedExports: { notify: async (v: { userId: string; title: string; body?: string }) => { varsler.push(v); } } });
mock.module("@/lib/workbench/wb-actions", {
  namedExports: {
    moveSession: async (i: { sessionId: string; newDate: string; newStartMinute: number }) => {
      flyttinger.push(i);
      okt = { ...okt, date: new Date(`${i.newDate}T00:00:00Z`), startMinute: i.newStartMinute };
      return { ok: true, data: {} };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      workbenchSession: { findUnique: async () => okt },
      user: { count: async () => harTilgang },
    },
  },
});

test.beforeEach(() => {
  coach = { id: "coach-a", role: "COACH" };
  okt = { id: "okt-1", playerId: "spiller-a", title: "Wedge 50–90 m", date: new Date("2031-06-10T00:00:00Z"), startMinute: 17 * 60 };
  flyttinger = [];
  varsler = [];
  harTilgang = 1;
});

test("flytting lagres med en gang og returnerer gammel tid til Angre, uten varsel", async () => {
  const { flyttOktFraKalender } = await import("./flytt-okt-actions");
  const res = await flyttOktFraKalender({ oktId: "okt-1", dato: "2031-06-11", tid: "16:30" });
  assert.deepEqual(res, { ok: true, fra: { dato: "2031-06-10", tid: "17:00" } });
  assert.deepEqual(flyttinger, [{ sessionId: "okt-1", newDate: "2031-06-11", newStartMinute: 990 }]);
  assert.equal(varsler.length, 0);
});

test("Angre flytter tilbake til gammel tid, og ingen varsel er sendt", async () => {
  const { flyttOktFraKalender } = await import("./flytt-okt-actions");
  const res = await flyttOktFraKalender({ oktId: "okt-1", dato: "2031-06-11", tid: "16:30" });
  assert.ok(res.ok);
  await flyttOktFraKalender({ oktId: "okt-1", dato: res.fra.dato, tid: res.fra.tid });
  assert.equal(okt.startMinute, 17 * 60);
  assert.equal(varsler.length, 0);
});

test("når angrefristen er ute, får spilleren varsel med ny tid", async () => {
  const { flyttOktFraKalender, varsleOktFlyttet } = await import("./flytt-okt-actions");
  await flyttOktFraKalender({ oktId: "okt-1", dato: "2031-06-11", tid: "16:30" });
  assert.deepEqual(await varsleOktFlyttet("okt-1"), { ok: true });
  assert.equal(varsler.length, 1);
  assert.equal(varsler[0].userId, "spiller-a");
  assert.match(varsler[0].body ?? "", /16:30/);
});

test("coach uten tilgang til spilleren kan ikke sende varsel", async () => {
  harTilgang = 0;
  const { varsleOktFlyttet } = await import("./flytt-okt-actions");
  assert.deepEqual(await varsleOktFlyttet("okt-1"), { ok: false });
  assert.equal(varsler.length, 0);
});

test("ugyldig tid avvises før noe flyttes", async () => {
  const { flyttOktFraKalender } = await import("./flytt-okt-actions");
  const res = await flyttOktFraKalender({ oktId: "okt-1", dato: "2031-06-11", tid: "25:00" });
  assert.equal(res.ok, false);
  assert.equal(flyttinger.length, 0);
});

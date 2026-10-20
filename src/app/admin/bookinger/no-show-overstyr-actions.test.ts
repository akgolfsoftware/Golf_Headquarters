/**
 * Bookingplanen steg 4: overstyring av no-show. Går bare på en NO_SHOW i coachens egen scope,
 * og delegerer til avlysningen (klipp tilbake eller full refusjon).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type B = { id: string; coachId: string; status: string };
let bruker = { id: "coach-a", role: "COACH" };
let bookinger: B[] = [];
let avlyst: Array<{ bookingId: string; begrunnelse?: string }> = [];
let auditer: string[] = [];

mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => bruker } });
mock.module("@/lib/audit", { namedExports: { audit: async (e: { action: string }) => { auditer.push(e.action); } } });
mock.module("./actions", {
  namedExports: {
    avlysBookingSomCoach: async (i: { bookingId: string; begrunnelse?: string }) => {
      avlyst.push(i);
      return { ok: true, refundert: true, refusjonVenter: false, klippTilbake: false };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        findFirst: async ({ where }: { where: { id: string; status: string; OR?: Array<{ coachId?: string }> } }) => {
          const b = bookinger.find((x) => x.id === where.id && x.status === where.status && (!where.OR || where.OR.some((o) => o.coachId === x.coachId)));
          return b ? { id: b.id } : null;
        },
      },
    },
  },
});

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  avlyst = [];
  auditer = [];
  bookinger = [
    { id: "b1", coachId: "coach-a", status: "NO_SHOW" },
    { id: "b2", coachId: "coach-a", status: "CONFIRMED" },
    { id: "b3", coachId: "coach-b", status: "NO_SHOW" },
  ];
});

test("overstyring av egen no-show går via avlysningen (klipp tilbake eller refusjon)", async () => {
  const { overstyrNoShow } = await import("./no-show-overstyr-actions");
  const res = await overstyrNoShow("b1");
  assert.equal(res.ok, true);
  assert.deepEqual(avlyst.map((a) => a.bookingId), ["b1"]);
  assert.deepEqual(auditer, ["booking.no-show.overridden"]);
});

test("overstyring avvises for en booking som ikke er no-show", async () => {
  const { overstyrNoShow } = await import("./no-show-overstyr-actions");
  assert.equal((await overstyrNoShow("b2")).ok, false);
  assert.equal(avlyst.length, 0);
});

test("en coach kan ikke overstyre en annen coachs no-show", async () => {
  const { overstyrNoShow } = await import("./no-show-overstyr-actions");
  assert.equal((await overstyrNoShow("b3")).ok, false);
  assert.equal(avlyst.length, 0);
});

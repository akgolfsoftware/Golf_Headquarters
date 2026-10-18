/**
 * Bookingplanen steg 3 (natt 17.10): coachen setter en hel uke og en fridag uten
 * å forlate AgencyOS.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Slot = { weekday: number | null; date: string | null; startTime: string; endTime: string; locationId: string | null; active: boolean };
let coach: { id: string; role: string } | null = { id: "coach-a", role: "COACH" };
let slots: Slot[] = [];
let hendelser: Array<{ id: string; coachId: string | null; title: string; startAt: Date; endAt: Date }> = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: { requireCoachActionUser: async () => { if (!coach) throw new Error("unauthenticated"); return coach; } },
});
mock.module("@/app/admin/(legacy)/availability/actions", {
  namedExports: {
    addSlot: async (s: Slot) => { if (s.startTime >= s.endTime) throw new Error("Sluttid må være etter starttid."); slots.push(s); },
    updateSlot: async () => undefined,
    deleteSlot: async (id: string) => { if (id !== "s1") throw new Error("forbidden"); },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      coachAvailability: {
        findMany: async ({ where }: { where: { weekday: { in: number[] }; startTime: string; endTime: string } }) =>
          slots.filter((s) => s.weekday !== null && where.weekday.in.includes(s.weekday) && s.startTime === where.startTime && s.endTime === where.endTime),
      },
      calendarEvent: {
        findFirst: async ({ where }: { where: { coachId: string; startAt: Date } }) =>
          hendelser.find((h) => h.coachId === where.coachId && h.startAt.getTime() === where.startAt.getTime()) ?? null,
        create: async ({ data }: { data: { coachId: string; title: string; startAt: Date; endAt: Date } }) => { hendelser.push({ id: `h${hendelser.length + 1}`, ...data }); return data; },
        deleteMany: async ({ where }: { where: { id: string; coachId: string } }) => {
          const for_ = hendelser.length;
          hendelser = hendelser.filter((h) => !(h.id === where.id && h.coachId === where.coachId && h.title.startsWith("Fridag")));
          return { count: for_ - hendelser.length };
        },
      },
    },
  },
});

test.beforeEach(() => {
  coach = { id: "coach-a", role: "COACH" };
  slots = [];
  hendelser = [];
});

test("coach setter en hel uke: ett vindu per valgt ukedag", async () => {
  const { settHelUke } = await import("./tilgjengelighet-actions");
  const res = await settHelUke({ dager: [0, 1, 2, 3, 4], startTime: "15:00", endTime: "19:00", locationId: "loc-1" });
  assert.deepEqual(res, { ok: true, opprettet: 5 });
  assert.deepEqual(slots.map((s) => s.weekday), [0, 1, 2, 3, 4]);
  assert.ok(slots.every((s) => s.startTime === "15:00" && s.endTime === "19:00" && s.locationId === "loc-1" && s.active && s.date === null));
});

test("hel uke to ganger lager ingen dubletter", async () => {
  const { settHelUke } = await import("./tilgjengelighet-actions");
  await settHelUke({ dager: [0, 1], startTime: "15:00", endTime: "19:00", locationId: null });
  const res = await settHelUke({ dager: [0, 1, 2], startTime: "15:00", endTime: "19:00", locationId: null });
  assert.deepEqual(res, { ok: true, opprettet: 1 });
  assert.equal(slots.length, 3);
});

test("hel uke med sluttid før starttid avvises", async () => {
  const { settHelUke } = await import("./tilgjengelighet-actions");
  const res = await settHelUke({ dager: [0], startTime: "19:00", endTime: "15:00", locationId: null });
  assert.equal(res.ok, false);
  assert.equal(slots.length, 0);
});

test("coach legger inn en fridag: heldags hendelse for coachen", async () => {
  const { leggTilFridag } = await import("./tilgjengelighet-actions");
  assert.deepEqual(await leggTilFridag({ dato: "2031-06-12", grunn: "Ferie" }), { ok: true });
  assert.equal(hendelser.length, 1);
  assert.equal(hendelser[0].coachId, "coach-a");
  assert.equal(hendelser[0].title, "Fridag · Ferie");
  assert.equal(hendelser[0].startAt.toISOString(), "2031-06-12T00:00:00.000Z");
  assert.equal(hendelser[0].endAt.toISOString(), "2031-06-13T00:00:00.000Z");
});

test("samme fridag to ganger avvises, ugyldig dato avvises", async () => {
  const { leggTilFridag } = await import("./tilgjengelighet-actions");
  await leggTilFridag({ dato: "2031-06-12" });
  assert.equal((await leggTilFridag({ dato: "2031-06-12" })).ok, false);
  assert.equal((await leggTilFridag({ dato: "2031-02-30" })).ok, false);
  assert.equal(hendelser.length, 1);
});

test("fridag slettes bare av coachen som eier den", async () => {
  const { leggTilFridag, slettFridag } = await import("./tilgjengelighet-actions");
  await leggTilFridag({ dato: "2031-06-12" });
  coach = { id: "coach-b", role: "COACH" };
  assert.equal((await slettFridag("h1")).ok, false);
  coach = { id: "coach-a", role: "COACH" };
  assert.deepEqual(await slettFridag("h1"), { ok: true });
  assert.equal(hendelser.length, 0);
});

test("et annet coachs vindu kan ikke slettes", async () => {
  const { slettVindu } = await import("./tilgjengelighet-actions");
  assert.deepEqual(await slettVindu("annet"), { ok: false, feil: "Fant ikke tidsvinduet." });
});

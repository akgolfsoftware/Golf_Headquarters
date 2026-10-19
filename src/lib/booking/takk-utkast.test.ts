/**
 * EP-05 og EP-06 blir bare utkast i Innboks: aldri sendt, ett per booking,
 * og oppfølgingen hoppes over når gjesten har booket igjen eller har konto.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type B = { id: string; guestEmail: string; guestName: string; startAt: Date; endAt: Date; coach: { name: string } };
let ferdige: B[] = [];
let toUker: B[] = [];
let finnesUtkast = new Set<string>();
let nyBooking = false;
let konto = false;
let laget: { emne: string; bookingId: string; status: string; utkastSvar: string; fraEpost: string }[] = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        findMany: async (args: { where: { endAt?: unknown } }) => (args.where.endAt ? ferdige : toUker),
        findFirst: async () => (nyBooking ? { id: "ny" } : null),
      },
      user: { findFirst: async () => (konto ? { id: "u" } : null) },
      innboksEpost: {
        findFirst: async (args: { where: { bookingId: string; emne: string } }) =>
          finnesUtkast.has(`${args.where.bookingId}/${args.where.emne}`) ? { id: "x" } : null,
        create: async (args: { data: (typeof laget)[number] }) => { laget.push(args.data); return { id: "nytt" }; },
      },
    },
  },
});
mock.module("@/lib/email", { namedExports: { resendKlient: () => { throw new Error("skal aldri sende"); }, FRA_EPOST: "x" } });

const naa = new Date("2026-10-19T06:00:00Z");
const b = (id: string, start: string): B => ({
  id, guestEmail: "jon@eksempel.no", guestName: "Jon Berg",
  startAt: new Date(start), endAt: new Date(new Date(start).getTime() + 3_600_000), coach: { name: "Anders Kristiansen" },
});

test.beforeEach(() => {
  ferdige = [];
  toUker = [];
  finnesUtkast = new Set();
  nyBooking = false;
  konto = false;
  laget = [];
});

async function kjor() {
  return (await import("./takk-utkast")).lagTakkOgOppfolgingUtkast(naa);
}

test("EP-05: takk legges som utkast hos coach, ikke sendt", async () => {
  ferdige = [b("b1", "2026-10-18T16:00:00Z")];
  const r = await kjor();
  assert.equal(r.takk, 1);
  assert.equal(laget[0].status, "UTKAST_KLART");
  assert.equal(laget[0].emne, "Takk for timen");
  assert.equal(laget[0].bookingId, "b1");
  assert.match(laget[0].utkastSvar, /^Hei Jon,/);
  assert.match(laget[0].utkastSvar, /\/auth\/signup$/m);
  assert.doesNotMatch(laget[0].utkastSvar, /signup\?/, "ingen e-post i lenken");
});

test("EP-05: ett utkast per booking", async () => {
  ferdige = [b("b1", "2026-10-18T16:00:00Z")];
  finnesUtkast.add("b1/Takk for timen");
  const r = await kjor();
  assert.equal(r.takk, 0);
  assert.equal(laget.length, 0);
});

test("EP-06: oppfølging 14 dager etter, bare én gang", async () => {
  toUker = [b("b2", "2026-10-04T16:00:00Z")];
  assert.equal((await kjor()).oppfolging, 1);
  assert.equal(laget[0].emne, "To uker siden timen");
  assert.match(laget[0].utkastSvar, /eneste oppfølgingen/);
  finnesUtkast.add("b2/To uker siden timen");
  laget = [];
  assert.equal((await kjor()).oppfolging, 0);
});

test("EP-06: hoppes over når gjesten har booket igjen eller har konto", async () => {
  toUker = [b("b2", "2026-10-04T16:00:00Z")];
  nyBooking = true;
  assert.equal((await kjor()).oppfolging, 0);
  nyBooking = false;
  konto = true;
  assert.equal((await kjor()).oppfolging, 0);
  assert.equal(laget.length, 0);
});

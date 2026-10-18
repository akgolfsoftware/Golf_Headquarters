/**
 * Lukeberegningen respekterer tjenestens bookingregler (bookingplanen steg 2):
 * buffer før og etter en eksisterende booking, minste varsel, og maks dager
 * fram. Datoene velges relativt til «nå», så testen er uavhengig av klokka.
 */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

type Tjeneste = {
  id: string;
  active: boolean;
  coachUserId: string | null;
  durationMin: number;
  maxDeltakere: number;
  bufferForMin: number;
  bufferEtterMin: number;
  minVarselTimer: number;
  maksDagerFram: number;
};

let tjeneste: Tjeneste;
let bookinger: Array<{ coachId: string; serviceTypeId: string; startAt: Date; endAt: Date; plassNr: number }> = [];
let coachBuffer = 0;
let hendelser: Array<{ coachId: string | null; startAt: Date; endAt: Date }> = [];

mock.module("@/lib/google-calendar", {
  namedExports: { getCalendarBusy: async () => ({ ok: true, busy: [] }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      serviceType: { findUnique: async () => tjeneste },
      coachAvailability: {
        findMany: async () => [
          {
            id: "av-1",
            weekday: 0,
            date: null,
            startTime: "09:00",
            endTime: "13:00",
            validFrom: null,
            validTo: null,
            recurrenceInterval: null,
            locationId: null,
            coach: { id: "coach-a", name: "Coach A", role: "COACH", bookingBufferMin: coachBuffer },
          },
        ],
      },
      booking: { findMany: async () => bookinger },
      calendarEvent: { findMany: async () => hendelser },
    },
  },
});

let getAvailableSlots: typeof import("./availability").getAvailableSlots;
let dagInnenforMaksFram: typeof import("./availability").dagInnenforMaksFram;
let tidligsteStart: typeof import("./availability").tidligsteStart;

before(async () => {
  const mod = await import("./availability");
  getAvailableSlots = mod.getAvailableSlots;
  dagInnenforMaksFram = mod.dagInnenforMaksFram;
  tidligsteStart = mod.tidligsteStart;
});

function standard(): Tjeneste {
  return {
    id: "svc",
    active: true,
    coachUserId: null,
    durationMin: 60,
    maxDeltakere: 1,
    bufferForMin: 0,
    bufferEtterMin: 0,
    minVarselTimer: 0,
    maksDagerFram: 30,
  };
}

/** En dag `n` dager fram (Oslo-dato, midnatt), likt som koden regner «i dag». */
function dagFram(n: number): Date {
  const [y, m, dd] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" })
    .format(new Date())
    .split("-")
    .map(Number);
  return new Date(y, m - 1, dd + n);
}

function kl(dag: Date, t: string): Date {
  const [h, m] = t.split(":").map(Number);
  const d = new Date(dag);
  d.setHours(h, m, 0, 0);
  return d;
}

function klokkeslett(slots: Array<{ start: Date }>): string[] {
  return slots.map((s) => `${String(s.start.getHours()).padStart(2, "0")}:${String(s.start.getMinutes()).padStart(2, "0")}`);
}

test.beforeEach(() => {
  tjeneste = standard();
  bookinger = [];
  coachBuffer = 0;
  hendelser = [];
});

test("coachens egen buffer (steg 3) blokkerer lukene inntil en booking", async () => {
  const dag = dagFram(3);
  coachBuffer = 30;
  bookinger = [{ coachId: "coach-a", serviceTypeId: "svc", startAt: kl(dag, "10:00"), endAt: kl(dag, "11:00"), plassNr: 1 }];
  const slots = await getAvailableSlots("svc", dag);
  assert.deepEqual(klokkeslett(slots), ["11:30", "12:00"]);
});

test("en fridag (heldags kalenderhendelse for coachen) gir ingen luker", async () => {
  const dag = dagFram(3);
  const neste = new Date(dag);
  neste.setDate(neste.getDate() + 1);
  hendelser = [{ coachId: "coach-a", startAt: dag, endAt: neste }];
  assert.equal((await getAvailableSlots("svc", dag)).length, 0);
});

test("uten buffer tilbys lukene rett før og rett etter en booking", async () => {
  const dag = dagFram(3);
  bookinger = [{ coachId: "coach-a", serviceTypeId: "svc", startAt: kl(dag, "10:00"), endAt: kl(dag, "11:00"), plassNr: 1 }];
  const slots = await getAvailableSlots("svc", dag);
  assert.deepEqual(klokkeslett(slots), ["09:00", "11:00", "11:30", "12:00"]);
});

test("buffer før og etter blokkerer lukene som ligger inntil bookingen", async () => {
  const dag = dagFram(3);
  tjeneste = { ...standard(), bufferForMin: 15, bufferEtterMin: 15 };
  bookinger = [{ coachId: "coach-a", serviceTypeId: "svc", startAt: kl(dag, "10:00"), endAt: kl(dag, "11:00"), plassNr: 1 }];
  const slots = await getAvailableSlots("svc", dag);
  // 09:00 slutter 10:00 + 15 min buffer etter = 10:15, inn i bookingen → blokkert.
  // 11:00 starter 11:00 − 15 min buffer før = 10:45, inn i bookingen → blokkert.
  assert.deepEqual(klokkeslett(slots), ["11:30", "12:00"]);
});

test("buffer rører ikke deling av nøyaktig samme økt (2-til-1)", async () => {
  const dag = dagFram(3);
  tjeneste = { ...standard(), maxDeltakere: 2, bufferForMin: 15, bufferEtterMin: 15 };
  bookinger = [{ coachId: "coach-a", serviceTypeId: "svc", startAt: kl(dag, "10:00"), endAt: kl(dag, "11:00"), plassNr: 1 }];
  const slots = await getAvailableSlots("svc", dag);
  assert.ok(klokkeslett(slots).includes("10:00"), "samme økt skal fortsatt kunne deles");
  assert.ok(!klokkeslett(slots).includes("09:00"), "luka rett før skal blokkeres av bufferen");
});

test("maks dager fram: dagen etter vinduet gir ingen luker, siste dag i vinduet gir luker", async () => {
  tjeneste = { ...standard(), maksDagerFram: 7 };
  // Dag 0 er i dag, så dag 6 er siste dag i vinduet (sju dager til sammen).
  assert.equal((await getAvailableSlots("svc", dagFram(7))).length, 0);
  assert.ok((await getAvailableSlots("svc", dagFram(6))).length > 0);
});

test("minste varsel: luker nærmere enn fristen tilbys ikke", async () => {
  // 48 timer varsel: i morgen har ingen luker, om tre dager har alle.
  tjeneste = { ...standard(), minVarselTimer: 48 };
  assert.equal((await getAvailableSlots("svc", dagFram(1))).length, 0);
  assert.equal((await getAvailableSlots("svc", dagFram(3))).length, 7);
});

test("dagInnenforMaksFram og tidligsteStart er rene hjelpere", () => {
  const naa = new Date(2026, 9, 15, 12, 0, 0);
  assert.equal(dagInnenforMaksFram(new Date(2026, 9, 15), 7, naa), true);
  assert.equal(dagInnenforMaksFram(new Date(2026, 9, 21), 7, naa), true);
  assert.equal(dagInnenforMaksFram(new Date(2026, 9, 22), 7, naa), false);
  assert.equal(dagInnenforMaksFram(new Date(2026, 9, 14), 7, naa), false);
  assert.equal(tidligsteStart(naa, 24).getTime(), new Date(2026, 9, 16, 12, 0, 0).getTime());
  assert.equal(tidligsteStart(naa, -5).getTime(), naa.getTime());
});

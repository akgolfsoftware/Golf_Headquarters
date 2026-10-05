import test from "node:test";
import assert from "node:assert/strict";
import {
  bekreftPH23Booking,
  byggSlotData,
  slotNokkel,
  formatKr,
  beregnTjenestePris,
  getSyntheticPH23Data,
  mapHubDataToPH23,
  type PH23Service,
} from "./ph23-booking-data";

test("formaterer priser i kroner riktig", () => {
  assert.equal(formatKr(null), "—");
  assert.equal(formatKr(undefined), "—");
  assert.equal(formatKr(0), "0 kr");
  assert.equal(formatKr(950), "950 kr");
  assert.equal(formatKr(12500), "12 500 kr");
});

test("beregner tjenestepris riktig for fastpris og timepris", () => {
  const serviceFastpris: PH23Service = {
    id: "bay",
    name: "Bay",
    min: 60,
    coach: null,
    clip: false,
    price: 350,
  };
  assert.equal(beregnTjenestePris(serviceFastpris, 950), 350);

  const serviceTimepris: PH23Service = {
    id: "pt30",
    name: "Privattime 30m",
    min: 30,
    coach: "Coach",
    clip: true,
    price: null,
  };
  assert.equal(beregnTjenestePris(serviceTimepris, 900), 450);
});

test("returnerer syntetiske data med forventet struktur", () => {
  const data = getSyntheticPH23Data(false);
  assert.ok(data.services.length > 0);
  assert.equal(data.days.length, 5);
  assert.equal(data.card.total, 4);
  assert.equal(data.mine.length, 1);

  const emptyData = getSyntheticPH23Data(true);
  assert.equal(emptyData.card.left, 0);
  assert.equal(emptyData.mine.length, 0);
  assert.equal(emptyData.past.length, 0);
});

test("mapHubDataToPH23 mapper ekte hub-data korrekt", () => {
  const dummyHub = {
    credits: {
      monthlyCredits: 4,
      creditsRemaining: 3,
      renewsAtIso: "2026-10-01T00:00:00.000Z",
      canUseCredits: true,
      tier: "FULL",
    },
    upcoming: [
      {
        id: "b10",
        serviceName: "Privattime",
        locationName: "Studio",
        coachName: "Anders",
        startIso: "2026-10-05T14:00:00.000Z",
        durationMin: 60,
        fromCredits: true,
        status: "CONFIRMED" as const,
      },
    ],
    past: [
      {
        id: "b09",
        serviceName: "Privattime",
        locationName: "Studio",
        coachName: "Anders",
        startIso: "2026-09-20T14:00:00.000Z",
        durationMin: 60,
      },
    ],
  };

  const res = mapHubDataToPH23(dummyHub, "spiller@akgolf.test");
  assert.equal(res.playerEmail, "spiller@akgolf.test");
  assert.equal(res.card.total, 4);
  assert.equal(res.card.left, 3);
  assert.equal(res.mine[0]?.id, "b10");
  assert.equal(res.mine[0]?.pay, "Klipp");
  assert.equal(res.past[0]?.id, "b09");
});


const tomHub = {
  credits: { monthlyCredits: 0, creditsRemaining: 0, renewsAtIso: null, canUseCredits: false, tier: "GRATIS" },
  upcoming: [],
  past: [],
};

test("produksjonsdata uten tider, timer eller tjenester gir aldri demodata", () => {
  const res = mapHubDataToPH23(tomHub, "spiller@akgolf.test", []);
  assert.deepEqual(res.days, []);
  assert.deepEqual(res.slots, {});
  assert.deepEqual(res.slotDetails, {});
  assert.deepEqual(res.mine, []);
  assert.deepEqual(res.past, []);
  assert.deepEqual(res.services, []);
  assert.equal(res.rate, null);
  assert.equal(res.card.pkg, "Ingen pakke");
  assert.equal(res.card.total, 0);
  assert.equal(res.card.valid, "—");

  const tomtVindu = mapHubDataToPH23(tomHub, "spiller@akgolf.test", undefined, { dager: [] });
  assert.deepEqual(tomtVindu.days, []);
  assert.deepEqual(tomtVindu.slots, {});
  assert.deepEqual(tomtVindu.services, []);
});

test("tjeneste uten pris gir ukjent pris, ikke en oppdiktet timepris", () => {
  const res = mapHubDataToPH23(tomHub, "x", [{ id: "s1", name: "Privattime", min: 60, coach: null, clip: true, price: null }]);
  assert.equal(beregnTjenestePris(res.services[0]!, res.rate), null);
  assert.equal(formatKr(beregnTjenestePris(res.services[0]!, res.rate)), "—");
});

test("byggSlotData gjør bare ekte tider med eksakt start bookbare", () => {
  const data = byggSlotData({
    dager: [
      {
        datoIso: "2026-10-06T00:00:00",
        tider: [
          { kl: "15:00", coachId: "c1", coachNavn: "Coach En", startIso: "2026-10-06T15:00:00" },
          { kl: "16:00", coachId: "c1", coachNavn: "Coach En" },
        ],
      },
    ],
  });
  assert.equal(data.days.length, 1);
  assert.deepEqual(data.slots[0], ["15:00"]);
  assert.deepEqual(data.slotDetails[slotNokkel(0, "15:00")], {
    startIso: "2026-10-06T15:00:00",
    coachId: "c1",
    coachNavn: "Coach En",
  });
  assert.equal(data.slotDetails[slotNokkel(0, "16:00")], undefined);
});

const slot = { startIso: "2026-10-06T15:00:00", coachId: "c1", coachNavn: "Coach En" };

test("bekreft med klipp kaller credit-flyten og bekrefter bare med serverens booking-id", async () => {
  const kall: unknown[] = [];
  const res = await bekreftPH23Booking(
    { serviceTypeId: "s1", slot, betaling: "Klipp" },
    {
      opprettMedKlipp: async (input) => {
        kall.push(input);
        return { bookingId: "bk-123" };
      },
      opprettMedKort: async () => {
        throw new Error("skal ikke kalles");
      },
    },
  );
  assert.deepEqual(kall, [{ serviceTypeId: "s1", coachId: "c1", start: "2026-10-06T15:00:00" }]);
  assert.deepEqual(res, { type: "bekreftet", bookingId: "bk-123" });
});

test("bekreft med kort sender til Stripe Checkout og bekrefter ikke timen selv", async () => {
  const kall: unknown[] = [];
  const res = await bekreftPH23Booking(
    { serviceTypeId: "s1", slot, betaling: "Kort" },
    {
      opprettMedKlipp: async () => {
        throw new Error("skal ikke kalles");
      },
      opprettMedKort: async (input) => {
        kall.push(input);
        return { ok: true as const, url: "https://checkout.stripe.com/x" };
      },
    },
  );
  assert.deepEqual(kall, [{ serviceTypeId: "s1", coachId: "c1", startIso: "2026-10-06T15:00:00" }]);
  assert.deepEqual(res, { type: "betaling", url: "https://checkout.stripe.com/x" });
});

test("feil fra serveren gir feil, aldri «booket»", async () => {
  const kast = await bekreftPH23Booking(
    { serviceTypeId: "s1", slot, betaling: "Klipp" },
    {
      opprettMedKlipp: async () => {
        throw new Error("Tidspunktet er ikke lenger ledig.");
      },
      opprettMedKort: async () => ({ ok: false as const, grunn: "x" }),
    },
  );
  assert.deepEqual(kast, { type: "feil", grunn: "Tidspunktet er ikke lenger ledig." });

  const avvist = await bekreftPH23Booking(
    { serviceTypeId: "s1", slot, betaling: "Kort" },
    {
      opprettMedKlipp: async () => ({ bookingId: "x" }),
      opprettMedKort: async () => ({ ok: false as const, grunn: "Tjenesten mangler gyldig pris — kontakt oss." }),
    },
  );
  assert.deepEqual(avvist, { type: "feil", grunn: "Tjenesten mangler gyldig pris — kontakt oss." });
});

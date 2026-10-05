import test from "node:test";
import assert from "node:assert/strict";
import {
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


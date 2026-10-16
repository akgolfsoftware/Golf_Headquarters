import assert from "node:assert/strict";
import { test } from "node:test";
import { HendelseInputSchema, osloHendelseTid } from "./hendelser-kontrakt";
import { TurneringsplanInputSchema, tomTurneringsmetadata } from "./turneringsplan-kontrakt";
import { gjentakelsesDatoer, FlyttPlanOktSchema } from "./plan-handlinger-kontrakt";
const event = { playerId: "syntetisk", title: "Syntetisk reise", kind: "REISE", startDate: "2027-01-04", endDate: "2027-01-04", startMinute: 600, endMinute: 660, recurring: "NONE", isPrivate: true, note: null };
const plan = { playerId: "syntetisk", title: "Syntetisk turnering", focus: "UTVIKLING", startDate: "2027-01-04", endDate: "2027-01-05", travelStartDate: "2027-01-03", travelEndDate: "2027-01-06", metadata: tomTurneringsmetadata(), rounds: [{ date: "2027-01-04", teeTimeMinutes: 0 }] };
test("hendelser validerer faktiske datoer, privatfelt og basisrevisjon", () => {
 assert.ok(HendelseInputSchema.safeParse(event).success);
 assert.equal(HendelseInputSchema.safeParse({ ...event, startDate: "2027-02-29" }).success, false);
 assert.equal(HendelseInputSchema.safeParse({ ...event, id: "syntetisk" }).success, false);
 assert.equal(HendelseInputSchema.safeParse({ ...event, startMinute: -1 }).success, false);
 assert.equal(HendelseInputSchema.safeParse({ ...event, extraOwner: "andre" }).success, false);
});
test("Oslo veggklokke over begge sommertidsskifter; manglende og tvetydig time avvises", () => {
 assert.equal(osloHendelseTid("2027-01-04", 600).toISOString(), "2027-01-04T09:00:00.000Z");
 assert.equal(osloHendelseTid("2027-03-29", 600).toISOString(), "2027-03-29T08:00:00.000Z");
 assert.equal(osloHendelseTid("2027-10-25", 600).toISOString(), "2027-10-25T08:00:00.000Z");
 assert.equal(osloHendelseTid("2027-11-01", 600).toISOString(), "2027-11-01T09:00:00.000Z");
 assert.throws(() => osloHendelseTid("2027-03-28", 150)); assert.throws(() => osloHendelseTid("2027-10-31", 150));
});
test("runder/hull/WAGR har eget kildeår, rå0 bevares, ingen oppdiktet WAGR maksimum", () => {
 for (const holes of [9, 18]) for (const wagrPower of [0, 10000]) assert.ok(TurneringsplanInputSchema.safeParse({ ...plan, metadata: { ...plan.metadata, holes, wagrPower, wagrSourceYear: 2026, wagrSource: "Syntetisk originalkilde" } }).success);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, metadata: { ...plan.metadata, wagrPower: 0 } }).success, false);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, metadata: { ...plan.metadata, holes: 12 } }).success, false);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, metadata: { ...plan.metadata, dgFieldStrength: 2 } }).success, false);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, rounds: [{ date: "2027-01-06", teeTimeMinutes: null }] }).success, false);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, travelEndDate: null }).success, false);
 assert.equal(TurneringsplanInputSchema.safeParse({ ...plan, id: "syntetisk-plan" }).success, false);
});
test("gjentakelser bevarer kalenderdato over ISO-år, uke40→41 og begge sommertidsskifter", () => {
 assert.deepEqual(gjentakelsesDatoer("2026-12-28", 3), ["2026-12-28", "2027-01-04", "2027-01-11"]);
 assert.deepEqual(gjentakelsesDatoer("2026-09-28", 2), ["2026-09-28", "2026-10-05"]);
 assert.deepEqual(gjentakelsesDatoer("2027-03-22", 3), ["2027-03-22", "2027-03-29", "2027-04-05"]);
 assert.deepEqual(gjentakelsesDatoer("2027-10-25", 2), ["2027-10-25", "2027-11-01"]);
 assert.throws(() => gjentakelsesDatoer("2027-02-30", 2)); assert.throws(() => gjentakelsesDatoer("2027-01-04", 53));
 assert.equal(FlyttPlanOktSchema.safeParse({ playerId: "syntetisk", sessionId: "syntetisk", expectedUpdatedAt: "2027-01-01T00:00:00Z", date: "2027-01-04", startMinute: 1430, durationMinutes: 60 }).success, false);
});

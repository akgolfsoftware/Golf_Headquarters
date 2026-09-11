import assert from "node:assert/strict";
import { test } from "node:test";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import { byggPlanUke, nyPlanOktHref, plasserPlanBlokker, planTidsrom, type PlanBlokk } from "./plan-visning";

const session: TodaySession = { id: "okt", title: "Teknikk", startTime: new Date("2026-03-29T06:00Z"), endTime: new Date("2026-03-29T07:00Z"), status: "COMPLETED", practiceType: "BLOKK", pyramidArea: "TEK", durationMin: 60, sted: null, maalsetning: null, drills: [], href: "/portal/live/okt/summary" };
const week: WeekDay[] = [{ date: new Date("2026-03-29T10:00Z"), dayLabel: "Søn", dayNumber: 29, isToday: true, sessions: [session] }];
const skole: PlanBlokk = { id: "skole", lag: "SKOLE", tittel: "Prøve", dato: "2026-03-29", startMin: null, sluttMin: null, heldag: true, lesevisning: true };

test("samme uke gir norsk klokke, reell fullføring, synlig skole og forslag utenfor fremdrift", () => {
  const plan = byggPlanUke(week, [skole, { ...skole, id: "gammel", dato: "2026-03-30" }], [{ coachName: null, session: { ...session, id: "forslag", status: "PLANNED" } }]);
  assert.deepEqual(plan.dager[0].blokker.map((b) => b.id), ["skole", "okt-forslag", "okt-okt"]);
  assert.equal(plan.dager[0].blokker[1].startMin, 480);
  assert.equal(plan.fremdrift.planlagt, 1);
  assert.equal(plan.fremdrift.gjennomfort, 1);
  assert.equal(plan.minutter.plannedMin, 60);
  assert.equal(plan.dager[0].blokker[0].startMin, null);
});

test("avlyst og begrunnet fravær skilles fra ubegrunnet fravær i planens teller", () => {
  const plan = byggPlanUke([{ ...week[0], sessions: [session, { ...session, id: "avlyst", status: "CANCELLED" }, { ...session, id: "syk", status: "SKIPPED", avbruddAarsak: "SYK" }, { ...session, id: "uten", status: "SKIPPED" }] }], [], []);
  assert.equal(plan.fremdrift.planlagt, 2);
  assert.equal(plan.fremdrift.andel, .5);
  assert.equal(plan.minutter.plannedMin, 120);
  assert.equal(byggPlanUke([], [], []).fremdrift.andel, null);
});

test("overlapp og minimumshøyde får egne spor; uavhengige økter får full bredde", () => {
  const timed = (id: string, fra: number, til: number): PlanBlokk => ({ ...skole, id, lag: "OEKTER", heldag: false, startMin: fra, sluttMin: til });
  const rader = plasserPlanBlokker([timed("a", 540, 600), timed("b", 560, 620), timed("c", 600, 630), timed("d", 720, 725), timed("e", 730, 735), timed("f", 900, 960), skole]);
  assert.deepEqual(rader.map((b) => [b.blokk.id, b.spor, b.antallSpor]), [["a", 0, 2], ["b", 1, 2], ["c", 0, 2], ["d", 0, 2], ["e", 1, 2], ["f", 0, 1]]);
  const rom = planTidsrom([{ dato: skole.dato, datoTall: 29, navn: "Søn", idag: true, blokker: [timed("tidlig", 120, 180), timed("sent", 1430, 1440)] }]);
  assert.deepEqual(rom, { startHour: 2, endHour: 24 });
});

test("ny økt følger valgt dato og uke gjennom eksisterende Workbench-inngang", () => {
  const url = new URL(nyPlanOktHref("2026-12-31", 3), "https://example.invalid");
  assert.equal(url.pathname, "/portal/planlegge/workbench");
  assert.equal(url.searchParams.get("uke"), "3");
  assert.equal(url.searchParams.get("start"), "2026-12-31T09:00");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { oversiktRad, velgPlan, type OversiktPlanInn } from "./tp-oversikt";

const oppg = (p: Partial<OversiktPlanInn["positions"][number]["tasks"][number]> = {}) => ({
  status: "ACTIVE", repsMaalDry: 10, repsMaalLav: 20, repsMaalFull: 0, repsGjortDry: 10, repsGjortLav: 5, repsGjortFull: 0, lastRepLoggedAt: null, ...p,
});
const plan = (p: Partial<OversiktPlanInn>): OversiktPlanInn => ({ id: "p", navn: "Plan", status: "DRAFT", startDato: new Date("2026-08-01"), positions: [], ...p });

test("aktiv plan vinner over nyere utkast", () => {
  const valgt = velgPlan([plan({ id: "utkast", startDato: new Date("2026-09-01") }), plan({ id: "aktiv", status: "ACTIVE" })]);
  assert.equal(valgt?.id, "aktiv");
});

test("spiller uten plan får tom rad med «—», aldri tall", () => {
  assert.deepEqual(oversiktRad({ id: "s", name: "Spiller" }, []), {
    id: "s", navn: "Spiller", planId: null, planNavn: null, status: null, oppgaver: 0, gjort: 0, maal: 0, sistRegistrert: "—", antallPlaner: 0,
  });
});

test("summerer reps og siste registrering, uten arkiverte oppgaver", () => {
  const r = oversiktRad({ id: "s", name: "S" }, [plan({ status: "ACTIVE", positions: [{ tasks: [
    oppg({ lastRepLoggedAt: new Date("2026-09-20T10:00:00Z") }),
    oppg({ lastRepLoggedAt: new Date("2026-09-26T10:00:00Z") }),
    oppg({ status: "ARCHIVED", repsGjortDry: 999 }),
  ] }] })]);
  assert.equal(r.oppgaver, 2);
  assert.equal(r.gjort, 30);
  assert.equal(r.maal, 60);
  assert.equal(r.sistRegistrert, "26.09.2026");
  assert.equal(r.status, "Aktiv");
});

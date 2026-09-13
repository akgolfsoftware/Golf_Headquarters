import assert from "node:assert/strict";
import { test } from "node:test";
import { skallAktivFraPath } from "./skall-ia";
import {
  AGENCYOS_COACH_REISE,
  AGENCYOS_SPILLER_VAKT,
  agencyosEtterPublisering,
  agencyosSpillerkortHref,
  agencyosStallMedValgtHref,
  agencyosWorkbenchHref,
  sammeSpillerGjennomReise,
} from "./coach-reise";

test("J04 holder samme spiller-id fra kort til plan", () => {
  const reise = sammeSpillerGjennomReise("spiller-1");
  assert.equal(reise.kort, "/admin/spillere/spiller-1");
  assert.equal(reise.plan, "/admin/workbench/spiller-1");
  assert.equal(agencyosSpillerkortHref("spiller-1"), reise.kort);
  assert.equal(agencyosWorkbenchHref("spiller-1"), reise.plan);
  assert.equal(reise.stallValgt, "/admin/spillere?v=spiller-1");
  assert.equal(agencyosStallMedValgtHref("spiller-1"), reise.stallValgt);
});

test("etter publisering peker stall, kort og plan på samme spiller", () => {
  const etter = agencyosEtterPublisering("spiller-1");
  assert.equal(etter.plan, "/admin/workbench/spiller-1");
  assert.equal(etter.kort, "/admin/spillere/spiller-1");
  assert.equal(etter.stallValgt, "/admin/spillere?v=spiller-1");
  assert.equal(AGENCYOS_SPILLER_VAKT, "coachScopedPlayerWhere");
  assert.equal(AGENCYOS_COACH_REISE.find((s) => s.steg === "stall")?.vakt.includes(AGENCYOS_SPILLER_VAKT), true);
  assert.equal(AGENCYOS_COACH_REISE.find((s) => s.steg === "spillerkort")?.vakt.includes(AGENCYOS_SPILLER_VAKT), true);
});

test("oppfølging hører i Stall, ikke Kø", () => {
  assert.equal(skallAktivFraPath("/admin/queue"), "stall");
  assert.equal(skallAktivFraPath("/admin/ko"), "ko");
  assert.equal(AGENCYOS_COACH_REISE.find((s) => s.steg === "oppfolging")?.href, "/admin/queue");
});

test("hjem og stall er egne adresser med samme rolleport", () => {
  assert.equal(AGENCYOS_COACH_REISE[0]?.href, "/admin/agencyos");
  assert.equal(AGENCYOS_COACH_REISE[1]?.href, "/admin/spillere");
});

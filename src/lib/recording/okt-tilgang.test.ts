import { test } from "node:test";
import assert from "node:assert/strict";
import { vurderOktOpptakTilgang } from "@/lib/recording/okt-tilgang";

const BASIS = {
  viewerRole: "COACH",
  viewerId: "coach-1",
  oktCoachId: "coach-1",
  oktStudentId: "spiller-1",
  harTilgangTilSpiller: true,
};

test("coachen som eier økta får ta opp", () => {
  const r = vurderOktOpptakTilgang(BASIS);
  assert.deepEqual(r, { ok: true, playerId: "spiller-1" });
});

test("annen coach med spilleren i stallen får ta opp", () => {
  const r = vurderOktOpptakTilgang({ ...BASIS, viewerId: "coach-2", harTilgangTilSpiller: true });
  assert.equal(r.ok, true);
});

test("annen coach UTEN spilleren i stallen avvises", () => {
  const r = vurderOktOpptakTilgang({ ...BASIS, viewerId: "coach-2", harTilgangTilSpiller: false });
  assert.deepEqual(r, { ok: false, grunn: "ingen-tilgang" });
});

test("ADMIN slipper gjennom selv uten stall-tilgang", () => {
  const r = vurderOktOpptakTilgang({
    ...BASIS,
    viewerRole: "ADMIN",
    viewerId: "admin-1",
    oktCoachId: "coach-9",
    harTilgangTilSpiller: false,
  });
  assert.equal(r.ok, true);
});

test("økt uten spiller avvises — også for ADMIN (ingen å innhente samtykke fra)", () => {
  const r = vurderOktOpptakTilgang({ ...BASIS, viewerRole: "ADMIN", oktStudentId: null });
  assert.deepEqual(r, { ok: false, grunn: "mangler-spiller" });
});

test("spilleren returneres fra økta, aldri fra kallerens ønske", () => {
  const r = vurderOktOpptakTilgang({ ...BASIS, oktStudentId: "spiller-9" });
  assert.equal(r.ok && r.playerId, "spiller-9");
});

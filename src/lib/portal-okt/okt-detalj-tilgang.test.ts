import assert from "node:assert/strict";
import { test } from "node:test";
import { kanSeOktDetalj } from "./okt-detalj-tilgang";

const okt = {
  studentId: "spiller",
  coachId: "tildelt-coach",
  hostId: "vert",
  participants: [{ userId: "invitert", status: "ACCEPTED" as const }],
};

test("egen spiller, tildelt coach, vert og akseptert deltaker får se øktarket", () => {
  for (const viewerId of ["spiller", "tildelt-coach", "vert", "invitert"]) {
    assert.equal(kanSeOktDetalj({ viewerId, ...okt, hasPlayerAccess: false }), true);
  }
});

test("uvedkommende coach uten spiller-tilgang avvises uten data", () => {
  assert.equal(
    kanSeOktDetalj({ viewerId: "fremmed-coach", ...okt, hasPlayerAccess: false }),
    false,
  );
});

test("coach med bekreftet spiller-tilgang får se øktarket", () => {
  assert.equal(
    kanSeOktDetalj({ viewerId: "lovlig-coach", ...okt, hasPlayerAccess: true }),
    true,
  );
});

test("avvist eller ventende invitasjon gir ikke innsyn", () => {
  for (const status of ["DECLINED", "PENDING", "INVITED"]) {
    assert.equal(
      kanSeOktDetalj({
        viewerId: "invitert",
        ...okt,
        participants: [{ userId: "invitert", status }],
        hasPlayerAccess: false,
      }),
      false,
    );
  }
});

test("fremmed spiller avvises", () => {
  assert.equal(
    kanSeOktDetalj({ viewerId: "annen-spiller", ...okt, hasPlayerAccess: false }),
    false,
  );
});

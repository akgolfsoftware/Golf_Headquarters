import assert from "node:assert/strict";
import { test } from "node:test";
import { datoIOslo, hashSamlingsprogram, samlingsInvitasjonId, samlingsOktKopiId } from "./samlingsinvitasjon-kontrakt";

const program = {
  versjon: 1 as const,
  samling: {
    id: "samling-syntetisk", groupId: "gruppe-syntetisk", tittel: "Syntetisk samling",
    beskrivelse: null, sted: "Testbane", fra: "2026-10-12T08:00:00.000Z", til: "2026-10-14T15:00:00.000Z",
    kind: "SAMLING" as const, updatedAt: "2026-10-02T10:00:00.000Z",
  },
  okter: [],
};

test("programversjon er stabil uavhengig av objektrekkefølge", () => {
  const first = hashSamlingsprogram(program);
  const second = hashSamlingsprogram({ ...program, samling: { ...program.samling } });
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.notEqual(hashSamlingsprogram({ ...program, samling: { ...program.samling, tittel: "Ny versjon" } }), first);
});

test("invitasjons-ID og Workbench-kopi-ID er stabile og mottakerspesifikke", () => {
  const version = hashSamlingsprogram(program);
  assert.equal(samlingsInvitasjonId("samling", "spiller-a", version), samlingsInvitasjonId("samling", "spiller-a", version));
  assert.notEqual(samlingsInvitasjonId("samling", "spiller-a", version), samlingsInvitasjonId("samling", "spiller-b", version));
  assert.notEqual(samlingsInvitasjonId("samling", "spiller-a", version), samlingsInvitasjonId("annen", "spiller-a", version));
  assert.equal(samlingsOktKopiId("oktkilde", "spiller-a"), samlingsOktKopiId("oktkilde", "spiller-a"));
  assert.notEqual(samlingsOktKopiId("oktkilde", "spiller-a"), samlingsOktKopiId("oktkilde", "spiller-b"));
});

test("datoer for samlinger følger Oslo-kalenderen også når UTC-datoen avviker", () => {
  assert.equal(datoIOslo(new Date("2026-10-25T23:30:00.000Z")), "2026-10-26");
});

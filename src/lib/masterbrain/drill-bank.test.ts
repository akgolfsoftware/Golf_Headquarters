import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRILL_BANK_EMPTY_CODE,
  DRILL_BANK_EMPTY_MELDING_NO,
  erMasterbrainDrillBankTom,
  erMuligForFasilitet,
  foreslaGodkjenteOvelsesbankElementer,
  hentGodkjenteOvelsesbankElementer,
  masterbrainDrillAntall,
  masterbrainDrillBankStatus,
  masterbrainKandidatAntall,
  masterbrainTilGodkjenningAntall,
} from "./drill-bank";

test("Masterbrain godkjentbank leser første Anders-godkjente batch", () => {
  const godkjente = hentGodkjenteOvelsesbankElementer();
  assert.equal(masterbrainDrillAntall(), 16);
  assert.equal(erMasterbrainDrillBankTom(), false);
  assert.equal(godkjente.length, 16);
  assert.equal(
    godkjente.some((item) => item.id === "ring-rundt-hull-1m-360-8baller"),
    true,
  );
});

test("status teller kandidater og batcher uten å gjøre dem til fasit", () => {
  const s = masterbrainDrillBankStatus();
  assert.equal(s.tom, false);
  assert.equal(s.antall, 16);
  assert.equal(s.godkjentAntall, 16);
  assert.equal(s.kandidatAntall, 895);
  assert.equal(s.tilGodkjenningAntall, 0);
  assert.equal(masterbrainKandidatAntall(), 895);
  assert.equal(masterbrainTilGodkjenningAntall(), 0);
  assert.equal(s.status, "GODKJENT");
  assert.match(s.agentRegel, /aldri|ikke|oppbygging/i);
});

test("empty-kode og norsk melding er stabile for agenter", () => {
  assert.equal(DRILL_BANK_EMPTY_CODE, "DRILL_BANK_EMPTY");
  assert.match(DRILL_BANK_EMPTY_MELDING_NO, /under oppbygging/);
  assert.match(DRILL_BANK_EMPTY_MELDING_NO, /ikke en oppdiktet/);
});

test("fasilitetsfilter stopper øvelser som krever lengre puttinggreen", () => {
  const forslag = foreslaGodkjenteOvelsesbankElementer({
    sgKode: "PUTT",
    fasilitetProfil: {
      playerFacilities: [
        {
          name: "kort puttingmatte",
          capabilities: ["PUTTING_GREEN_KORT"],
          maksPuttLengdeM: 2,
        },
      ],
    },
    limit: 30,
  });

  assert.ok(forslag.length > 0);
  assert.equal(
    forslag.some((item) => item.id === "drawback-1m-knockout"),
    false,
  );
  assert.equal(
    forslag.every((item) => erMuligForFasilitet(item, {
      playerFacilities: [
        {
          capabilities: ["PUTTING_GREEN_KORT"],
          maksPuttLengdeM: 2,
        },
      ],
    })),
    true,
  );
});

test("lang nok puttinggreen slipper gjennom lengre puttingdrill", () => {
  const forslag = foreslaGodkjenteOvelsesbankElementer({
    sgKode: "PUTT",
    fasilitetProfil: {
      playerFacilities: [
        {
          name: "stor puttinggreen",
          capabilities: ["PUTTING_GREEN_KORT"],
          maksPuttLengdeM: 5,
        },
      ],
    },
    limit: 30,
  });

  assert.equal(
    forslag.some((item) => item.id === "drawback-1m-knockout"),
    true,
  );
});

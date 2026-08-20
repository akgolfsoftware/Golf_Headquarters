import { test } from "node:test";
import assert from "node:assert/strict";

import {
  erLenket,
  etterHandling,
  klassifiser,
  loesriver,
  skalPropagere,
  synkesVedInnmelding,
  vedGruppeExit,
  type Handling,
  type KopiTilstand,
} from "@/lib/domain/gruppesynk";

const NAA = new Date("2026-08-20T10:00:00Z");

function lenket(): KopiTilstand {
  return { sourceGroupSessionId: "gr-okt-1", sourceGroupId: "grp-wang", detachedAt: null };
}

test("oppmøte og gjennomføring løsriver aldri", () => {
  const uskyldige: Handling[] = [
    "DELTAR_IKKE",
    "MELD_DELTAKELSE",
    "LOGG_REPS",
    "LOGG_TID",
    "HOPP_OVER_DRILL",
    "LEGG_TIL_MEDIA",
    "SKRIV_KOMMENTAR",
    "TALENOTAT",
    "SETT_VURDERING",
    "FULLFOR_OKT",
  ];
  for (const h of uskyldige) {
    assert.equal(loesriver(h), false, h);
    assert.equal(etterHandling(lenket(), h, NAA).detachedAt, null, h);
  }
});

test("planendring løsriver permanent", () => {
  const planendringer: Handling[] = [
    "ENDRE_DRILL",
    "LEGG_TIL_DRILL",
    "SLETT_DRILL",
    "ENDRE_REPS_PLAN",
    "ENDRE_TID_PLAN",
    "FLYTT_OKT",
    "ENDRE_OKT_RAMME",
  ];
  for (const h of planendringer) {
    assert.equal(klassifiser(h), "PLANENDRING", h);
    assert.deepEqual(etterHandling(lenket(), h, NAA).detachedAt, NAA, h);
  }
});

test("opphavsstempelet overlever løsrivelsen", () => {
  // Kalenderen skal fortsatt kunne si HVILKEN gruppe økta kom fra.
  const etter = etterHandling(lenket(), "ENDRE_DRILL", NAA);
  assert.equal(etter.sourceGroupId, "grp-wang");
  assert.equal(etter.sourceGroupSessionId, "gr-okt-1");
  assert.equal(erLenket(etter), false);
});

test("løsrivelse skjer én gang — tidspunktet flyttes ikke av senere endringer", () => {
  const forst = etterHandling(lenket(), "FLYTT_OKT", NAA);
  const senere = new Date("2026-08-25T10:00:00Z");
  const etter = etterHandling(forst, "SLETT_DRILL", senere);
  assert.deepEqual(etter.detachedAt, NAA);
});

test("coach-endring når kun lenkede, uberørte økter", () => {
  assert.equal(skalPropagere(lenket(), "PLANNED"), true);
  // Fullført økt er frossen historikk.
  assert.equal(skalPropagere(lenket(), "COMPLETED"), false);
  assert.equal(skalPropagere(lenket(), "IN_PROGRESS"), false);
  // Løsrevet kopi er spillerens egen.
  const loesrevet = etterHandling(lenket(), "ENDRE_DRILL", NAA);
  assert.equal(skalPropagere(loesrevet, "PLANNED"), false);
  // Individuell økt uten gruppeopphav berøres aldri.
  assert.equal(
    skalPropagere({ sourceGroupSessionId: null, sourceGroupId: null, detachedAt: null }, "PLANNED"),
    false,
  );
});

test("ved gruppe-exit slettes kun fremtidige lenkede kopier", () => {
  assert.equal(vedGruppeExit(lenket(), "PLANNED"), "SLETT");
  // Gjennomført historikk beholdes hos spilleren, med gruppestempel.
  assert.equal(vedGruppeExit(lenket(), "COMPLETED"), "BEHOLD");
  assert.equal(vedGruppeExit(lenket(), "SKIPPED"), "BEHOLD");
  // Løsrevne økter er spillerens egne og består.
  assert.equal(vedGruppeExit(etterHandling(lenket(), "FLYTT_OKT", NAA), "PLANNED"), "BEHOLD");
});

test("innmelding synker kun fremover, aldri bakover", () => {
  const innmeldt = new Date("2026-08-20T10:00:00Z");
  assert.equal(synkesVedInnmelding(new Date("2026-08-21T09:00:00Z"), innmeldt), true);
  assert.equal(synkesVedInnmelding(new Date("2026-08-19T09:00:00Z"), innmeldt), false);
  assert.equal(synkesVedInnmelding(innmeldt, innmeldt), false);
});

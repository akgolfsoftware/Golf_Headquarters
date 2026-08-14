import { test } from "node:test";
import assert from "node:assert/strict";

import { byggUkesrapport } from "@/lib/admin/ukesrapport";
import type { Etterlevelse } from "@/lib/domain/etterlevelse";

const UKE_START = new Date("2026-08-10T00:00:00+02:00");
const NA = new Date("2026-08-14T18:00:00+02:00");

function e(over: Partial<Etterlevelse> = {}): Etterlevelse {
  return { teller: 0, nevner: 0, hoppet: 0, ulogget: 0, ...over };
}

function bygg(over: Partial<Parameters<typeof byggUkesrapport>[0]> = {}) {
  return byggUkesrapport({
    etterlevelse: e(),
    testforfall: [],
    antallSpillere: 12,
    ukeStart: UKE_START,
    now: NA,
    ...over,
  });
}

test("tom stall gir ingen rapport — ikke et kort fullt av nuller", () => {
  assert.equal(bygg(), null);
});

test("testforfall alene er nok til å rapportere", () => {
  const kort = bygg({ testforfall: [new Date("2026-08-19T12:00:00+02:00")] });

  assert.ok(kort);
  assert.equal(kort.tall.length, 1);
  assert.equal(kort.tall[0].key, "testforfall");
  assert.match(kort.tall[0].nevner, /neste/, "forfallsdato skal stå som nevner");
});

test("etterlevelse vises med nevneren i klartekst", () => {
  const kort = bygg({ etterlevelse: e({ teller: 14, nevner: 16, ulogget: 2 }) });

  assert.ok(kort);
  const rad = kort.tall.find((t) => t.key === "etterlevelse");
  assert.equal(rad?.verdi, "14/16");
  assert.equal(rad?.nevner, "publiserte økter med passert slutt");
});

test("hoppet og ulogget rapporteres som egne rader, ikke slått sammen", () => {
  const kort = bygg({
    etterlevelse: e({ teller: 10, nevner: 14, hoppet: 3, ulogget: 1 }),
  });

  assert.ok(kort);
  assert.equal(kort.tall.find((t) => t.key === "hoppet")?.verdi, "3");
  assert.equal(kort.tall.find((t) => t.key === "ikke logget")?.verdi, "1");
});

test("rader uten innhold utelates helt", () => {
  const kort = bygg({ etterlevelse: e({ teller: 4, nevner: 4 }) });

  assert.ok(kort);
  assert.equal(kort.tall.length, 1, "kun etterlevelse — ingen tomme nullrader");
});

test("hvorfor-detaljen navngir agenten, datagrunnlaget og nevneren", () => {
  const kort = bygg({ etterlevelse: e({ teller: 1, nevner: 2, ulogget: 1 }) });

  assert.ok(kort);
  assert.equal(kort.hvorfor.length, 3);
  assert.match(kort.hvorfor[0], /Rapportagent/);
  assert.match(kort.hvorfor[0], /skriver aldri/, "leser-ikke-skriver må stå eksplisitt");
  assert.match(kort.hvorfor[1], /12 spillere/);
  assert.match(kort.hvorfor[2], /publiserte økter med passert slutt/);
});

test("ukenummer regnes fra ukestart", () => {
  const kort = bygg({ etterlevelse: e({ teller: 1, nevner: 1 }) });

  assert.ok(kort);
  assert.equal(kort.ukenummer, 33, "10.–16. august 2026 er uke 33");
});

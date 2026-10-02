import { test } from "node:test";
import assert from "node:assert/strict";

import {
  etterlevelse,
  etterlevelseTekst,
  summerEtterlevelse,
  type EtterlevelseOkt,
} from "@/lib/domain/etterlevelse";

const NA = new Date("2026-08-05T12:00:00Z");

function okt(
  dagerSiden: number,
  status: EtterlevelseOkt["status"],
  durationMin = 60,
): EtterlevelseOkt {
  return {
    scheduledAt: new Date(NA.getTime() - dagerSiden * 86_400_000),
    durationMin,
    status,
  };
}

test("teller gjennomførte økter mot forfalte, ikke mot alle planlagte", () => {
  const e = etterlevelse(
    [
      okt(3, "COMPLETED"),
      okt(2, "COMPLETED"),
      okt(1, "PLANNED"), // forfalt uten logging
      okt(-2, "PLANNED"), // fremtidig — skal ikke telle
      okt(-3, "PLANNED"), // fremtidig
    ],
    NA,
  );

  assert.equal(e.teller, 2);
  assert.equal(e.nevner, 3, "fremtidige økter må holdes utenfor nevneren");
  assert.equal(etterlevelseTekst(e), "67 %");
});

test("hoppet og ulogget rapporteres hver for seg", () => {
  const e = etterlevelse(
    [okt(3, "COMPLETED"), okt(2, "SKIPPED"), okt(1, "PLANNED")],
    NA,
  );

  assert.equal(e.hoppet, 1, "SKIPPED er et aktivt nei fra spilleren");
  assert.equal(e.ulogget, 1, "forfalt PLANNED er stillhet, ikke et nei");
  assert.equal(e.nevner, 3, "begge er utenfor telleren, men inne i nevneren");
});

test("avbrutt og kansellert regnes som hoppet, ikke som stillhet", () => {
  const e = etterlevelse([okt(2, "ABANDONED"), okt(1, "CANCELLED")], NA);

  assert.equal(e.hoppet, 2);
  assert.equal(e.ulogget, 0);
});

test("en økt som nettopp er ferdig teller med, en som fortsatt pågår gjør ikke", () => {
  // Starter for 30 min siden, varer 60 min → slutter om 30 min.
  const pagar: EtterlevelseOkt = {
    scheduledAt: new Date(NA.getTime() - 30 * 60_000),
    durationMin: 60,
    status: "PLANNED",
  };
  // Startet for 90 min siden, varte 60 min → sluttet for 30 min siden.
  const nettoppFerdig: EtterlevelseOkt = {
    scheduledAt: new Date(NA.getTime() - 90 * 60_000),
    durationMin: 60,
    status: "PLANNED",
  };

  assert.equal(etterlevelse([pagar], NA).nevner, 0, "pågående økt er fremtidig");
  assert.equal(etterlevelse([nettoppFerdig], NA).nevner, 1);
});

test("ingen forfalte økter gir null — ikke «0/0»", () => {
  const e = etterlevelse([okt(-1, "PLANNED"), okt(-4, "PLANNED")], NA);

  assert.equal(e.nevner, 0);
  assert.equal(
    etterlevelseTekst(e),
    null,
    "flatene skal vise tom tilstand, aldri en brøk uten innhold",
  );
});

test("tom uke gir null", () => {
  assert.equal(etterlevelseTekst(etterlevelse([], NA)), null);
});

test("full uke uten avvik gir 100 prosent", () => {
  const e = etterlevelse([okt(3, "COMPLETED"), okt(2, "COMPLETED")], NA);

  assert.equal(etterlevelseTekst(e), "100 %");
  assert.equal(e.hoppet, 0);
  assert.equal(e.ulogget, 0);
});


test("minutter vektes: én kort fullført og én lang ulogget gir 25 %, ikke 50 %", () => {
  const e = etterlevelse([okt(2, "COMPLETED", 30), okt(1, "PLANNED", 90)], NA);
  assert.equal(e.pct, 25);
  assert.equal(e.gjennomfortMinutter, 30);
  assert.equal(e.planlagtMinutter, 120);
});

test("fireukersgrensen er inklusiv på start og utelukker eldre økter", () => {
  const e = etterlevelse([okt(28, "COMPLETED", 30), okt(29, "PLANNED", 90),
    { ...okt(28, "PLANNED", 90), scheduledAt: new Date(NA.getTime() - 28 * 86_400_000 - 1) }], NA);
  assert.equal(e.nevner, 1);
  assert.equal(e.pct, 100);
});

for (const status of ["PLANNED", "ACTIVE", "IN_PROGRESS", "COMPLETED", "SKIPPED", "CANCELLED", "ABANDONED"] as const) {
  test(`fremtidig eller pågående ${status} teller aldri før planlagt slutt`, () => {
    assert.equal(etterlevelse([okt(-1, status)], NA).pct, null);
    assert.equal(etterlevelse([{ ...okt(0, status), scheduledAt: new Date(NA.getTime() - 30 * 60_000) }], NA).pct, null);
  });
}

test("nøyaktig planlagt slutt teller; ett millisekund før teller ikke", () => {
  const session = { ...okt(0, "COMPLETED"), scheduledAt: new Date(NA.getTime() - 60 * 60_000) };
  assert.equal(etterlevelse([session], NA).pct, 100);
  assert.equal(etterlevelse([session], new Date(NA.getTime() - 1)).pct, null);
});

test("ugyldige eller tomme minutter gir ingen falsk prosent", () => {
  const e = etterlevelse([0, -60, NaN, Infinity].map(d => okt(1, "COMPLETED", d)), NA);
  assert.equal(e.pct, null);
  assert.equal(e.nevner, 0);
  assert.equal(etterlevelse([{ ...okt(1, "COMPLETED"), scheduledAt: new Date(NaN) }], NA).pct, null);
});

test("avlyste/avbrutte forfalte økter er avvik i den bindende minuttregelen", () => {
  const e = etterlevelse([okt(3, "COMPLETED", 30), okt(2, "SKIPPED", 30), okt(1, "CANCELLED", 30), okt(4, "ABANDONED", 30)], NA);
  assert.equal(e.pct, 25);
  assert.equal(e.hoppet, 3);
});


test("stallrapporten summerer minutter, ikke gjennomsnitt av prosenter", () => {
  const sum = summerEtterlevelse([etterlevelse([okt(1, "COMPLETED", 30)], NA), etterlevelse([okt(1, "PLANNED", 90)], NA)]);
  assert.equal(sum.pct, 25);
  assert.equal(sum.gjennomfortMinutter, 30);
  assert.equal(sum.planlagtMinutter, 120);
  assert.equal(summerEtterlevelse([]).pct, null);
});

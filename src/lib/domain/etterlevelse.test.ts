import { test } from "node:test";
import assert from "node:assert/strict";

import {
  etterlevelse,
  etterlevelseTekst,
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
  assert.equal(etterlevelseTekst(e), "2/3");
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

test("full uke uten avvik gir hel brøk", () => {
  const e = etterlevelse([okt(3, "COMPLETED"), okt(2, "COMPLETED")], NA);

  assert.equal(etterlevelseTekst(e), "2/2");
  assert.equal(e.hoppet, 0);
  assert.equal(e.ulogget, 0);
});

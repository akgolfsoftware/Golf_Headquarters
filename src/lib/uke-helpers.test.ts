/**
 * Tester for `uke-helpers.ts` (steg 6 i `docs/plan-testdekning.md`).
 *
 * Dette er den kanoniske Oslo-modulen: `gotchas.md` sier at ALL dato/uke-logikk
 * skal gå gjennom den i stedet for rå `getDay()`/`setHours()`. Den sto likevel
 * uten en eneste test — altså var repoets svar på tre separate tidssonefeil selv
 * udekket.
 *
 * Feilklassen er usynlig lokalt: utvikleren sitter i Oslo, Vercel kjører UTC.
 * Testene under bruker `_hjelpere/tid.ts` og kjører hver påstand i de fire
 * vinduene der Oslo og UTC faktisk spriker.
 *
 * Om representasjonen: modulen returnerer bevisst midnatt i SERVERENS lokale tid
 * på den NORSKE kalenderdagen (se toppkommentaren i uke-helpers.ts). Testene
 * sjekker derfor kalenderdagen som velges — ikke det absolutte tidspunktet.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  startOfWeek,
  endOfWeek,
  dagerIUken,
  ukenummer,
  startOfDay,
  sammeDag,
  startOfMonth,
} from "./uke-helpers";
import {
  iAlleTidsvinduer,
  iVinduerMedDatoAvvik,
  TIDSVINDUER,
  datoIsone,
} from "./__tests__/_hjelpere/tid";

test("tidsvindu-hjelperen dekker faktisk et dato-avvik", () => {
  // Selvtest: er dette tomt, tester resten av filen ingenting interessant.
  const med = TIDSVINDUER.filter((v) => v.ulikDato);
  assert.ok(
    med.length >= 1,
    `forventet minst ett vindu der Oslo og UTC har ulik dato, fikk ${med.length}`,
  );
});

test("startOfWeek gir alltid en mandag", () => {
  iAlleTidsvinduer((v) => {
    assert.equal(
      startOfWeek(v.na).getDay(),
      1,
      `${v.navn}: ukestart var ikke mandag (Oslo ${v.osloTekst}, UTC ${v.utcTekst})`,
    );
  });
});

test("startOfWeek regner mot NORSK kalenderdag, ikke UTC-dagen", () => {
  // Kjernen i gotcha-en: kl. 00:30 norsk tid er fortsatt «i går» i UTC.
  // Uka skal følge den norske datoen.
  iVinduerMedDatoAvvik((v) => {
    const norskDato = datoIsone(v.na, "Europe/Oslo");
    const uke = startOfWeek(v.na);
    const ukeSlutt = endOfWeek(v.na);

    // Den norske datoen skal ligge innenfor [ukestart, ukeslutt).
    const norskSomTall = Number(norskDato.replaceAll("-", ""));
    const startTall =
      uke.getFullYear() * 10000 + (uke.getMonth() + 1) * 100 + uke.getDate();
    const sluttTall =
      ukeSlutt.getFullYear() * 10000 +
      (ukeSlutt.getMonth() + 1) * 100 +
      ukeSlutt.getDate();

    assert.ok(
      norskSomTall >= startTall && norskSomTall < sluttTall,
      `${v.navn}: norsk dato ${norskDato} falt utenfor uka ${startTall}–${sluttTall}`,
    );
  });
});

test("dagerIUken gir syv sammenhengende dager fra mandag", () => {
  iAlleTidsvinduer((v) => {
    const dager = dagerIUken(startOfWeek(v.na));
    assert.equal(dager.length, 7, `${v.navn}: feil antall dager`);
    assert.equal(dager[0].getDay(), 1, `${v.navn}: første dag var ikke mandag`);
    assert.equal(dager[6].getDay(), 0, `${v.navn}: siste dag var ikke søndag`);

    // Sammenhengende: hver dag er nøyaktig én kalenderdag etter forrige.
    for (let i = 1; i < 7; i++) {
      const forrige = dager[i - 1];
      const denne = dager[i];
      const forventet = new Date(
        forrige.getFullYear(),
        forrige.getMonth(),
        forrige.getDate() + 1,
      );
      assert.equal(
        denne.getTime(),
        forventet.getTime(),
        `${v.navn}: hull mellom dag ${i - 1} og ${i}`,
      );
    }
  });
});

test("dagerIUken krysser DST-overgangen uten å hoppe over eller doble en dag", () => {
  // DST-uka er der lokal Date-aritmetikk historisk har glippet.
  const dstVar = TIDSVINDUER.find((v) => v.navn.startsWith("DST vår"));
  const dstHost = TIDSVINDUER.find((v) => v.navn.startsWith("DST høst"));
  assert.ok(dstVar && dstHost, "DST-vinduene mangler i hjelperen");

  for (const v of [dstVar, dstHost]) {
    const dager = dagerIUken(startOfWeek(v.na));
    const unikeDatoer = new Set(dager.map((d) => d.toDateString()));
    assert.equal(
      unikeDatoer.size,
      7,
      `${v.navn}: ${7 - unikeDatoer.size} dag(er) gjentok seg over DST-overgangen`,
    );
  }
});

test("ukenummer er stabilt innenfor samme uke", () => {
  iAlleTidsvinduer((v) => {
    const start = startOfWeek(v.na);
    const uke = ukenummer(start);
    assert.ok(
      Number.isInteger(uke) && uke >= 1 && uke <= 53,
      `${v.navn}: ugyldig ukenummer ${uke}`,
    );
    // Alle syv dagene skal gi samme ukenummer.
    for (const d of dagerIUken(start)) {
      assert.equal(
        ukenummer(d),
        uke,
        `${v.navn}: ukenummer spratt midt i uka (${d.toDateString()})`,
      );
    }
  });
});

test("startOfDay treffer den norske kalenderdagen", () => {
  iVinduerMedDatoAvvik((v) => {
    const d = startOfDay(v.na);
    const norsk = datoIsone(v.na, "Europe/Oslo");
    const fikk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    assert.equal(
      fikk,
      norsk,
      `${v.navn}: startOfDay ga ${fikk}, norsk dato er ${norsk} (UTC ${v.utcTekst})`,
    );
  });
});

test("startOfDay er idempotent", () => {
  iAlleTidsvinduer((v) => {
    const en = startOfDay(v.na);
    const to = startOfDay(en);
    assert.equal(to.getTime(), en.getTime(), `${v.navn}: ikke idempotent`);
  });
});

test("sammeDag er sann for to tidspunkt på samme norske dag", () => {
  iAlleTidsvinduer((v) => {
    const start = startOfDay(v.na);
    // Midt på dagen, trygt unna alle overganger.
    const senere = new Date(start.getTime() + 12 * 60 * 60 * 1000);
    assert.equal(
      sammeDag(start, senere),
      true,
      `${v.navn}: samme dag ble regnet som ulik`,
    );
  });
});

test("startOfMonth gir den 1. i måneden", () => {
  iAlleTidsvinduer((v) => {
    assert.equal(
      startOfMonth(v.na).getDate(),
      1,
      `${v.navn}: månedsstart var ikke den 1.`,
    );
  });
});

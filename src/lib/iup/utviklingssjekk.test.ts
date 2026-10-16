import assert from "node:assert/strict";
import { test } from "node:test";

import {
  hentIupKilde, hentUtviklingssporsmal, IUP_KATEGORIER, IUP_NIVAAER, IUP_VERSJONER,
  lesIupBesvarelse, sammenlignIupBesvarelser,
  type IupBesvarelse, type IupNivaa, type IupVersjon,
} from "./utviklingssjekk";

function full(versjon: IupVersjon = "iup-2027", niva: IupNivaa = "JUNIOR"): IupBesvarelse {
  return { versjon, niva, status: "LEVERT", svar: Object.fromEntries(hentUtviklingssporsmal(versjon, niva).map((s) => [s.id, 3])) };
}

test("begge originalversjoner bevarer alle fire nivåer og sju kategorier", () => {
  const forventet = { "iup-2025": [34, 41, 41, 38], "iup-2027": [34, 43, 47, 38] };
  const alle = new Set<string>();
  for (const v of IUP_VERSJONER) {
    assert.match(hentIupKilde(v).sha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(hentIupKilde(v).skala, { min: 1, maks: 5 });
    for (const [i, n] of IUP_NIVAAER.entries()) {
      const sporsmal = hentUtviklingssporsmal(v, n);
      assert.equal(sporsmal.length, forventet[v][i]);
      assert.deepEqual([...new Set(sporsmal.map((s) => s.kategori))], [...IUP_KATEGORIER]);
      for (const s of sporsmal) {
        assert.ok(!alle.has(s.id)); alle.add(s.id);
        assert.match(s.celle, /^[A-Z]+\d+$/);
        assert.ok(s.tekst.trim());
        assert.doesNotMatch(s.tekst, /@/);
      }
      assert.equal(lesIupBesvarelse(full(v, n)).ok, true);
    }
  }
  assert.equal(alle.size, 316);
});

test("kjent originalordlyd og faktisk celle beholdes selv om teknikkdelen er omformulert", () => {
  const a = hentUtviklingssporsmal("iup-2025", "UNG");
  const b = hentUtviklingssporsmal("iup-2027", "UNG");
  assert.equal(a[0].tekst, "Jeg er fornøyd med hvordan det fungerer med vennene mine");
  assert.equal(a[0].celle, "C5");
  assert.equal(b[0].tekst, a[0].tekst);
  assert.notEqual(a[0].id, b[0].id);
  assert.notDeepEqual(a.filter((s) => s.kategori === "Teknisk").map((s) => s.tekst), b.filter((s) => s.kategori === "Teknisk").map((s) => s.tekst));
});

test("ufullstendig sjekk kan lagres som utkast, men manglende svar blir aldri nullscore", () => {
  const data = full();
  const first = Object.keys(data.svar)[0];
  const lest = lesIupBesvarelse({ ...data, status: "UTKAST", svar: { [first]: 5 } });
  assert.ok(lest.ok);
  assert.equal(lest.besvart, 1);
  assert.equal(lest.totalt, 43);
  assert.equal(lest.mangler.length, 42);
  assert.deepEqual(lest.data.svar, { [first]: 5 });
  assert.deepEqual(lesIupBesvarelse({ ...data, svar: { [first]: 5 } }), {
    ok: false, kode: "UFULLSTENDIG", melding: "Besvar alle 43 spørsmål før du leverer.",
  });
});

test("samme antall svar fra feil nivå eller år godtas ikke", () => {
  const data = full("iup-2025", "UNG");
  assert.equal(lesIupBesvarelse({ ...data, versjon: "iup-2027" }).ok, false);
  assert.equal(lesIupBesvarelse({ ...full("iup-2025", "JUNIOR"), niva: "AMATOR" }).ok, false);
  const r = lesIupBesvarelse({ ...data, svar: { ...data.svar, ukjent: 3 } });
  assert.ok(!r.ok); assert.equal(r.kode, "UKJENT_SPORSMAL");
});

test("legacy åttespørsmålssvar og ukjent versjon oppgraderes ikke stilltiende", () => {
  assert.equal(lesIupBesvarelse({ niva: "JUNIOR", svar: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [String(i + 1), 4])) }).ok, false);
  assert.equal(lesIupBesvarelse({ ...full(), versjon: "iup-2028" }).ok, false);
  assert.equal(lesIupBesvarelse({ ...full(), skala: 8 }).ok, false);
});

test("bare hele tall på originalskalaen 1–5 tillates", () => {
  const data = full(); const id = Object.keys(data.svar)[0];
  for (const value of [0, 6, 8, 1.5, null, "3", NaN, Infinity]) {
    assert.equal(lesIupBesvarelse({ ...data, svar: { ...data.svar, [id]: value } }).ok, false);
  }
  for (const value of [1, 5]) assert.equal(lesIupBesvarelse({ ...data, svar: { ...data.svar, [id]: value } }).ok, true);
});

test("utkast, nytt nivå og nytt kildeår blir ikke misvisende utviklingskurver", () => {
  assert.deepEqual(sammenlignIupBesvarelser(full("iup-2025"), full()), { sammenlignbar: false, grunn: "ULIK_VERSJON_ELLER_NIVAA" });
  assert.deepEqual(sammenlignIupBesvarelser(full(), full("iup-2027", "AMATOR")), { sammenlignbar: false, grunn: "ULIK_VERSJON_ELLER_NIVAA" });
  assert.deepEqual(sammenlignIupBesvarelser({ ...full(), status: "UTKAST" }, full()), { sammenlignbar: false, grunn: "UTKAST" });
  assert.deepEqual(sammenlignIupBesvarelser(null, full()), { sammenlignbar: false, grunn: "UGYLDIG" });
});

test("en faktisk endring på samme spørsmål kan følges uten å endre originalen", () => {
  const forrige = full(); const id = Object.keys(forrige.svar)[0];
  const neste = { ...forrige, svar: { ...forrige.svar, [id]: 5 } };
  assert.deepEqual(sammenlignIupBesvarelser(forrige, neste), { sammenlignbar: true, endringer: [{ sporsmalId: id, fra: 3, til: 5 }] });
  assert.equal(forrige.svar[id], 3);
});

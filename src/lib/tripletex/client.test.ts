/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/tripletex/client.test.ts
 *
 * Tester zod-parsingen av Tripletex-svarene direkte (gyldig/ugyldig). De
 * faktiske hentResultatrapport()/hentAnsatte()-funksjonene krever et
 * konfigurert miljø + nettverk og testes derfor ikke her — se
 * .claude/rules/admin-tripletex.md: ugyldig svar skal ALDRI kaste eller gi et
 * gjettet tall, kun null + warn-logg, noe disse testene beviser holder på
 * schema-nivå.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { _test } from "./client";

const { sessionTokenResponseSchema, ansatteResponseSchema, resultatrapportResponseSchema } = _test;

test("sessionTokenResponseSchema godtar gyldig svar", () => {
  const res = sessionTokenResponseSchema.safeParse({ value: { token: "abc123" } });
  assert.equal(res.success, true);
});

test("sessionTokenResponseSchema avviser svar uten token", () => {
  const res = sessionTokenResponseSchema.safeParse({ value: {} });
  assert.equal(res.success, false);
});

test("sessionTokenResponseSchema avviser tomt objekt", () => {
  const res = sessionTokenResponseSchema.safeParse({});
  assert.equal(res.success, false);
});

test("ansatteResponseSchema godtar gyldig liste", () => {
  const res = ansatteResponseSchema.safeParse({
    values: [{ id: 1, firstName: "Anders", lastName: "Kristiansen", email: "anders@akgolf.no" }],
  });
  assert.equal(res.success, true);
});

test("ansatteResponseSchema godtar tom liste", () => {
  const res = ansatteResponseSchema.safeParse({ values: [] });
  assert.equal(res.success, true);
});

test("ansatteResponseSchema avviser rad uten numerisk id", () => {
  const res = ansatteResponseSchema.safeParse({
    values: [{ id: "ikke-et-tall", firstName: "Anders" }],
  });
  assert.equal(res.success, false);
});

test("ansatteResponseSchema avviser feil toppnivå-form", () => {
  const res = ansatteResponseSchema.safeParse({ employees: [] });
  assert.equal(res.success, false);
});

test("resultatrapportResponseSchema godtar gyldig svar med linjer", () => {
  const res = resultatrapportResponseSchema.safeParse({
    value: {
      linjer: [
        { navn: "Mulligan Indoor", belop: 125000 },
        { navn: "Academy", belop: 84000 },
      ],
      sumInntekt: 300000,
      sumKostnad: 250000,
      resultat: 50000,
    },
  });
  assert.equal(res.success, true);
});

test("resultatrapportResponseSchema godtar svar uten linjer (default tom liste)", () => {
  const res = resultatrapportResponseSchema.safeParse({ value: {} });
  assert.equal(res.success, true);
  if (res.success) {
    assert.deepEqual(res.data.value.linjer, []);
  }
});

test("resultatrapportResponseSchema avviser linje med streng som belop", () => {
  const res = resultatrapportResponseSchema.safeParse({
    value: { linjer: [{ navn: "Academy", belop: "84000 kr" }] },
  });
  assert.equal(res.success, false);
});

test("resultatrapportResponseSchema avviser helt uventet svar (f.eks. HTML-feilside)", () => {
  const res = resultatrapportResponseSchema.safeParse("<html>Feil</html>");
  assert.equal(res.success, false);
});

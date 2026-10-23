import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { syntetiskKontoAvtale as pakke, syntetiskKontoSvar as svar } from "../../../../tests/fixtures/kontoavtale";
import { frysKontoAvtale } from "./dokumenter";

let aktiv = true;
let kunde: { dateOfBirth: Date | null; requiresGuardianConsent: boolean } | null;
let rader: Array<Record<string, unknown>>;
let feil = false;
let kall: Array<{ metode: string; arg: unknown }>;
const dbTid = new Date("2026-10-23T08:00:00Z");
mock.module("./dokumenter", { namedExports: {
  frysKontoAvtale,
  hentGjeldendeKontoAvtale: () => aktiv ? pakke : null,
} });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
    kall.push({ metode: "transaction", arg: null });
    if (feil) throw Error("syntetisk hemmelig databasefeil");
    return fn({
      $queryRaw: async (sql: TemplateStringsArray, ...param: unknown[]) => {
        kall.push({ metode: sql.join("").includes("FOR SHARE") ? "lås" : "klokke", arg: param });
        return [{ naa: dbTid }];
      },
      user: { findFirst: async (arg: unknown) => { kall.push({ metode: "bruker", arg }); return kunde; } },
      kontoAvtaleAksept: {
        createMany: async (arg: { data: Array<Record<string, unknown>>; skipDuplicates: boolean }) => {
          assert.equal(arg.skipDuplicates, true);
          if (rader.length === 0) rader.push(...arg.data);
        },
        findUnique: async (arg: unknown) => { kall.push({ metode: "kvittering", arg }); return rader[0]; },
      },
    });
  },
} } });
const hent = () => import("./register");
beforeEach(() => {
  aktiv = true; feil = false; rader = []; kall = [];
  kunde = { dateOfBirth: new Date("1984-01-01"), requiresGuardianConsent: false };
});

test("lagrer bare serverens pakke og innlogget aktør, ikke klientens innhold", async () => {
  const { registrerEgenKontoAvtale } = await hent();
  assert.deepEqual(await registrerEgenKontoAvtale("spiller-test", svar), { ok: true });
  assert.deepEqual(rader, [{ userId: "spiller-test", pakkeVersjon: pakke.versjon, ...frysKontoAvtale(pakke) }]);
  assert.deepEqual(kall.map(k => k.metode), ["transaction", "lås", "bruker", "klokke", "kvittering"]);
  assert.deepEqual(kall.find(k => k.metode === "bruker")?.arg, {
    where: { id: "spiller-test", deletedAt: null, role: "PLAYER" },
    select: { dateOfBirth: true, requiresGuardianConsent: true },
  });
});

for (const [navn, input] of Object.entries({
  "manglende bekreftelse": {},
  "gammelt ja": { acceptedTerms: true, acceptedPrivacy: true },
  "avslag": { ...svar, vilkarGodtatt: false },
  "personvern ikke lest": { ...svar, personvernLest: false },
  "streng i stedet for ja": { ...svar, vilkarGodtatt: "true" },
  "annen konto": { ...svar, userId: "annen" },
  "læring": { ...svar, laering: true },
  "klientens tekst": { ...svar, dokumenter: pakke },
  "gammel versjon": { ...svar, pakkeVersjon: "gammel" },
})) test(`${navn} avvises før databasetilgang`, async () => {
  assert.equal((await (await hent()).registrerEgenKontoAvtale("spiller-test", input)).ok, false);
  assert.equal(kall.length, 0);
});

test("ingen godkjent pakke gir ingen databasekall", async () => {
  aktiv = false;
  assert.equal((await (await hent()).registrerEgenKontoAvtale("spiller-test", svar)).ok, false);
  assert.equal(kall.length, 0);
});

for (const [navn, profil] of Object.entries({
  "manglende/slettet konto eller feil rolle": null,
  "ukjent alder": { dateOfBirth: null, requiresGuardianConsent: false },
  "barn": { dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: false },
  "foresattkrav": { dateOfBirth: new Date("1984-01-01"), requiresGuardianConsent: true },
})) test(`${navn} kan ikke bruke egen aksept`, async () => {
  kunde = profil;
  assert.equal((await (await hent()).registrerEgenKontoAvtale("spiller-test", svar)).ok, false);
  assert.equal(rader.length, 0);
});

test("nytt forsøk bevarer den første kvitteringen", async () => {
  const { registrerEgenKontoAvtale } = await hent();
  await registrerEgenKontoAvtale("spiller-test", svar);
  const original = rader[0];
  assert.deepEqual(await registrerEgenKontoAvtale("spiller-test", svar), { ok: true });
  assert.equal(rader.length, 1);
  assert.equal(rader[0], original);
});

test("endret innhold med gjenbrukt versjon gir ikke bekreftet ny aksept", async () => {
  rader = [{ dokumentHash: "a".repeat(64) }];
  assert.equal((await (await hent()).registrerEgenKontoAvtale("spiller-test", svar)).ok, false);
  assert.equal(rader[0].dokumentHash, "a".repeat(64));
});

test("databasefeil avvises uten intern feiltekst", async () => {
  feil = true;
  const resultat = await (await hent()).registrerEgenKontoAvtale("spiller-test", svar);
  assert.deepEqual(resultat, { ok: false, feil: "Bekreftelsen kunne ikke lagres. Prøv igjen." });
  assert.equal(rader.length, 0);
});

/**
 * Kontrakt-test for GDPR-anonymisering (steg 7 i `docs/plan-testdekning.md`).
 *
 * `anonymiserBruker` er tungt Prisma-koblet, og planen er tydelig på at
 * GDPR-tester aldri skal røre en ekte DB. Å mocke hele Prisma-kjeden ville
 * bevist at funksjonen kaller `update` — men det er ikke det som brekker.
 *
 * Det som brekker er DRIFT: noen legger et nytt PII-felt på `User` og glemmer
 * å legge det i `ANONYMISERTE_BRUKERFELTER`. Da fortsetter sletting å
 * rapportere suksess mens feltet blir liggende igjen. Ingenting fanger det —
 * `tsc` ser bare en liste med strenger, og listene brukes også som audit-logg
 * (`anonymiserteFelter` i moderering/actions.ts), så loggen ville lyve i tillegg.
 *
 * Denne testen leser `schema.prisma` som tekst og holder listene opp mot den.
 * Sletting kan ikke kjøres om igjen, så en test som fanger drift FØR den treffer
 * en ekte konto er verdt mer enn en som verifiserer mekanikken etterpå.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ANONYMISERTE_BRUKERFELTER,
  ANONYMISERTE_PUBLICPLAYER_FELTER,
} from "./anonymiser-bruker";

const schema = readFileSync(
  join(process.cwd(), "prisma", "schema.prisma"),
  "utf8",
);

/** Feltnavnene (skalarer og relasjoner) på en Prisma-modell. */
function felterPaModell(modell: string): string[] {
  const m = schema.match(
    new RegExp(`^model ${modell} \\{([\\s\\S]*?)^\\}`, "m"),
  );
  assert.ok(m, `fant ikke model ${modell} i schema.prisma`);
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"))
    .map((l) => l.split(/\s+/)[0])
    .filter(Boolean);
}

test("alle felter i ANONYMISERTE_BRUKERFELTER finnes faktisk på User", () => {
  // Fanger omdøping: blir `phone` til `phoneNumber` uten at lista følger med,
  // skriver anonymiseringen til et felt som ikke finnes.
  const felter = felterPaModell("User");
  for (const f of ANONYMISERTE_BRUKERFELTER) {
    assert.ok(
      felter.includes(f),
      `ANONYMISERTE_BRUKERFELTER inneholder «${f}», som ikke finnes på User`,
    );
  }
});

test("alle felter i ANONYMISERTE_PUBLICPLAYER_FELTER finnes på PublicPlayer", () => {
  const felter = felterPaModell("PublicPlayer");
  for (const f of ANONYMISERTE_PUBLICPLAYER_FELTER) {
    assert.ok(
      felter.includes(f),
      `ANONYMISERTE_PUBLICPLAYER_FELTER inneholder «${f}», som ikke finnes på PublicPlayer`,
    );
  }
});

test("kjente PII-felter på User er dekket av anonymiseringen", () => {
  // Eksplisitt liste framfor mønstergjetting: en ny kolonne skal tvinge fram en
  // bevisst vurdering her, ikke gli gjennom fordi navnet ikke lignet på PII.
  const maVaereDekket = [
    "email",
    "name",
    "phone",
    "avatarUrl",
    "dateOfBirth",
  ];
  for (const f of maVaereDekket) {
    assert.ok(
      (ANONYMISERTE_BRUKERFELTER as readonly string[]).includes(f),
      `PII-feltet «${f}» anonymiseres ikke — GDPR-sletting ville latt det ligge igjen`,
    );
  }
});

test("VAKT: nye direkte-identifiserende felter på User må vurderes eksplisitt", () => {
  // Denne feiler med vilje når noen legger til et felt som LIGNER på PII.
  // Er det ikke PII, legg navnet i `vurdertIkkePii` med en begrunnelse.
  // Er det PII, legg det i ANONYMISERTE_BRUKERFELTER.
  const mistenkeligeMonstre =
    /^(name|email|phone|address|adresse|avatar|photo|bilde|birth|fodsel|personnr|ssn|passport|iban|kontonr)/i;

  const vurdertIkkePii = new Set([
    // Bekreftet ikke direkte-identifiserende, eller dekket et annet sted:
    "emailVerified", // boolsk flagg, ingen identitet
    "nameConfirmed", // boolsk flagg
    "avatarUpdatedAt", // tidsstempel; selve avatarUrl anonymiseres
    "phoneVerified", // boolsk flagg
    "birthYearOnly", // grovkornet, brukes til aldersgruppering
  ]);

  const felter = felterPaModell("User");
  const udekket = felter.filter(
    (f) =>
      mistenkeligeMonstre.test(f) &&
      !(ANONYMISERTE_BRUKERFELTER as readonly string[]).includes(f) &&
      !vurdertIkkePii.has(f),
  );

  assert.deepEqual(
    udekket,
    [],
    `Nye felter på User som ligner PII og ikke er vurdert: ${udekket.join(", ")}. ` +
      "Legg dem i ANONYMISERTE_BRUKERFELTER, eller i `vurdertIkkePii` med begrunnelse.",
  );
});

test("listene er ikke tomme (fanger en utilsiktet tømming)", () => {
  assert.ok(ANONYMISERTE_BRUKERFELTER.length >= 5);
  assert.ok(ANONYMISERTE_PUBLICPLAYER_FELTER.length >= 6);
});

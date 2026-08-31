import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  KOMMUNIKASJON_FANER,
  KOMMUNIKASJON_STANDARDFANE,
  erKommunikasjonFaneId,
  kommunikasjonHref,
  velgKommunikasjonFane,
} from "./faner";

/**
 * MASTERPLAN 15.7: tre adresser ble til én. Disse testene låser at
 * fanelogikken aldri utvider tilgangen kildesidene hadde, og at hver fane
 * peker på adressen den erstattet (eller null når den er et statusfilter,
 * ikke en tidligere egen adresse).
 */

test("fire faner, i canvas-rekkefølgen", () => {
  assert.deepEqual(
    KOMMUNIKASJON_FANER.map((f) => f.id),
    ["innboks", "utkast", "sendt", "maler"],
  );
});

test("hver fane med en gammel adresse peker på den den erstattet", () => {
  const gamle = KOMMUNIKASJON_FANER.map((f) => f.gammelHref);
  assert.deepEqual(gamle, ["/admin/innboks", "/admin/innboks-epost", null, "/admin/email-templates"]);
  const ikkeNull = gamle.filter((g): g is string => g !== null);
  assert.equal(new Set(ikkeNull).size, ikkeNull.length, "ingen adresse to ganger");
});

test("`/meg` er IKKE en fane — MASTERPLAN-radens ordlyd er bevisst avveket, se faner.ts", () => {
  assert.equal(
    KOMMUNIKASJON_FANER.some((f) => f.gammelHref === "/meg" || f.id === ("meg" as string)),
    false,
  );
});

test("erKommunikasjonFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erKommunikasjonFaneId("innboks"), true);
  assert.equal(erKommunikasjonFaneId("utkast"), true);
  for (const s of [undefined, "", "meg", "Innboks", "tull"]) {
    assert.equal(erKommunikasjonFaneId(s), false, String(s));
  }
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const forsok of [undefined, "", "tull", "meg", "../admin"]) {
    assert.equal(velgKommunikasjonFane(forsok), KOMMUNIKASJON_STANDARDFANE, String(forsok));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgKommunikasjonFane("utkast"), "utkast");
  assert.equal(velgKommunikasjonFane("sendt"), "sendt");
  assert.equal(velgKommunikasjonFane("maler"), "maler");
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(kommunikasjonHref("innboks"), "/admin/kommunikasjon");
  assert.equal(kommunikasjonHref("utkast"), "/admin/kommunikasjon?fane=utkast");
  assert.equal(kommunikasjonHref("sendt"), "/admin/kommunikasjon?fane=sendt");
  assert.equal(kommunikasjonHref("maler"), "/admin/kommunikasjon?fane=maler");
});

/**
 * Kildeskann: låser at SIDEN faktisk bruker ADMIN/COACH som basisgate og
 * fanelogikken over, OG at "utkast"/"sendt" (arvet fra ADMIN-alene
 * /admin/innboks-epost) har en ekstra ADMIN-sjekk som IKKE utvider tilgang.
 */
test("/admin/kommunikasjon gater på ADMIN/COACH, bruker fanelogikken, og låser utkast/sendt til ADMIN", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/kommunikasjon/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  assert.match(
    uten,
    /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
    "siden må ha ADMIN/COACH som basisgate",
  );
  assert.match(uten, /velgKommunikasjonFane\(/, "siden må velge fane via fanelogikken");
  assert.match(
    uten,
    /\(aktiv === "utkast" \|\| aktiv === "sendt"\) && user\.role !== "ADMIN"/,
    "utkast/sendt må sjekke ADMIN eksplisitt — de var ADMIN-alene på /admin/innboks-epost",
  );
});

/** De to kilde-loaderne for utkast/sendt skal filtrere status i databasen, ikke i klient. */
test("lastKommunikasjonUtkast/-Sendt filtrerer på gyldige, ikke-overlappende statuser", () => {
  const src = readFileSync(join(process.cwd(), "src/lib/admin/kommunikasjon/lastere.ts"), "utf8");
  assert.match(src, /UTKAST_STATUSER = \["NY", "UTKAST_KLART"\]/);
  assert.match(src, /SENDT_STATUSER = \["SENDT", "ARKIVERT"\]/);
});

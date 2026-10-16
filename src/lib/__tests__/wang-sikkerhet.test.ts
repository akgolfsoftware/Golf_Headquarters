/**
 * Vakter for WANG-flaten (/team-wang), 05.10.2026:
 *  - fellessiden er åpen, trener- og skjermflatene er sperret
 *  - rollen avgjøres på serveren, aldri av nettleseren
 *  - ingen falske kvitteringer eller oppdiktede tall i Wang*-modulene
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { erSperretTeamWangSti } from "@/lib/auth/team-wang-sperre";
import { kanSeWangAdministrasjon, wangRolleFor } from "@/app/team-wang/_data/wang-rolle";

const ROT = process.cwd();
const WANG_KOMPONENTER = path.join(ROT, "src/components/wang");

function lesKilde(rel: string): string {
  return readFileSync(path.join(ROT, rel), "utf8");
}

/** Ren kode uten linje- og blokkommentarer. */
function utenKommentarer(kilde: string): string {
  return kilde.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function* tsxFiler(dir: string): Generator<string> {
  for (const navn of readdirSync(dir)) {
    const p = path.join(dir, navn);
    if (statSync(p).isDirectory()) yield* tsxFiler(p);
    else if (/\.tsx$/.test(navn)) yield p;
  }
}

// Gammel, urørt rekrutteringsvisning som ikke er med i prod-veien.
const UNNTATT = new Set(["WangRekrutteringView.tsx"]);

function wangProdFiler(): string[] {
  return [...tsxFiler(WANG_KOMPONENTER)].filter((f) => !UNNTATT.has(path.basename(f)));
}

test("proxy: uinnlogget får ikke /team-wang/skjermer eller /team-wang/coach", () => {
  assert.equal(erSperretTeamWangSti("/team-wang/skjermer"), true);
  assert.equal(erSperretTeamWangSti("/team-wang/skjermer/x"), true);
  assert.equal(erSperretTeamWangSti("/team-wang/coach"), true);
  assert.equal(erSperretTeamWangSti("/team-wang/coach/iup/abc"), true);
});

test("proxy: fellessiden og innloggingen er åpne", () => {
  assert.equal(erSperretTeamWangSti("/team-wang"), false);
  assert.equal(erSperretTeamWangSti("/team-wang/logg-inn"), false);
  assert.equal(erSperretTeamWangSti("/team-wang/skjermerlig"), false);
});

test("fellessiden /team-wang er åpen: ingen innloggingskrav i selve siden", () => {
  const side = utenKommentarer(lesKilde("src/app/team-wang/page.tsx"));
  assert.doesNotMatch(side, /requirePortalUser/);
  assert.doesNotMatch(side, /medElevnavn:\s*true/);
});

test("skjermoversikten har eget innloggingskrav for ADMIN/COACH", () => {
  const side = lesKilde("src/app/team-wang/skjermer/page.tsx");
  assert.match(side, /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]/);
  assert.match(side, /hentWangCoachGruppeId/);
});

test("rolle: bare ADMIN er sportssjef, og bare sportssjef ser Administrasjon", () => {
  assert.equal(wangRolleFor({ role: "ADMIN" }), "Sportssjef");
  assert.equal(wangRolleFor({ role: "COACH" }), "Trener");
  assert.equal(kanSeWangAdministrasjon("Trener"), false);
  assert.equal(kanSeWangAdministrasjon("Sportssjef"), true);
});

test("skallet har ingen rollevelger i nettleseren", () => {
  const skall = utenKommentarer(lesKilde("src/components/wang/WangAppSkall.tsx"));
  assert.doesNotMatch(skall, /setRolle/);
  assert.doesNotMatch(skall, /useState<WangRolle>/);
  assert.doesNotMatch(skall, /Anders Kristiansen/);
});

test("klienten leser ikke område eller rolle fra nettleserens adresse", () => {
  const klient = utenKommentarer(lesKilde("src/app/team-wang/coach/WangCoachKlient.tsx"));
  assert.doesNotMatch(klient, /useSearchParams/);
});

test("Wang*-modulene bruker aldri alert() eller lokale bekreftelser på ikke-koblede handlinger", () => {
  const treff: string[] = [];
  for (const fil of wangProdFiler()) {
    const kilde = utenKommentarer(readFileSync(fil, "utf8"));
    if (/\balert\(/.test(kilde)) treff.push(`${path.basename(fil)}: alert()`);
    if (/set\w*(Kvittering|Melding)\(`/.test(kilde)) treff.push(`${path.basename(fil)}: kvittering`);
    if (/setTimeout\(\(\) => set\w*\(null\)/.test(kilde)) treff.push(`${path.basename(fil)}: kvitteringstimer`);
  }
  assert.deepEqual(treff, [], "Ikke-koblede handlinger skal være deaktivert, ikke gi bekreftelse");
});

test("Wang*-modulene har ingen formelgenererte tall og ingen fast fravær", () => {
  const treff: string[] = [];
  for (const fil of wangProdFiler()) {
    const kilde = utenKommentarer(readFileSync(fil, "utf8"));
    if (/71\.5 \+ i/.test(kilde) || /68 - i \*/.test(kilde)) treff.push(`${path.basename(fil)}: formeltall`);
    if (/2\.4%/.test(kilde) || /14 dager \(Turnering\)/.test(kilde)) treff.push(`${path.basename(fil)}: fast fravær`);
    if (/Signert digitalt/.test(kilde)) treff.push(`${path.basename(fil)}: oppdiktet samtykke`);
  }
  assert.deepEqual(treff, []);
});

test("deaktiverte handlinger bærer teksten «Ikke koblet ennå»", () => {
  const merke = lesKilde("src/components/wang/WangIkkeKoblet.tsx");
  assert.match(merke, /Ikke koblet ennå/);
});

test("de tre ekte datakoblede rutene nås fra skallet (IUP, testresultater, turneringer)", () => {
  const lenker = lesKilde("src/components/wang/WangKobledeVisninger.tsx");
  assert.match(lenker, /\/team-wang\/coach\/iup\//);
  assert.match(lenker, /\/team-wang\/coach\/tester/);
  assert.match(lenker, /\/team-wang\/coach\/turneringer\//);
  const klient = lesKilde("src/app/team-wang/coach/WangCoachKlient.tsx");
  assert.match(klient, /WangKobledeVisninger/);
});

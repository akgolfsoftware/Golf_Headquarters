/**
 * Demovisninger med faste navn og tall skal bare kunne nås fra skjermkatalogen
 * (/skjermer, bak innlogging). 26.–27.09.2026 var flere ekte ruter koblet til
 * slike visninger — blant annet stall-lista, som viste oppdiktede spillere.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const APP_ROOT = path.join(process.cwd(), "src/app");
const KATALOG = path.join(APP_ROOT, "skjermer");

/** Moduler som rendrer faste demodata når de brukes uten ekte laster. */
const DEMOVISNINGER: string[] = [
  "@/components/admin/stall/StallPrecisionView",
  "@/components/auth/LoginPrecisionView",
  "@/components/forelder/ForelderPrecisionView",
  "@/components/marketing/booking/BookingKvitteringPrecision",
  "@/components/marketing/booking/BookingPrecisionFlow",
  "@/components/portal/live/LivePrecisionView",
  "@/components/portal/profil/PersonvernPrecisionView",
  "@/components/portal/profil/SpillerProfilPrecisionView",
  "@/components/portal/teknisk/TekniskPlanPrecisionView",
  "@/components/portal/toppidrett",
  "@/components/wang/WangRekrutteringView",
  "WangToppidrettPrecisionView",
  // Wang*-områdene tegner faste demodata (src/components/wang/wang-data.ts).
  // Bare skjermklienten under coach/ (bak innlogging) får importere dem.
  "@/components/wang/WangIdag",
  "@/components/wang/WangTrening",
  "@/components/wang/WangTester",
  "@/components/wang/WangKonkurranse",
  "@/components/wang/WangMeldinger",
  "@/components/wang/WangElever",
  "@/components/wang/WangAdmin",
  "@/components/wang/WangSkjermoversikt",
  "@/components/wang/wang-data",
];

/** Filer som bevisst får importere demovisninger (bak requirePortalUser). */
const TILLATT_I: string[] = ["src/app/team-wang/coach/WangCoachKlient.tsx"];

function* walkKilder(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (p === KATALOG) continue;
    if (statSync(p).isDirectory()) yield* walkKilder(p);
    else if (/\.tsx?$/.test(name)) yield p;
  }
}

test("ingen rute utenfor skjermkatalogen importerer en demovisning", () => {
  const treff: string[] = [];
  for (const fil of walkKilder(APP_ROOT)) {
    if (TILLATT_I.includes(path.relative(process.cwd(), fil))) continue;
    const importer = readFileSync(fil, "utf8")
      .split("\n")
      .filter((linje) => /^\s*(import|export)\b.*\bfrom\b/.test(linje));
    for (const linje of importer) {
      const modul = DEMOVISNINGER.find((m) => linje.includes(m));
      if (modul) treff.push(`${path.relative(process.cwd(), fil)} → ${modul}`);
    }
  }
  assert.deepEqual(treff, [], "Koble ruten til ekte data, ikke til en demovisning");
});

test("skjermkatalogen krever innlogging som coach eller admin", () => {
  const side = readFileSync(path.join(KATALOG, "page.tsx"), "utf8");
  assert.match(side, /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/);
});

test("sider som rendrer WangCoachKlient krever innlogging som coach eller admin", () => {
  const treff: string[] = [];
  const sider = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = path.join(dir, n);
      if (statSync(p).isDirectory()) return sider(p);
      return n === "page.tsx" ? [p] : [];
    });
  for (const fil of sider(path.join(APP_ROOT, "team-wang"))) {
    const kilde = readFileSync(fil, "utf8");
    if (!kilde.includes("WangCoachKlient")) continue;
    if (!/requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]/.test(kilde)) {
      treff.push(path.relative(process.cwd(), fil));
    }
  }
  assert.deepEqual(treff, []);
});

// ---------------------------------------------------------------------------
// AgencyOS AG-17 til AG-24 og TrackMan (AG-18): ingen demodata i produksjonsveien.
// Egen blokk: et annet arbeidsløp utvider testen for WANG.
// ---------------------------------------------------------------------------

const AGENCYOS_SANNHET_KOMPONENTER = [
  "AG17Turneringer",
  "AG18TrackManVideo",
  "AG19CaddieHub",
  "AG21Oppgaver",
  "AG22InnsiktTalent",
  "AG23Oppsett",
  "AG24Drift",
].map((n) => path.join(process.cwd(), "src/components/admin/precision", `${n}.tsx`));

const AGENCYOS_SANNHET_SIDER = [
  "src/app/admin/trackman/page.tsx",
  "src/app/admin/turnering/page.tsx",
  "src/app/admin/jarvis/page.tsx",
  "src/app/admin/oppgaver/page.tsx",
  "src/app/admin/innsikt/page.tsx",
  "src/app/admin/oppsett/page.tsx",
  "src/app/admin/drift/page.tsx",
].map((f) => path.join(process.cwd(), f));

const DEMOLITERALER: RegExp[] = [
  /STANDARD_DATA/,
  /Tobias Lindvik/,
  /Magnus Aasheim/,
  /Henrik Simonsen/,
  /Kasper Thorsen/,
  /Kari Demo/,
  /\bdemo\.no\b/,
  /000 000 000/,
  /Hanne Lindvik/,
];

test("AG17-AG24 og TrackMan har ingen STANDARD_DATA eller oppdiktede personer", () => {
  const treff: string[] = [];
  for (const fil of [...AGENCYOS_SANNHET_KOMPONENTER, ...AGENCYOS_SANNHET_SIDER]) {
    const kilde = readFileSync(fil, "utf8");
    for (const monster of DEMOLITERALER) {
      if (monster.test(kilde)) treff.push(`${path.relative(process.cwd(), fil)} -> ${monster}`);
    }
  }
  assert.deepEqual(treff, []);
});

test("TrackMan-siden hardkoder ingen måleverdier, og turnering ingen DataGolf-rader eller fiktive koordinater", () => {
  const trackman = readFileSync(path.join(process.cwd(), "src/app/admin/trackman/page.tsx"), "utf8");
  assert.doesNotMatch(trackman, /7-jern|91\.4|124\.6|158\.4|hoftevinkel/);
  const turnering = readFileSync(path.join(process.cwd(), "src/app/admin/turnering/page.tsx"), "utf8");
  assert.doesNotMatch(turnering, /Feltstyrke|Vinn-sannsynlighet|DATAGOLF_PREDICT|58\.5 \+|8\.5 \+/);
});

test("Påmeldt er aldri rust (signal) i AG-17", () => {
  const kilde = readFileSync(
    path.join(process.cwd(), "src/components/admin/precision/AG17Turneringer.tsx"),
    "utf8",
  );
  assert.doesNotMatch(kilde, /Påmeldt"\s*\?\s*"signal"/);
  assert.doesNotMatch(kilde, /tone="signal"/);
});

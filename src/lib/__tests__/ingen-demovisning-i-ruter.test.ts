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
  "@/components/team-norway/app/TeamNorwayAppView",
  "@/components/wang/WangRekrutteringView",
  "WangToppidrettPrecisionView",
];

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

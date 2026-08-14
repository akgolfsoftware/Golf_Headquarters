/**
 * Legacy AgencyOS-inventar — låser at kjente «døde» ruter fortsatt redirecter.
 * Pixel-for-pixel UI-audit er manuell; dette hindrer at redirects regresser.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const LEGACY_ROOT = path.join(process.cwd(), "src/app/admin/(legacy)");

function* walkPages(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walkPages(p);
    else if (name === "page.tsx") yield p;
  }
}

/** Må inneholde redirect( — rene videresendinger uten egen UI. */
const SKAL_REDIRECTE: string[] = [
  "stall/page.tsx",
  "analysere/page.tsx",
  "coach-workbench/page.tsx",
  "plans/new/page.tsx",
  "agenter/page.tsx",
  "okonomi/page.tsx",
  "kapasitet/page.tsx",
];

/**
 * Ruter som VAR redirect()-stubber i (legacy) og ble slettet 2026-08-14.
 * Videresendingen lever videre i next.config.ts — billigere enn en rute, og
 * gamle bokmerker virker fortsatt. Testen låser at de ikke forsvinner stille.
 */
const FLYTTET_TIL_NEXT_CONFIG: string[] = [
  "/admin/ai",
  "/admin/mer",
  "/admin/risiko",
  "/admin/board",
  "/admin/prosjekter",
  "/admin/tilstander",
  "/portal/reach",
  "/portal/mal/statistikk",
  "/portal/mal/milepaeler",
  "/portal/coach/plans/perioder",
  "/portal/tren/turneringer/ny",
  "/portal/mal/sg-hub/benchmark",
  "/portal/mal/sg-hub/best-vs-now",
  "/portal/mal/sg-hub/conditions",
  "/portal/mal/sg-hub/strategy",
  "/portal/mal/sg-hub/yardage",
];

test("legacy-inventar: kjente redirect-ruter redirecter fortsatt", () => {
  for (const rel of SKAL_REDIRECTE) {
    const full = path.join(LEGACY_ROOT, rel);
    const txt = readFileSync(full, "utf8");
    assert.match(
      txt,
      /redirect\s*\(/,
      `${rel} skal kalle redirect() — ellers er legacy-UI tilbake`,
    );
  }
});

test("legacy-inventar: slettede redirect-stubber lever videre i next.config.ts", () => {
  const cfg = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
  for (const kilde of FLYTTET_TIL_NEXT_CONFIG) {
    assert.ok(
      cfg.includes(`source: "${kilde}"`) || cfg.includes(`source: "${kilde}/:`),
      `${kilde} mangler i next.config.ts — gamle bokmerker vil gi 404`,
    );
  }
});

test("legacy-inventar: antall page.tsx er dokumentert (regresser ikke stille)", () => {
  const pages = [...walkPages(LEGACY_ROOT)];
  // 49 pr 2026-07-25, 32 etter legacy-oppryddingen 2026-08-14. Tallet skal
  // ned over tid, aldri opp — stiger det, er ny tech debt på vei inn.
  assert.ok(
    pages.length >= 20 && pages.length <= 40,
    `uventet antall legacy pages: ${pages.length}`,
  );
  const utenRedirect = pages.filter((p) => {
    const t = readFileSync(p, "utf8");
    return !/redirect\s*\(/.test(t);
  });
  // Levende legacy (availability, drills, live, …) — ikke null, men begrenset.
  assert.ok(
    utenRedirect.length <= 35,
    `for mange levende legacy-sider uten redirect: ${utenRedirect.length}`,
  );
});

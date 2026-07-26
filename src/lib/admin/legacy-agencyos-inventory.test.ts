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
  "mer/page.tsx",
  "ai/page.tsx",
  "risiko/page.tsx",
  "kapasitet/page.tsx",
  "tilstander/page.tsx",
  "prosjekter/page.tsx",
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

test("legacy-inventar: antall page.tsx er dokumentert (regresser ikke stille)", () => {
  const pages = [...walkPages(LEGACY_ROOT)];
  // 49 pr 2026-07-25. Hvis tallet stiger mye uten plan, er det tech debt.
  assert.ok(
    pages.length >= 40 && pages.length <= 80,
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

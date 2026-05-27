#!/usr/bin/env tsx
/**
 * Audit døde lenker i src/app/portal/ og src/components/portal/.
 * Sjekker om hver href="/portal/..." faktisk finnes som page.tsx.
 */

import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, "src", "app");

// Skanner src/app for å bygge en liste over alle eksisterende ruter
function listPages(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    try {
      const st = statSync(full);
      if (st.isDirectory()) out.push(...listPages(full));
      else if (name === "page.tsx") out.push(full);
    } catch {}
  }
  return out;
}

function pathToRoute(filePath: string): string {
  const rel = relative(APP_DIR, filePath).replace(/\/page\.tsx$/, "");
  // Strip route groups
  return (
    "/" +
    rel
      .split("/")
      .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
      .filter(Boolean)
      .join("/")
  );
}

const existingRoutes = new Set(
  listPages(APP_DIR).map(pathToRoute),
);

// Match dynamic routes via [param] pattern
function routeExists(href: string): boolean {
  // Strip query string + hash
  const cleanHref = href.split("?")[0].split("#")[0];
  if (existingRoutes.has(cleanHref)) return true;

  // Try to match against dynamic routes
  for (const route of existingRoutes) {
    if (!route.includes("[")) continue;
    const regex = new RegExp(
      "^" +
        route
          .replace(/\[([^\]]+)\]/g, "[^/]+")
          .replace(/\//g, "\\/") +
        "$",
    );
    if (regex.test(cleanHref)) return true;
  }
  return false;
}

// Bruk readFile + regex i Node — unngår shell-escape-helvete
import { readFileSync } from "node:fs";

function walkFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    try {
      const st = statSync(full);
      if (st.isDirectory()) out.push(...walkFiles(full, exts));
      else if (exts.some((e) => name.endsWith(e))) out.push(full);
    } catch {}
  }
  return out;
}

const allFiles = [
  ...walkFiles(join(ROOT, "src", "app", "portal"), [".tsx", ".ts"]),
  ...walkFiles(join(ROOT, "src", "components", "portal"), [".tsx", ".ts"]),
];

const hrefRegex = /href=["']((?:\/(?:portal|admin|auth|booking|forelder))[^"'#?]*)["']/g;
const hrefMap = new Map<string, Set<string>>();

for (const file of allFiles) {
  const content = readFileSync(file, "utf-8");
  for (const m of content.matchAll(hrefRegex)) {
    const href = m[1];
    if (!hrefMap.has(href)) hrefMap.set(href, new Set());
    hrefMap.get(href)!.add(file);
  }
}

const hrefs = [...hrefMap.keys()].sort();

type DeadLink = { href: string; sources: string[] };
const deadLinks: DeadLink[] = [];

for (const href of hrefs) {
  if (!routeExists(href)) {
    const sources = [...(hrefMap.get(href) ?? [])]
      .slice(0, 3)
      .map((p) => relative(ROOT, p));
    deadLinks.push({ href, sources });
  }
}

console.log(`\n=== AUDIT: PORTAL DØDE LENKER ===\n`);
console.log(`Totalt unike portal-href: ${hrefs.length}`);
console.log(`Døde lenker:               ${deadLinks.length}\n`);

if (deadLinks.length > 0) {
  console.log(`## Døde lenker (target finnes ikke)`);
  for (const d of deadLinks) {
    console.log(`\n- **${d.href}**`);
    for (const s of d.sources) {
      console.log(`  - ${s}`);
    }
  }
}

console.log(`\n=== Totalt eksisterende ruter (src/app): ${existingRoutes.size} ===\n`);

#!/usr/bin/env tsx
/**
 * Audit potensielle stub-sider i src/app/portal.
 * En side er stub hvis:
 *  - Den har <50 linjer JSX-content (eksklusivt imports) OG
 *  - Den ikke delegerer til en stor komponent (import xxxScreen / xxxClient / xxxView)
 *  - OG den inneholder en stub-markør (Kommer snart, TODO, placeholder)
 *
 * ELLER:
 *  - Den bare gjør en redirect (under 10 linjer, returnerer kun redirect())
 *
 * ELLER:
 *  - Den har mer enn 80 linjer som inneholder stub-markør i UI-tekst
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PORTAL = join(ROOT, "src", "app", "portal");

const STUB_PATTERNS =
  /(Kommer snart|Coming soon|TODO:?|placeholder|under utvikling|under construction|kommer i|denne siden er under)/i;

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

type Classified = {
  file: string;
  route: string;
  lines: number;
  category: "REDIRECT_STUB" | "DELEGATE" | "STUB_MARKER" | "EKTE" | "TOM";
  reason: string;
};

function pathToRoute(filePath: string): string {
  const rel = relative(join(ROOT, "src", "app"), filePath).replace(
    /\/page\.tsx$/,
    "",
  );
  return (
    "/" +
    rel
      .split("/")
      .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
      .filter(Boolean)
      .join("/")
  );
}

function classify(file: string): Classified {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n").length;
  const route = pathToRoute(file);

  // Pure redirect?
  if (
    lines < 15 &&
    /redirect\s*\(/.test(content) &&
    !/return\s+<[\s\S]*>/.test(content)
  ) {
    return {
      file,
      route,
      lines,
      category: "REDIRECT_STUB",
      reason: "Kun redirect, ingen UI",
    };
  }

  // Delegate-pattern (rendrer en stor komponent)
  const delegateMatch = content.match(
    /return\s+<(\w+(?:Screen|Client|View|Wizard|Hub|Page|Shell|Detail|Overview|Dashboard|List|Form))\b/,
  );
  if (delegateMatch && lines < 30) {
    return {
      file,
      route,
      lines,
      category: "DELEGATE",
      reason: `Delegerer til <${delegateMatch[1]}>`,
    };
  }

  // Tom side?
  if (lines < 20 && /return\s+null/.test(content)) {
    return {
      file,
      route,
      lines,
      category: "TOM",
      reason: "return null",
    };
  }

  // Stub-markør i innholdet?
  if (STUB_PATTERNS.test(content)) {
    const m = content.match(STUB_PATTERNS);
    return {
      file,
      route,
      lines,
      category: "STUB_MARKER",
      reason: `Inneholder "${m?.[0]}"`,
    };
  }

  return {
    file,
    route,
    lines,
    category: "EKTE",
    reason: "OK",
  };
}

const pages = listPages(PORTAL);
const classified = pages.map(classify);

const byCategory: Record<string, Classified[]> = {};
for (const c of classified) {
  (byCategory[c.category] ??= []).push(c);
}

console.log(`\n=== PORTAL STUB-AUDIT ===\n`);
console.log(`Total sider: ${pages.length}`);
for (const cat of ["REDIRECT_STUB", "STUB_MARKER", "TOM", "DELEGATE", "EKTE"]) {
  const list = byCategory[cat] ?? [];
  console.log(`  ${cat.padEnd(16)}  ${list.length}`);
}

const concerning = ["REDIRECT_STUB", "STUB_MARKER", "TOM"];
console.log(`\n=== Potensielle stubs ===`);
for (const cat of concerning) {
  const list = byCategory[cat] ?? [];
  if (list.length === 0) continue;
  console.log(`\n## ${cat} (${list.length})`);
  for (const c of list) {
    console.log(`- **${c.route}** — ${c.lines}L · ${c.reason}`);
    console.log(`  ${relative(ROOT, c.file)}`);
  }
}

// Skriv full rapport til markdown-fil
import { writeFileSync } from "node:fs";

const md: string[] = [];
md.push("# Portal stub-audit — generert " + new Date().toISOString().split("T")[0]);
md.push("");
md.push(`Total sider: **${pages.length}**`);
md.push("");
md.push("| Kategori | Antall |");
md.push("|---|---|");
for (const cat of ["REDIRECT_STUB", "STUB_MARKER", "TOM", "DELEGATE", "EKTE"]) {
  md.push(`| ${cat} | ${byCategory[cat]?.length ?? 0} |`);
}
md.push("");

for (const cat of concerning) {
  const list = byCategory[cat] ?? [];
  if (list.length === 0) continue;
  md.push(`## ${cat} (${list.length})`);
  md.push("");
  md.push("| Rute | Linjer | Grunn | Fil |");
  md.push("|---|---|---|---|");
  for (const c of list) {
    md.push(
      `| \`${c.route}\` | ${c.lines} | ${c.reason} | \`${relative(ROOT, c.file)}\` |`,
    );
  }
  md.push("");
}

const outPath = join(
  ROOT,
  "docs",
  "2026-05-27-portal-stubs-detaljert.md",
);
writeFileSync(outPath, md.join("\n"));
console.log(`\nSkrev ${outPath}`);

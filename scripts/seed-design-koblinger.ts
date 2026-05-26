#!/usr/bin/env tsx
/**
 * Seed DesignKobling-tabellen med inventar fra docs/design-koblinger/inventar.json
 * og auto-foreslå ruter via fuzzy-match mot src/lib/all-routes.ts og portal-routes.ts.
 *
 * Kjør: npx tsx scripts/seed-design-koblinger.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ALL_ROUTES } from "../src/lib/all-routes";
import { PORTAL_ROUTES } from "../src/lib/portal-routes";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type InvButton = {
  text: string;
  href?: string;
  type: "button" | "link";
};

type InvFile = {
  file: string;
  title: string;
  h1: string;
  buttonCount: number;
  linkCount: number;
  buttons: InvButton[];
};

const NO_REPLACE: Array<[RegExp, string]> = [
  [/æ/g, "ae"],
  [/ø/g, "o"],
  [/å/g, "a"],
];

function norm(s: string): string {
  let x = s.toLowerCase();
  for (const [re, rep] of NO_REPLACE) x = x.replace(re, rep);
  return x.replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): Set<string> {
  return new Set(norm(s).split(" ").filter((t) => t.length >= 3));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = new Set([...a].filter((x) => b.has(x))).size;
  const uni = new Set([...a, ...b]).size;
  return uni ? inter / uni : 0;
}

function bestRoute(designTitle: string, designFile: string) {
  const t = tokens(`${designTitle} ${designFile}`);
  let best: { route: string; label: string; score: number } | null = null;
  const candidates = [
    ...ALL_ROUTES.map((r) => ({ route: r.route, label: r.label })),
    ...PORTAL_ROUTES.map((r) => ({ route: r.route, label: r.label })),
  ];
  for (const c of candidates) {
    const rt = tokens(`${c.label} ${c.route}`);
    const score = jaccard(t, rt);
    if (!best || score > best.score) best = { ...c, score };
  }
  return best;
}

async function main() {
  const inv: InvFile[] = JSON.parse(
    readFileSync(
      join(process.cwd(), "docs", "design-koblinger", "inventar.json"),
      "utf-8",
    ),
  );

  console.log(`Seeder ${inv.length} design-koblinger`);

  let auto = 0;
  let weak = 0;

  for (const f of inv) {
    const match = bestRoute(f.title || f.h1 || f.file, f.file);
    const confidence = match ? Math.round(match.score * 100) : 0;
    const suggested = match?.route ?? null;

    // Sjekk om PORTAL_ROUTES har eksplisitt designPath-mapping
    const explicit = PORTAL_ROUTES.find(
      (r) =>
        r.designPath &&
        r.designPath.replace(/^\//, "") === f.file,
    );
    const finalRoute = explicit?.route ?? suggested;
    const finalConfidence = explicit ? 100 : confidence;
    const status: "MAPPED" | "UNMAPPED" =
      explicit || finalConfidence >= 30 ? "MAPPED" : "UNMAPPED";

    if (status === "MAPPED") auto++;
    else weak++;

    await prisma.designKobling.upsert({
      where: { designFile: f.file },
      create: {
        designFile: f.file,
        designTitle: f.title || f.h1 || f.file,
        designH1: f.h1 || null,
        suggestedRoute: finalRoute,
        confirmedRoute: explicit ? finalRoute : null,
        status,
        confidence: finalConfidence,
        buttonCount: f.buttonCount,
        linkCount: f.linkCount,
        buttons: f.buttons,
      },
      update: {
        designTitle: f.title || f.h1 || f.file,
        designH1: f.h1 || null,
        suggestedRoute: finalRoute,
        // Bare oppdater status/route hvis ikke allerede bekreftet manuelt
        ...(explicit
          ? {
              confirmedRoute: finalRoute,
              status,
              confidence: finalConfidence,
            }
          : {
              status,
              confidence: finalConfidence,
            }),
        buttonCount: f.buttonCount,
        linkCount: f.linkCount,
        buttons: f.buttons,
      },
    });
  }

  console.log(`Auto-mappet (>=60% eller eksplisitt): ${auto}`);
  console.log(`Svak match (UNMAPPED):                ${weak}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

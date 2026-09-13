#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
let feil = 0;

function les(relativSti) {
  return readFileSync(path.join(root, relativSti), "utf8");
}

function krev(relativSti, monster, forklaring) {
  if (!monster.test(les(relativSti))) {
    console.error(`${relativSti}: ${forklaring}`);
    feil += 1;
  }
}

const aargangSider = [
  "src/app/(marketing)/stats/aargang/page.tsx",
  "src/app/(marketing)/stats/aargang/[aar]/page.tsx",
];

for (const side of aargangSider) {
  krev(
    side,
    /await\s+requirePortalUser\(\{\s*kreverTilgang:\s*["']INGEN["']\s*\}\)/,
    "mangler autoritativ innloggingskontroll på sidenivå",
  );
}

krev(
  "src/app/team-gfgk/page.tsx",
  /notFound\(\)/,
  "skal være utilgjengelig inntil samtykkebasert datakilde er bygget",
);

const gfgkData = les("src/app/team-gfgk/data.ts");
if (/export\s+const\s+GFGK_DATA\b/.test(gfgkData)) {
  console.error(
    "src/app/team-gfgk/data.ts: statisk GFGK-spillerdatasett er forbudt i Git",
  );
  feil += 1;
}

if (feil > 0) {
  console.error(`check-sensitive-route-guards: ${feil} feil`);
  process.exit(1);
}

console.log("check-sensitive-route-guards: OK.");

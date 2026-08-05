#!/usr/bin/env node
// SessionStart-hook: sørger for at hver git-worktree har .env.local.
// Worktrees får ikke ignorerte filer med seg fra hovedmappa, så uten dette
// starter appen uten DATABASE_URL/Supabase-nøkler og feiler stille.
// Løsning: symlink til hovedmappas .env.local — én kilde, aldri utdaterte kopier.

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readlinkSync, symlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const prosjektDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

function hovedmappe() {
  // --git-common-dir peker på hoved-repoets .git også fra en worktree.
  const felles = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    cwd: prosjektDir,
    encoding: "utf8",
  }).trim();
  return dirname(felles);
}

// Next.js leser begge, og .env.development.local overstyrer .env.local i dev.
// Begge må derfor følge med, ellers oppfører worktreet seg ulikt hovedmappa.
const FILER = [".env.local", ".env.development.local"];

try {
  const hoved = hovedmappe();
  if (resolve(hoved) === resolve(prosjektDir)) process.exit(0); // ikke en worktree

  for (const navn of FILER) {
    const kilde = join(hoved, navn);
    const mal = join(prosjektDir, navn);

    if (!existsSync(kilde)) continue;

    if (existsSync(mal)) {
      const erRiktigLenke =
        lstatSync(mal).isSymbolicLink() &&
        resolve(prosjektDir, readlinkSync(mal)) === resolve(kilde);
      if (!erRiktigLenke) {
        console.log(`${navn} i dette worktreet er en egen kopi, ikke lenke til hovedmappa — kan være utdatert.`);
      }
      continue;
    }

    symlinkSync(relative(prosjektDir, kilde), mal);
    console.log(`${navn} var borte i dette worktreet — lenket til hovedmappas fil.`);
  }
} catch (feil) {
  console.log(`Kunne ikke sjekke .env.local for worktreet: ${feil.message}`);
}

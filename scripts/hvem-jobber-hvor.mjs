#!/usr/bin/env node
/**
 * Hvem jobber hvor — synlighet på tvers av parallelle økter.
 *
 * Bakgrunn (21.09.2026): to økter fikset de samme døde dokumentlenkene
 * samtidig, med motsatt strategi — #927 hentet de slettede filene tilbake,
 * #928 fjernet lenkene til dem. Begge ble merget, og resultatet ble halvveis:
 * filer uten lenker, og en lenke som pekte på nett i stedet for på filen ved
 * siden av. Ingenting sa fra, fordi ingen av øktene kunne se den andre.
 *
 * Repoet har 15 arbeidsmapper og 10 åpne pull requests samtidig, så dette er
 * normaltilstanden, ikke et uhell.
 *
 * To bruksmåter:
 *   node scripts/hvem-jobber-hvor.mjs              → oversikt (øktstart)
 *   node scripts/hvem-jobber-hvor.mjs --overlapp <gren>
 *       → åpne PR-er som rører de samme filene som <gren>, exit 1 ved treff
 *
 * Filsammenligningen er ren lokal git — ingen nettverkskall per PR.
 */

import { execFileSync } from "node:child_process";

const kjør = (fil, args) => {
  try {
    return execFileSync(fil, args, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return ""; // verktøy mangler, ikke innlogget, ingen treff — degrader pent
  }
};

/** Arbeidsmapper med gren, uten den vi står i selv. */
function arbeidsmapper() {
  const ut = [];
  let sti = null;
  for (const linje of kjør("git", ["worktree", "list", "--porcelain"]).split("\n")) {
    if (linje.startsWith("worktree ")) sti = linje.slice(9);
    else if (linje.startsWith("branch refs/heads/") && sti) {
      ut.push({ sti, gren: linje.slice(18) });
      sti = null;
    }
  }
  return ut;
}

/** Åpne pull requests. Tom liste når gh ikke er tilgjengelig. */
function åpnePrer() {
  const rå = kjør("gh", ["pr", "list", "--state", "open", "--json", "number,headRefName,title,isDraft"]);
  if (!rå) return [];
  try {
    return JSON.parse(rå);
  } catch {
    return [];
  }
}

/** Filer grenen endrer mot main. */
function filer(gren) {
  const ut = kjør("git", ["diff", "--name-only", `origin/main...${gren}`]);
  return ut ? new Set(ut.split("\n").filter(Boolean)) : new Set();
}

/**
 * Filer MIN gren endrer — committet og ikke. Uten arbeidsmappen ville vakten
 * vært blind rett før den første commiten, altså nettopp når man er i ferd med
 * å oppdage at en annen økt holder på med det samme.
 */
function mineFiler(gren) {
  const ut = filer(gren);
  // Arbeidsmappens endringer hører til grenen vi STÅR på. Spør noen om en
  // annen gren, ville de forurenset svaret.
  if (kjør("git", ["branch", "--show-current"]) !== gren) return ut;
  for (const linje of kjør("git", ["status", "--porcelain", "--untracked-files=all"]).split("\n")) {
    const sti = linje.slice(3).trim();
    if (sti) ut.add(sti.includes(" -> ") ? sti.split(" -> ")[1] : sti);
  }
  return ut;
}

const arg = process.argv[2];

if (arg === "--overlapp") {
  const min = process.argv[3];
  if (!min) {
    console.error("Bruk: --overlapp <gren>");
    process.exit(2);
  }
  const mine = mineFiler(min);
  if (mine.size === 0) process.exit(0); // ingenting å kollidere med

  const funn = [];
  for (const pr of åpnePrer()) {
    if (pr.headRefName === min) continue;
    const felles = [...filer(`origin/${pr.headRefName}`)].filter((f) => mine.has(f));
    if (felles.length > 0) funn.push({ pr, felles });
  }

  if (funn.length === 0) process.exit(0);

  console.log(
    `${funn.length} ${funn.length === 1 ? "åpen pull request rører" : "åpne pull requests rører"} de samme filene som «${min}»:`,
  );
  for (const { pr, felles } of funn) {
    console.log(
      `  #${pr.number}${pr.isDraft ? " (utkast)" : ""} ${pr.headRefName} — ${felles.length} felles fil${felles.length === 1 ? "" : "er"}: ${felles.slice(0, 3).join(", ")}${felles.length > 3 ? " m.fl." : ""}`,
    );
    console.log(`     ${pr.title}`);
  }
  console.log("\nLes den PR-en før du går videre. To rettelser av samme feil med");
  console.log("motsatt strategi gir et halvveis resultat som ingen vakt fanger.");
  process.exit(1);
}

// Oversikt
const mapper = arbeidsmapper();
const prer = åpnePrer();
if (mapper.length <= 1 && prer.length === 0) process.exit(0); // ingenting å melde

console.log("Parallelt arbeid i dette repoet nå:");
if (mapper.length > 0) {
  console.log(`\n  ${mapper.length} arbeidsmappe${mapper.length === 1 ? "" : "r"}:`);
  for (const m of mapper) console.log(`    ${m.gren}`);
}
if (prer.length > 0) {
  console.log(`\n  ${prer.length} ${prer.length === 1 ? "åpen pull request" : "åpne pull requests"}:`);
  for (const p of prer) console.log(`    #${p.number}${p.isDraft ? " (utkast)" : ""} ${p.headRefName} — ${p.title}`);
}
console.log("\nJobber du på noe en annen økt alt har tatt? Sjekk før du starter.");

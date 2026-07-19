/**
 * Morgenkjøring (kl. 08:30 via LaunchAgent) — ADHD-dashbordet.
 * Kjører KUN inbox-sortering + «Venter på deg» i dagens notat. Ingen
 * Supabase/destillering (det eies av 21:30-kjøringen i run.ts).
 *
 * Kjør: npm run meg:morgen
 * LaunchAgent-mal: com.akgolf.meg-morgen.plist (samme mappe).
 */

import "../_env";
import path from "path";
import os from "os";
import { sorterInbox } from "./inbox-sortering";
import { skrivVenterPaaDeg } from "./venter-paa-deg";

const AK_BRAIN_PATH =
  process.env.AK_BRAIN_PATH ?? path.join(os.homedir(), "ak-brain");

function dagensDatoOslo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function main() {
  const rapport = await sorterInbox(AK_BRAIN_PATH);
  console.log(
    `[meg:morgen] Inbox: ${rapport.sortert.length} sortert · ${rapport.uavklart.length} uavklart · ${rapport.feil.length} feil`,
  );

  await skrivVenterPaaDeg(dagensDatoOslo(), AK_BRAIN_PATH, {
    dagsnotat: null,
    uavklartInbox: rapport.uavklart,
  });
  console.log("[meg:morgen] Ferdig.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[meg:morgen] Kritisk feil:", err);
    process.exit(1);
  });

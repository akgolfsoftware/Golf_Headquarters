/**
 * Data Golf-porten på serveren — innlogget bruker og sidevakt.
 *
 * Regelen selv (bare COACH og ADMIN, Anders 09.10.2026) bor i
 * `datagolf-regel.ts`. Alle sider, server-handlinger, API-ruter og
 * menyinnganger som viser eller leverer Data Golf-tall skal spørre denne
 * porten. Ikke lag en egen rollesjekk.
 */

import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "./getCurrentUser";
import { kanSeDataGolf } from "./datagolf-regel";

export {
  DATAGOLF_ROLLER,
  kanSeDataGolf,
  UTEN_DATAGOLF_TURNERING,
  erDataGolfTurnering,
} from "./datagolf-regel";

/**
 * Innlogget bruker hvis hen kan se Data Golf, ellers null. Brukes der flaten
 * skal skjule Data Golf-delen i stedet for å sende brukeren bort (API-ruter,
 * blandede sider). Feiler oppslaget, er svaret nei (fail-closed).
 */
export async function hentDataGolfBruker() {
  try {
    const user = await getCurrentUserRaw();
    return kanSeDataGolf(user) ? user : null;
  } catch {
    return null;
  }
}

/** Er den innloggede brukeren en som kan se Data Golf? */
export async function innloggetKanSeDataGolf(): Promise<boolean> {
  return (await hentDataGolfBruker()) !== null;
}

/**
 * Sidevakt for rene Data Golf-sider. Uinnlogget sendes til innlogging (med
 * retur til `fra`), innlogget uten coach-rolle sendes til sin egen startside.
 */
export async function krevDataGolfBruker(fra: string) {
  const user = await getCurrentUserRaw();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(fra)}`);
  if (!kanSeDataGolf(user)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "GUEST") redirect("/admin/kalender");
    redirect("/portal");
  }
  return user;
}

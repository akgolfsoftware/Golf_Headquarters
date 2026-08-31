/**
 * `/admin/analyse/stall` — MASTERPLAN 15.8: slått sammen inn i
 * `/admin/analyse` som en nestet visning under fanen «stall»
 * (`?fane=stall&visning=trend`). Ren redirect, ingen innhold flyttet ut av
 * appen — se `src/lib/admin/analyse/faner.ts` og `lastInnsiktStall` i
 * `src/lib/admin/analyse/lastere.ts` (uendret spørring, kun flyttet).
 */

import { redirect } from "next/navigation";
import { ANALYSE_STALL_TREND_HREF } from "@/lib/admin/analyse/faner";

export default function AdminAnalyseStallRedirect() {
  redirect(ANALYSE_STALL_TREND_HREF);
}

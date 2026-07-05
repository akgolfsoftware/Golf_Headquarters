/**
 * /admin/stall — avviklet 2026-07-06 (Anders' beslutning).
 *
 * Erstattet av /admin/spillere (SpillerTilstandKort-liste, golfdata v13).
 * Redirect beholdes for gamle lenker/bokmerker.
 */

import { redirect } from "next/navigation";

export default function StallRedirect() {
  redirect("/admin/spillere");
}

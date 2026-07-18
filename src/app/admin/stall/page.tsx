/**
 * /admin/stall — avviklet 2026-07-06 (Anders' beslutning).
 *
 * Erstattet av /admin/spillere (StallV2: Liste/Tilstand-visning over stallen).
 * Redirect beholdes for gamle lenker/bokmerker. Portert ut av (legacy) i
 * v2-bølge A1 — ingen unik innhold å porte, legacy-siden var allerede redirect.
 */

import { redirect } from "next/navigation";

export default function StallRedirect() {
  redirect("/admin/spillere");
}

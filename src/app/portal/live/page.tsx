/**
 * /portal/live — indeksen viste en demoøkt med faste tall (26.09.2026). Live-økt
 * startes fra en ekte økt under /portal/live/[sessionId]; indeksen sender til Gjør nå.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function LiveRedirect() {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/gjennomfore");
}

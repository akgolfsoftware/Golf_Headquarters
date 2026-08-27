/**
 * AgencyOS — Lag-snitt, /admin/lag-snitt (T11, 27.08.2026).
 *
 * Flettet inn i AG-12 Innsikt stall: pyramide-akse-fordelingen per gruppe som
 * levde her er erstattet av stallens SG-per-kategori-visning på
 * `/admin/analyse/stall`. Ren redirect — ingen egen fasit for denne ruten
 * lenger (se docs/natt/D-LYS-OG-5T-BESLUTNING.md § T11).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

export default async function LagSnittPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  redirect("/admin/analyse/stall");
}

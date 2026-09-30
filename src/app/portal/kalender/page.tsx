/**
 * /portal/kalender er slått sammen med Plan (PH-10, IA 28.09.2026): Plan er én
 * flate i fire nivåer. Adressen sender videre og tar med datoen (`?dato=`).
 * Egne avtaler (opptatt tid) ligger fortsatt under /portal/kalender/opptatt.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erIso } from "@/lib/portal-plan/ph10-dato";

export const dynamic = "force-dynamic";

export default async function KalenderVideresending({ searchParams }: { searchParams: Promise<{ dato?: string }> }) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { dato } = await searchParams;
  redirect(erIso(dato) ? `/portal/planlegge?zoom=maaned&dato=${dato}` : "/portal/planlegge?zoom=maaned");
}

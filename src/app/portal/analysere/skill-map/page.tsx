/**
 * PH16bSkillMap — Precision Athletics. Data og handlinger er beholdt.
 * Skill Map skjematisk hullskisse med Strokes Gained per område.
 * Kilde: ui_kits/playerhq/screens/PH-16b-skill-map.jsx (Runde 22, 28.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16bSkillMap } from "@/components/portal/precision/PH16bSkillMap";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skill map · PlayerHQ" };

interface SkillMapPageProps {
  searchParams?: Promise<{
    pga?: string;
  }>;
}

export default async function SkillMapPage({ searchParams }: SkillMapPageProps) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : {};
  const pgaTour = resolvedParams.pga === "true" || resolvedParams.pga === "1";

  const [data, uleste] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16bSkillMap data={data} pgaTour={pgaTour} />
    </PlayerHQSkall>
  );
}

/**
 * PH16Stats — Precision Athletics. Data og handlinger er beholdt.
 * Analyse-hub for PlayerHQ med fire deler: Snittscore, Strokes Gained, Trening og Tester.
 * Kilde: ui_kits/playerhq/screens/PH-16-stats.jsx (Runde 22, 28.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16Stats } from "@/components/portal/precision/PH16Stats";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { getUnreadNotifications } from "@/app/portal/actions";
import type { StatsFane } from "@/lib/portal-analyse/ph16-stats-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stats · PlayerHQ" };

interface AnalyserePageProps {
  searchParams?: Promise<{
    del?: string;
    fane?: string;
    pga?: string;
  }>;
}

export default async function AnalyserePage({ searchParams }: AnalyserePageProps) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : {};
  const valgtFaneParam = resolvedParams.del || resolvedParams.fane;
  const gyldigeFaner: StatsFane[] = ["snitt", "sg", "tren", "test"];
  const aktivFane: StatsFane | undefined = gyldigeFaner.includes(valgtFaneParam as StatsFane)
    ? (valgtFaneParam as StatsFane)
    : undefined;
  const pgaTourInit = resolvedParams.pga === "true" || resolvedParams.pga === "1";

  const [data, uleste] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16Stats data={data} aktivFane={aktivFane} pgaTourInit={pgaTourInit} />
    </PlayerHQSkall>
  );
}

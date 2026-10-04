/**
 * PH17TrackMan — Precision Athletics. Data og handlinger er beholdt.
 * TrackMan-hub med 4 faner: Økter, Gapping, Utstyr og Stasjon.
 * Kilde: ui_kits/playerhq/screens/PH-17.jsx (26.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TrackMan } from "@/components/portal/precision/PH17TrackMan";
import { loadPH17TrackMan } from "@/lib/portal-analyse/load-ph17-trackman";
import { getUnreadNotifications } from "@/app/portal/actions";
import type { TrackManFane } from "@/lib/portal-analyse/ph17-trackman-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · PlayerHQ" };

interface TrackManPageProps {
  searchParams?: Promise<{
    fane?: string;
    tab?: string;
  }>;
}

export default async function TrackManListePage({ searchParams }: TrackManPageProps) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : {};
  const valgtFane = (resolvedParams.fane || resolvedParams.tab) as TrackManFane | undefined;
  const gyldigeFaner: TrackManFane[] = ["okter", "gap", "utstyr", "stasjon"];
  const aktivFane = gyldigeFaner.includes(valgtFane as TrackManFane) ? valgtFane : undefined;

  const [data, uleste] = await Promise.all([
    loadPH17TrackMan(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TrackMan data={data} aktivFane={aktivFane} />
    </PlayerHQSkall>
  );
}

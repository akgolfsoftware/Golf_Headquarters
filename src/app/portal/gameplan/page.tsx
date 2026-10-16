/**
 * PlayerHQ Gameplan — Banebibliotek og interaktivt banekart (PH-20).
 * Precision Athletics (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-20.jsx).
 *
 * Markør: PH20Gameplan
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Gameplan } from "@/components/portal/precision/PH20Gameplan";
import { getGameplanCourses } from "@/lib/portal-gameplan/gameplan-queries";

export const dynamic = "force-dynamic";

export default async function GameplanPage({
  searchParams,
}: {
  searchParams?: Promise<{ baneId?: string; tilstand?: "data" | "tom" | "feil" }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : undefined;
  const tilstand = resolvedParams?.tilstand ?? "data";
  const defaultCourseId = resolvedParams?.baneId;

  const courses = await getGameplanCourses(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH20Gameplan
        tilstand={tilstand}
        courses={courses}
        defaultCourseId={defaultCourseId}
      />
    </PlayerHQSkall>
  );
}

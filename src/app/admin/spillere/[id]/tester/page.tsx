/**
 * /admin/spillere/[id]/tester — coach-view av en spillers tester.
 * Visuelt portet fra Claude Design, men all data er ekte (loadSpillerTesterData).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { CoachSpillerTesterTabScreen } from "@/components/test-modul-v2/coach-spiller-tester-tab-screen";

export const dynamic = "force-dynamic";

export default async function SpillerTesterTabPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const data = await loadSpillerTesterData(id);
  if (!data) notFound();
  return <CoachSpillerTesterTabScreen data={data} playerId={id} />;
}

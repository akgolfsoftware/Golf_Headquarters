/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 * Coach opererer i spillerens workbench (role=coach): tre-sidemeny,
 * uke-kalender, inspector med coach-handlinger + COACH-ONLY-blokk.
 *
 * Pixel-port av design-handover/agencyos/components-workbench-{sidebar,week,day}.html.
 * Server Component med live Prisma-data via loadCoachWorkbench.
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CoachWorkbench } from "@/components/admin/coach-workbench/coach-workbench";
import { loadCoachWorkbench } from "@/lib/admin-workbench/workbench-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoachWorkbenchPage({ params }: Props) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "ADMIN" && me.role !== "COACH")) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const props = await loadCoachWorkbench(id);
  if (!props) notFound();

  return <CoachWorkbench {...props} />;
}

/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 * Coach opererer i spillerens workbench (role=coach): tre-sidemeny,
 * uke-kalender, inspector med coach-handlinger + COACH-ONLY-blokk.
 *
 * Pixel-port av design-handover/agencyos/components-workbench-{sidebar,week,day}.html.
 * Server Component med live Prisma-data via loadCoachWorkbench.
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Workbench } from "@/components/workbench/workbench";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoachWorkbenchPage({ params }: Props) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "ADMIN" && me.role !== "COACH")) {
    redirect("/auth/login");
  }

  await params; // spiller-id brukes i W5b for ekte coach-data + notFound

  // W5a: ny v10-Workbench (coach-variant) montert med demo-data.
  // Ekte data (loadCoachWorkbench(id) → data-adapter) + notFound kobles i W5b.
  return <Workbench role="coach" />;
}

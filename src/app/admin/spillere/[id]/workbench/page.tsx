/**
 * /admin/spillere/[id]/workbench — Coach-view av spillers plan-workbench.
 * Gjenbruker WorkbenchPlanA-komponenten i coach-modus.
 *
 * Workbench Plan A · Sprint 4 — coach-routes.
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { WorkbenchPlanA } from "@/components/portal-planlegge/workbench/workbench-shell";

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
  const player = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, hcp: true, tier: true },
  });
  if (!player) notFound();

  return <WorkbenchPlanA />;
}

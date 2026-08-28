/**
 * AgenticOS Projects — AO-05. Gruppert på Area. Tom når cache er tom.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { lastAgenticosProjects } from "@/lib/agencyos/last-agenticos";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosProjects } from "@/components/admin/v2/agenticos/AdminAgenticosProjects";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects · AgenticOS" };

export default async function AdminAgenticosProjectsPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  const data = await lastAgenticosProjects();
  return (
    <AgenticosRamme user={user}>
      <AdminAgenticosProjects data={data} />
    </AgenticosRamme>
  );
}

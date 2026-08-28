/**
 * AgenticOS Skills — AO-09. Policy-visning, ingen persistente brytere.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosSkills } from "@/components/admin/v2/agenticos/AdminAgenticosSkills";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skills · AgenticOS" };

export default async function AdminAgenticosSkillsPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  return (
    <AgenticosRamme user={user}>
      <AdminAgenticosSkills />
    </AgenticosRamme>
  );
}

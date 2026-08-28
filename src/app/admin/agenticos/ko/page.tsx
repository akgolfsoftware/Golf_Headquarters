/**
 * AgenticOS Kø — AO-03. Klar · Pågår · Venter godkjenning.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { lastAgenticosKo } from "@/lib/agencyos/last-agenticos";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosKo } from "@/components/admin/v2/agenticos/AdminAgenticosKo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kø · AgenticOS" };

export default async function AdminAgenticosKoPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  const data = await lastAgenticosKo(user);
  return (
    <AgenticosRamme user={user}>
      <AdminAgenticosKo data={data} />
    </AgenticosRamme>
  );
}

/**
 * AgenticOS Runtimes — AO-02 / AO-10. Ærlig status, ingen oppdiktet helse.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { lastAgenticosKjoringerIdag } from "@/lib/agencyos/last-agenticos";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosRuntimes } from "@/components/admin/v2/agenticos/AdminAgenticosRuntimes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Runtimes · AgenticOS" };

export default async function AdminAgenticosRuntimesPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  const kjoringerIdag = await lastAgenticosKjoringerIdag();
  return (
    <AgenticosRamme user={user}>
      <AdminAgenticosRuntimes kjoringerIdag={kjoringerIdag} />
    </AgenticosRamme>
  );
}

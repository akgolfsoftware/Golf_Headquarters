/**
 * AgenticOS Godkjenn — AO-08. Kun oppgaver med sideeffekt.
 */

import { Suspense } from "react";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { lastAgenticosGodkjenn } from "@/lib/agencyos/last-agenticos";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosGodkjenn } from "@/components/admin/v2/agenticos/AdminAgenticosGodkjenn";
import { V2Laster } from "@/components/v2/feil-laste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Godkjenn · AgenticOS" };

export default async function AdminAgenticosGodkjennPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  const data = await lastAgenticosGodkjenn(user);
  return (
    <AgenticosRamme user={user}>
      <Suspense fallback={<V2Laster variant="liste" />}>
        <AdminAgenticosGodkjenn data={data} />
      </Suspense>
    </AgenticosRamme>
  );
}

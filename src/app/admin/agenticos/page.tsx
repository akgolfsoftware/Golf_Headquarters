/**
 * AgenticOS cockpit — /admin/agenticos.
 *
 * Fasit: designsystem/train-lock/AO-01 Cockpit ko godkjenning.dc.html
 * + AO-00 LOCK Run Skills Tilstander.dc.html (AO-00 er et lås-/referanseark
 * for tokens+rail, ikke en egen skjerm — oppfylt av train-lock.ts + V2Shell).
 *
 * IA (T12 #630) er urørt: AgencyOS Kø = /admin/godkjenninger.
 * Jarvis-fanen peker hit.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { lastAgenticosCockpit } from "@/lib/agencyos/last-agenticos";
import { AgenticosRamme } from "@/components/admin/v2/agenticos/AgenticosRamme";
import { AdminAgenticosCockpit } from "@/components/admin/v2/agenticos/AdminAgenticosCockpit";

export const dynamic = "force-dynamic";
export const metadata = { title: "AgenticOS · AgencyOS" };

export default async function AdminAgenticosPage() {
  const user = await requireCapability(Capability.USE_AGENTS);
  const data = await lastAgenticosCockpit(user);
  return (
    <AgenticosRamme user={user}>
      <AdminAgenticosCockpit data={data} />
    </AgenticosRamme>
  );
}

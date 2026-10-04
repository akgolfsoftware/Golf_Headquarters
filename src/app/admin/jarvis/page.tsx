/**
 * Jarvis / Caddie — AG-19 i Precision Athletics (/admin/jarvis).
 *
 * Én samlet adresse for Caddie & Jarvis AI-hub:
 * 1. Agentkø med kjøringer, steg, godkjenning og feilhåndtering
 * 2. Prosjekter med oppgaver og status
 * 3. Skills og automatiseringsregler med aktiv/av-bryter
 * 4. Caddie-samtale med kildehenvisning og utkast-lagring
 *
 * Erstatter Train-lock-skallet (V2Shell/TL) med Precision Athletics (AgencyOSSkall og AG19CaddieHub).
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG19CaddieHub } from "@/components/admin/precision/AG19CaddieHub";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · Jarvis · AgencyOS" };

export default async function JarvisPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requireCapability(Capability.USE_AGENTS);
  const { fane } = await searchParams;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG19CaddieHub startFane={fane} />
    </AgencyOSSkall>
  );
}

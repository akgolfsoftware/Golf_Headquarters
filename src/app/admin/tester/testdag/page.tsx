/**
 * AG-15 Planlegg testdag (`/admin/tester/testdag`). Tilgang: MANAGE_TESTS; gruppene er
 * de coachen eier eller er aktivt COACH-medlem i. `?gruppe=` velger gruppa.
 */
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15Planlegg } from "@/components/admin/precision/AG15Testdag";
import { lastTestdagValg } from "@/lib/admin/tester/testdag-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Planlegg testdag · AgencyOS" };

export default async function PlanleggTestdagPage({ searchParams }: { searchParams: Promise<{ gruppe?: string }> }) {
  const user = await requireCapability(Capability.MANAGE_TESTS);
  const { gruppe } = await searchParams;
  const { grupper, tester } = await lastTestdagValg(user);
  const idag = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG15Planlegg grupper={grupper} tester={tester} startGruppe={gruppe ?? null} idag={idag} />
    </AgencyOSSkall>
  );
}

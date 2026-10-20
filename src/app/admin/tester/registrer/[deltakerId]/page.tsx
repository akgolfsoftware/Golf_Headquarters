/**
 * AG-15 Registrer test (`/admin/tester/registrer/[deltakerId]`). Bare deltakere i
 * grupper coachen eier eller er COACH-medlem i, og bare tester en trener kan føre.
 * key=deltakerId: skjemaet starter blankt for hver spiller.
 */
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15Registrer } from "@/components/admin/precision/AG15Registrer";
import { lastRegistrering } from "@/lib/admin/tester/testdag-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Registrer test · AgencyOS" };

export default async function RegistrerTestPage({ params }: { params: Promise<{ deltakerId: string }> }) {
  const user = await requireCapability(Capability.MANAGE_TESTS);
  const { deltakerId } = await params;
  const d = await lastRegistrering(user, deltakerId);
  if (!d) notFound();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><AG15Registrer key={deltakerId} d={d} /></AgencyOSSkall>;
}

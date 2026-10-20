/** AG-15 Testdagen (`/admin/tester/testdag/[eventId]`): stasjonene og spillerne. Bare egne grupper. */
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15TestdagVis } from "@/components/admin/precision/AG15Testdag";
import { lastTestdag } from "@/lib/admin/tester/testdag-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Testdag · AgencyOS" };

export default async function TestdagPage({ params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireCapability(Capability.MANAGE_TESTS);
  const { eventId } = await params;
  const d = await lastTestdag(user, eventId);
  if (!d) notFound();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><AG15TestdagVis d={d} /></AgencyOSSkall>;
}

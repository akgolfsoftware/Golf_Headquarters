/**
 * AG-15 Testdagen (`/admin/tester/testdag/[eventId]`): stasjonene og spillerne. Bare egne grupper.
 * `?deltaker=` åpner registreringen for én spiller til høyre (samme tilgang og lagring som
 * /admin/tester/registrer/[deltakerId]); deltakeren må høre til denne testdagen.
 */
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15TestdagVis } from "@/components/admin/precision/AG15Testdag";
import { lastRegistrering, lastTestdag } from "@/lib/admin/tester/testdag-data";
import { lastTesterOversikt } from "@/lib/admin/tester/oversikt-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Testdag · AgencyOS" };

export default async function TestdagPage({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ deltaker?: string }> }) {
  const user = await requireCapability(Capability.MANAGE_TESTS);
  const { eventId } = await params;
  const { deltaker } = await searchParams;
  const d = await lastTestdag(user, eventId);
  if (!d) notFound();
  const [registrering, oversikt] = await Promise.all([
    deltaker ? lastRegistrering(user, deltaker) : Promise.resolve(null),
    lastTesterOversikt(user, d.gruppeId),
  ]);
  const valgt = registrering && registrering.testdag.eventId === d.id ? registrering : null;
  return <AgencyOSSkall navn={user.name ?? "Coach"}><AG15TestdagVis d={d} valgt={valgt} tilKontroll={oversikt.tilKontroll} /></AgencyOSSkall>;
}

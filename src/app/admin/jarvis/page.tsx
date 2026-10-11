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
import {
  AG19CaddieHub,
  type AG19Data,
} from "@/components/admin/precision/AG19CaddieHub";
import { prisma } from "@/lib/prisma";
import { AGENTICOS_SKILLS } from "@/lib/agencyos/agenticos-ia";
import { formaterVarighet } from "@/lib/trackman/okt-oppsummering";
import { velgJarvisFane } from "@/lib/admin/jarvis/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · Jarvis · AgencyOS" };

export default async function JarvisPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requireCapability(Capability.USE_AGENTS);
  const { fane } = await searchParams;
  const aktiv = velgJarvisFane(fane);

  const tid = (d: Date) =>
    d.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Oslo",
    });

  // Ekte kjøringer fra agentloggen. Utdata (JSON) vises ikke: kan inneholde persondata.
  const kjoringer = await prisma.agentRun
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, agentName: true, status: true, duration: true, error: true, createdAt: true },
    })
    .catch(() => []);

  const data: AG19Data = {
    runs: kjoringer.map((k) => ({
      id: k.id,
      agent: k.agentName,
      st: k.status === "OK" ? "Kjørt" : "Feilet",
      t: tid(k.createdAt),
      dur: formaterVarighet(Math.round(k.duration / 1000)) ?? "—",
      err: k.status === "OK" ? null : "Kjøringen feilet. Detaljer ligger i feilloggen.",
    })),
    projects: [],
    skills: AGENTICOS_SKILLS.map((sk) => [sk.id, sk.tittel, sk.meta, sk.paa] as [string, string, string, boolean]),
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG19CaddieHub data={data} startFane={aktiv} />
    </AgencyOSSkall>
  );
}

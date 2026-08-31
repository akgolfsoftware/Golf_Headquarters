/**
 * Jarvis — ÉN adresse (MASTERPLAN 15.5, beslutning 6.9 «én inngang per funksjon»).
 *
 * Slår sammen fire adresser: `/admin/agenticos`, `/admin/agenticos/projects`,
 * `/admin/agenticos/runtimes`, `/admin/agenticos/skills`. Alle fire består som
 * redirects til `/admin/jarvis?fane=<id>` (standardfanen «Kø» får ren adresse).
 *
 * IKKE her: `/admin/agenticos/ko` og `/admin/agenticos/godkjenn` — de flyttet
 * allerede til `/admin/ko` (MASTERPLAN 15.1) som fanene «agentko»/«agentgodkjenn».
 * `/admin/agents/[agentId]` (agent-detaljarket) er heller ikke en av de fire.
 *
 * De fire fane-komponentene (Cockpit/Projects/Runtimes/Skills) var allerede
 * bygget som fane-innhold under `AgenticosSkall` — ingen av dem eier et eget
 * sideheode eller egen toppnavigasjon, så `somFane`-mønsteret fra 15.1/15.2/
 * 15.6 er ikke nødvendig her (lærdommen sjekket eksplisitt, se
 * `.claude/rules/beslutninger.md`).
 *
 * Design: canvas godkjent av Anders 30.08.2026 —
 * `designsystem/canvas/agencyos-ia/Jarvis.dc.html`.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { JarvisHode } from "@/components/admin/v2/jarvis/JarvisHode";
import { AdminAgenticosCockpit } from "@/components/admin/v2/agenticos/AdminAgenticosCockpit";
import { AdminAgenticosProjects } from "@/components/admin/v2/agenticos/AdminAgenticosProjects";
import { AdminAgenticosRuntimes } from "@/components/admin/v2/agenticos/AdminAgenticosRuntimes";
import { AdminAgenticosSkills } from "@/components/admin/v2/agenticos/AdminAgenticosSkills";
import {
  lastAgenticosCockpit,
  lastAgenticosProjects,
  lastAgenticosKjoringerIdag,
} from "@/lib/agencyos/last-agenticos";
import { JARVIS_FANER, velgJarvisFane } from "@/lib/admin/jarvis/faner";
import { jarvisFaneTellinger } from "@/lib/admin/jarvis/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jarvis · AgencyOS" };

export default async function JarvisPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requireCapability(Capability.USE_AGENTS);
  const { fane: onsket } = await searchParams;
  const aktiv = velgJarvisFane(onsket);

  // Cockpit- og Projects-dataene brukes også til pille-tellingene, så de
  // lastes alltid; Runtimes/Skills-innhold lastes kun når fanen er aktiv.
  const [cockpit, projects] = await Promise.all([
    lastAgenticosCockpit(user),
    lastAgenticosProjects(),
  ]);
  const antall = jarvisFaneTellinger(cockpit, projects);

  const innhold = await (async () => {
    switch (aktiv) {
      case "ko":
        return <AdminAgenticosCockpit data={cockpit} />;
      case "prosjekter":
        return <AdminAgenticosProjects data={projects} />;
      case "skills":
        return <AdminAgenticosSkills />;
      case "runtimes": {
        const kjoringerIdag = await lastAgenticosKjoringerIdag();
        return <AdminAgenticosRuntimes kjoringerIdag={kjoringerIdag} />;
      }
    }
  })();

  return (
    <V2Shell
      bredde="full"
      aktiv="jarvis"
      nav={AGENCYOS_NAV}
      navn={user.name ?? "Coach"}
      avatarUrl={user.avatarUrl}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <JarvisHode faner={JARVIS_FANER} aktiv={aktiv} antall={antall} />
        {innhold}
      </div>
    </V2Shell>
  );
}

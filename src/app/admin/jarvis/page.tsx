/**
 * Jarvis — ÉN adresse (MASTERPLAN 15.5, beslutning 6.9 «én inngang per funksjon»),
 * nå AG-19 i Precision Athletics.
 *
 * Fire adresser består som redirects til `/admin/jarvis?fane=<id>`:
 * `/admin/agenticos`, `/projects`, `/runtimes`, `/skills`. Caddie-samtalen
 * (`/admin/agencyos/caddie`, `/admin/caddie`) redirecter til `?fane=samtale`.
 * IKKE her: `/admin/agenticos/ko` og `/admin/agenticos/godkjenn` (flyttet til
 * `/admin/ko`, fanene «agentko»/«agentgodkjenn»). `/admin/agents/[agentId]` er
 * kjøringsdetaljen og beholder sin egen adresse.
 *
 * Auth og lastere følger dagens flate uendret (USE_AGENTS for hele siden).
 * Bare visningen er byttet fra V2Shell/train-lock til AgencyOSSkall/AG19Jarvis.
 * Samtalen krever ADMIN (samme grense som `/api/caddie/*`); andre roller ser en
 * forklaring, og ingen samtale opprettes for dem.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG19Jarvis } from "@/components/admin/precision/AG19Jarvis";
import {
  lastAgenticosCockpit,
  lastAgenticosProjects,
  lastAgenticosKjoringerIdag,
} from "@/lib/agencyos/last-agenticos";
import { AGENTICOS_RUNTIMES, AGENTICOS_SKILLS } from "@/lib/agencyos/agenticos-ia";
import { JARVIS_FANER, velgJarvisFane } from "@/lib/admin/jarvis/faner";
import { jarvisFaneTellinger } from "@/lib/admin/jarvis/lastere";
import { hentEllerOpprettSamtale, lastJarvisKjoringer } from "@/lib/admin/jarvis/last-jarvis";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jarvis · AgencyOS" };

export default async function JarvisPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; kjoring?: string }>;
}) {
  const user = await requireCapability(Capability.USE_AGENTS);
  const { fane: onsket, kjoring } = await searchParams;
  const aktiv = velgJarvisFane(onsket);

  // Cockpit- og Projects-dataene brukes også til pille-tellingene, så de
  // lastes alltid; resten lastes kun når fanen er aktiv.
  const [cockpit, prosjekter] = await Promise.all([lastAgenticosCockpit(user), lastAgenticosProjects()]);
  const antall = jarvisFaneTellinger(cockpit, prosjekter);
  const kjoringer = aktiv === "ko" ? await lastJarvisKjoringer() : [];
  const kjoringerIdag = aktiv === "runtimes" ? await lastAgenticosKjoringerIdag() : 0;
  const samtale = aktiv === "samtale" && user.role === "ADMIN" ? await hentEllerOpprettSamtale(user.id) : null;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG19Jarvis
        tilstand={aktiv === "ko" && kjoringer.length === 0 && !cockpit.neste && cockpit.venterPaDeg === 0 ? "tom" : "data"}
        fane={aktiv}
        faner={JARVIS_FANER}
        antall={antall}
        cockpit={cockpit}
        kjoringer={kjoringer}
        valgtKjoringId={kjoring ?? null}
        prosjekter={prosjekter}
        skills={AGENTICOS_SKILLS}
        runtimes={AGENTICOS_RUNTIMES}
        kjoringerIdag={kjoringerIdag}
        samtale={samtale}
      />
    </AgencyOSSkall>
  );
}

import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoachArsplan } from "./coach-arsplan";
import { hentWangGruppe } from "../_data/hent-wang-gruppe";

// WANG Årsplan (Coach) – trenerverktøy. SPERRET for ADMIN/COACH: siden viser
// roster med elevnavn og IUP-lenker — PII om mindreårige. To lag foran den,
// `proxy.ts` og `requirePortalUser` under; ingen av dem skal fjernes alene.
// Mellom 2026-08-15 og denne endringen var begge av, og navnene lå åpent for
// alle med lenken. Fellessiden (/team-wang) er åpen ved siden av, men den er
// navnefri. Fortsatt noindex. Live-henting er try/catch-pakket, så bygg krever
// aldri nåbar database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description:
    "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangCoachPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"], redirectTo: "/team-wang/logg-inn" });
  // Eneste stedet elevnavn hentes. Trygt her: siden er sperret både i proxy.ts
  // og av requirePortalUser over — fellessiden ved siden av er åpen.
  const live = await hentWangGruppe({ medElevnavn: true });
  return <CoachArsplan live={live} />;
}

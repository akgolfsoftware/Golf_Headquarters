import type { Metadata } from "next";

import { CoachArsplan } from "./coach-arsplan";
import { hentWangGruppe } from "../_data/hent-wang-gruppe";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

// WANG Årsplan (Coach) – trenerverktøy. Krever innlogget COACH/ADMIN (proxy.ts
// sperrer allerede uinnloggede; her innsnevres det til trenerrollen). Fortsatt
// noindex. Kobler ekte perioder og elevliste fra AgencyOS-gruppa oppå
// skjermtekst-demoen; live-henting er try/catch-pakket, så bygg krever aldri
// nåbar database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description: "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangCoachPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"], redirectTo: "/team-wang/logg-inn" });
  // Eneste stedet elevnavn hentes. Trygt her: siden er sperret både i proxy.ts
  // og av requirePortalUser over — fellessiden ved siden av er åpen.
  const live = await hentWangGruppe({ medElevnavn: true });
  return <CoachArsplan live={live} />;
}

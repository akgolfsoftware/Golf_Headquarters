import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoachArsplan } from "@/app/team-wang/coach/coach-arsplan";
import { hentWangGruppe } from "@/app/team-wang/_data/hent-wang-gruppe";
import { hentWangCoachGruppeId } from "@/app/team-wang/_data/wang-tilgang";

// WANG Årsplan (Coach) – trenerverktøy. Siden viser roster med elevnavn og
// IUP-lenker — PII om mindreårige. I tillegg til innlogging og global rolle må
// coach/hjelpetrener ha aktivt medlemskap i akkurat WANG Toppidrett-gruppen.
// Mellom 2026-08-15 og denne endringen var begge av, og navnene lå åpent for
// alle med lenken. Fellessiden (/team-wang) er åpen ved siden av, men den er
// navnefri. Fortsatt noindex. Databasefeil går til WANGs trygge feiltilstand.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description:
    "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangCoachPage() {
  const bruker = await requirePortalUser({
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach",
  });
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) notFound();
  // Eneste stedet elevnavn hentes. Trygt her: siden er sperret både i proxy.ts
  // og av requirePortalUser over — fellessiden ved siden av er åpen.
  const live = await hentWangGruppe({ medElevnavn: true });
  if (!live || live.gruppeId !== gruppeId) notFound();
  return <CoachArsplan live={live} />;
}

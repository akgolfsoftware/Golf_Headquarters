import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangCoachGruppeId } from "@/app/team-wang/_data/wang-tilgang";
import { wangRolleFor } from "@/app/team-wang/_data/wang-rolle";
import { WangCoachKlient } from "@/app/team-wang/coach/WangCoachKlient";
import { hentWangGruppe } from "@/app/team-wang/_data/hent-wang-gruppe";
import { byggWangTrenerData, osloIdagIso } from "@/app/team-wang/_data/wang-trener-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Toppidrett Golf — Skjermoversikt (WANG-00)",
  description: "Komplett skjermregister og oversikt over alle skjermer for WANG Golf.",
  robots: { index: false, follow: false },
};

/**
 * Skjermregisteret lister skjermene i trenerflaten og er bare for trener og
 * sportssjef i WANG-gruppa. Proxyen sperrer
 * uinnloggede; denne sjekken gjør rolle- og gruppeporten (samme som coach/page).
 */
export default async function WangSkjermerPage() {
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fskjermer",
  });
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) notFound();
  const live = await hentWangGruppe({ gruppeId, medElevnavn: true });
  if (!live || live.gruppeId !== gruppeId) notFound();

  return (
    <WangCoachKlient
      omraade="system"
      rolle={wangRolleFor(bruker)}
      brukerNavn={bruker.name ?? undefined}
      data={byggWangTrenerData(live, osloIdagIso())}
    />
  );
}

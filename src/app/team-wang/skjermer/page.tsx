import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangCoachGruppeId } from "@/app/team-wang/_data/wang-tilgang";
import { wangRolleFor } from "@/app/team-wang/_data/wang-rolle";
import { WangCoachKlient } from "@/app/team-wang/coach/WangCoachKlient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Toppidrett Golf — Skjermoversikt (WANG-00)",
  description: "Komplett skjermregister og oversikt over alle skjermer for WANG Golf.",
  robots: { index: false, follow: false },
};

/**
 * Skjermregisteret rendrer hele demokatalogen (navn, tall, IUP-tekster) og er
 * derfor bare for trener og sportssjef i WANG-gruppa. Proxyen sperrer
 * uinnloggede; denne sjekken gjør rolle- og gruppeporten (samme som coach/page).
 */
export default async function WangSkjermerPage() {
  const bruker = await requirePortalUser({
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fskjermer",
  });
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) notFound();

  return (
    <WangCoachKlient
      omraade="system"
      rolle={wangRolleFor(bruker)}
      brukerNavn={bruker.name ?? undefined}
      campus="Fredrikstad"
    />
  );
}

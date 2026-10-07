import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoachArsplan } from "@/app/team-wang/coach/coach-arsplan";
import { hentWangGruppe } from "@/app/team-wang/_data/hent-wang-gruppe";
import { hentWangCoachGruppeId } from "@/app/team-wang/_data/wang-tilgang";
import {
  kanSeWangAdministrasjon,
  wangRolleFor,
} from "@/app/team-wang/_data/wang-rolle";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { WangCoachKlient } from "@/app/team-wang/coach/WangCoachKlient";
import type { WangOmraade } from "@/components/wang/WangAppSkall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Toppidrett Golf — Trener & Sportssjef",
  description:
    "Trenerens og sportssjefens operative golfmodul for elever ved WANG Toppidrett.",
  robots: { index: false, follow: false },
};

interface WangCoachPageProps {
  searchParams?: Promise<{
    omraade?: string;
    fane?: string;
    visArsplan?: string;
  }>;
}

// «system» (skjermoversikten) har egen rute under /team-wang/skjermer.
const GYLDIGE_OMRAADER: WangOmraade[] = [
  "idag",
  "trening",
  "tester",
  "konkurranse",
  "meldinger",
  "elever",
  "admin",
  "system",
];

export default async function WangCoachPage({ searchParams }: WangCoachPageProps = {}) {
  const params = searchParams ? await searchParams : {};
  const bruker = await requirePortalUser({
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach",
  });
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) notFound();

  const live = await hentWangGruppe({ medElevnavn: true });
  if (!live || live.gruppeId !== gruppeId) notFound();

  // Hvis eksplisitt bestilt gammel årsplanvisning:
  if (params.visArsplan === "1") {
    const kanPublisere = await canUser(bruker, Capability.EDIT_GROUP_PLANS);
    return <CoachArsplan live={live} kanPublisere={kanPublisere} />;
  }

  // Rollen avgjøres her på serveren og kan ikke velges i nettleseren.
  const rolle = wangRolleFor(bruker);

  const aktivtOmraade: WangOmraade =
    params.omraade && GYLDIGE_OMRAADER.includes(params.omraade as WangOmraade)
      ? (params.omraade as WangOmraade)
      : "idag";

  // Administrasjon er bare for sportssjef. Trener sendes tilbake til I dag.
  if (aktivtOmraade === "admin" && !kanSeWangAdministrasjon(rolle)) {
    redirect("/team-wang/coach?omraade=idag");
  }

  const elever = live.elever
    .filter((e) => e.rolle === "PLAYER")
    .map((e) => ({ id: e.id, navn: e.navn }));

  return (
    <WangCoachKlient
      omraade={aktivtOmraade}
      fane={params.fane}
      rolle={rolle}
      brukerNavn={bruker.name ?? undefined}
      elever={elever}
      campus="Fredrikstad"
    />
  );
}

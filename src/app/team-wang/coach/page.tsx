import { notFound } from "next/navigation";
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
import { hentWangPlanData } from "@/app/team-wang/_data/wang-plan-data";
import { WangCoachKlient } from "@/app/team-wang/coach/WangCoachKlient";
import type { WangOmraade } from "@/components/wang/WangAppSkall";
import { kanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentWangDataGolf, hentWangDgElev } from "@/app/team-wang/_data/wang-datagolf-data";
import { dgSideFraFane, type WangDataGolfData } from "@/app/team-wang/_data/wang-datagolf-visning";
import {
  hentWangSamtykkeStatus,
  hentWangTesterData,
} from "@/app/team-wang/_data/wang-tester-data";
import { hentWangOpptak } from "@/app/team-wang/_data/wang-opptak";
import { opptakSkoleaar } from "@/app/team-wang/_data/wang-opptak-visning";
import {
  hentWangElevdata,
  hentWangFireukerssjekk,
} from "@/app/team-wang/_data/wang-elevdata";
import {
  byggWangTrenerData,
  osloIdagIso,
  osloNaaTid,
} from "@/app/team-wang/_data/wang-trener-data";

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
    okt?: string;
    id?: string;
    sok?: string;
    tour?: string;
    norske?: string;
    kat?: string;
    aar?: string;
    spiller?: string;
    pro?: string;
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
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach",
  });
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) notFound();

  const live = await hentWangGruppe({ gruppeId, medElevnavn: true });
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

  // Administrasjon er bare for sportssjef. Trener får «Denne siden er lukket» og ingen data herfra.
  const erAdmin = aktivtOmraade === "admin" && kanSeWangAdministrasjon(rolle);

  // Testresultater og testsamtykke bare der de vises. Tilgangen går gjennom delingssamtykket.
  const tester = ["tester", "elever"].includes(aktivtOmraade) || erAdmin
    ? await hentWangTesterData(bruker, gruppeId)
    : undefined;
  if (tester && erAdmin) {
    tester.samtykke = await hentWangSamtykkeStatus(
      live.elever.filter((e) => e.rolle === "PLAYER").map((e) => e.id),
      gruppeId,
    );
  }

  // Elevenes delte plan (W1): bare elever med plansamtykke mot gruppa. Andre får «—».
  const plan = ["idag", "trening", "elever"].includes(aktivtOmraade)
    ? await hentWangPlanData(gruppeId)
    : undefined;

  // Elevdata (klasse, og HCP/kategori/Fireukerssjekk bare for elever som har delt med treneren).
  const elevIder = live.elever.filter((e) => e.rolle === "PLAYER").map((e) => e.id);
  const elevdata = aktivtOmraade === "elever" ? await hentWangElevdata(gruppeId, elevIder) : undefined;
  const fireukerssjekk =
    aktivtOmraade === "elever" && params.fane === "sjekk" && params.id && elevIder.includes(params.id)
      ? await hentWangFireukerssjekk(gruppeId, params.id)
      : undefined;

  // Opptak og koordinering (kandidater er mindreårige) bare for sportssjef, bare på de to fanene.
  const opptak =
    erAdmin && (params.fane === "opptak" || params.fane === "skolene")
      ? await hentWangOpptak(gruppeId, opptakSkoleaar(osloIdagIso()))
      : undefined;

  // Data Golf bare for coach-rollen (kanSeDataGolf), aldri for elever.
  const dgSide = aktivtOmraade === "konkurranse" ? dgSideFraFane(params.fane) : null;
  const elevSide = dgSide === "spiller" || dgSide === "innspill" || dgSide === "forslag" ? dgSide : null;
  let dataGolf: WangDataGolfData | undefined;
  if (dgSide && kanSeDataGolf(bruker)) {
    dataGolf = elevSide
      ? (await hentWangDgElev(bruker, gruppeId, elevSide, { spiller: params.spiller, pro: params.pro })) ?? undefined
      : dgSide !== "spiller" && dgSide !== "innspill" && dgSide !== "forslag"
        ? await hentWangDataGolf(dgSide, { id: params.id, sok: params.sok, tour: params.tour, norske: params.norske, kat: params.kat, aar: params.aar })
        : undefined;
  }

  return (
    <WangCoachKlient
      omraade={aktivtOmraade}
      fane={params.fane}
      oktId={params.okt}
      id={params.id}
      rolle={rolle}
      brukerNavn={bruker.name ?? undefined}
      tester={tester}
      plan={plan}
      elevdata={elevdata}
      fireukerssjekk={fireukerssjekk}
      dataGolf={dataGolf}
      opptak={opptak}
      data={byggWangTrenerData(live, osloIdagIso(), osloNaaTid())}
    />
  );
}

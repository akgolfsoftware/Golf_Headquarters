import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesNavngitteProfiler } from "@/lib/deling/profil-lesing";
import { hentWangTestresultatSkolerForTrener } from "@/lib/portal-tester/wang-resultat-tilgang";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { hentOrgGruppeOppgaver } from "@/lib/domain/org-gruppeoppgaver";
import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import { WANG_TOPPIDRETT_SLUG } from "@/app/team-wang/_data/wang-tilgang";
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

  let kalender = await hentGruppeKalenderData(live.gruppeNavn, WANG_TOPPIDRETT_SLUG);
  if (!kalender || kalender.gruppeId !== gruppeId) notFound();
  // GroupPeriodBlock is the editor's actual period source. Keep curriculum links
  // from TrainingPeriod only when dates match; do not invent associations.
  if (live.perioder?.length) {
    const faseNavn: Record<string, string> = { GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", SPESIALISERING: "Spesialperiode", TURNERING: "Turneringsperiode", FERIE: "Ferie", TESTUKE: "Testuke", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling", RESTITUSJON: "Restitusjon" };
    kalender = { ...kalender, perioder: live.perioder.map(p => {
      const slutt = new Date(`${p.endIso}T12:00:00Z`); slutt.setUTCDate(slutt.getUTCDate() + 1);
      const endDate = slutt.toISOString().slice(0,10);
      const eksisterende = kalender!.perioder.find(k => k.startDate.slice(0,10) === p.startIso && k.endDate.slice(0,10) === endDate);
      return { id: p.id, name: faseNavn[p.fase] ?? "Periode", startDate: p.startIso, endDate, note: p.fokus, tone: null, kompetansemal: eksisterende?.kompetansemal ?? [] };
    }) };
  }
  const kanPublisere = await canUser(bruker, Capability.EDIT_GROUP_PLANS);
  const gruppeOppgaver = await hentOrgGruppeOppgaver({ groupId: gruppeId });

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

  const gruppepostSide = aktivtOmraade === "meldinger" ? await hentGruppepostSide(gruppeId, bruker.id) : null;
  const innlegg = gruppepostSide?.tidslinje.map(p => ({ id: p.id, forfatter: p.authorNavn, tekst: p.tekst, tidspunkt: p.createdAt.toISOString(), endret: p.editedAt !== null, lest: p.kvittering?.apnet ?? 0, mottakere: p.kvittering?.totalt ?? 0, vedlegg: p.vedlegg.map(v => ({ id: v.id, navn: v.fileName })) })) ?? [];

  const [delteProfiler, testskoler] = await Promise.all([
    lesNavngitteProfiler(bruker.id, gruppeId, async (_tx, id) => ({ id })),
    hentWangTestresultatSkolerForTrener(bruker),
  ]);
  const profilId = new Set(delteProfiler.map(p => p.id));
  const testId = new Set(testskoler.filter(s => s.groupId === gruppeId).flatMap(s => s.playerIds));
  const elever = live.elever
    .filter((e) => e.rolle === "PLAYER")
    .map((e) => ({ id: e.id, navn: e.navn, trinn: e.trinn ?? null, kanSeProfil: profilId.has(e.id), delerTester: testId.has(e.id) }));

  return (
    <WangCoachKlient
      omraade={params.visArsplan === "1" ? "trening" : aktivtOmraade}
      fane={params.visArsplan === "1" ? "ar" : params.fane}
      rolle={rolle}
      brukerNavn={bruker.name ?? undefined}
      elever={elever}
      live={live}
      kalender={kalender}
      kanPublisere={kanPublisere}
      innlegg={innlegg}
      meldingsTilgang={gruppepostSide !== null}
      gruppeOppgaver={gruppeOppgaver.ok ? gruppeOppgaver.data : null}
      oppgaveFeil={gruppeOppgaver.ok ? undefined : gruppeOppgaver.error}
      campus="Fredrikstad"
    />
  );
}
